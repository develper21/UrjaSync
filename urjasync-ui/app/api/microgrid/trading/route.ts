import { NextRequest, NextResponse } from 'next/server';
import { loadMicrogridState, saveMicrogridState } from '../../../../lib/server/microgridStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const communityId = searchParams.get('communityId');
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');
    
    const snapshot = await loadMicrogridState();
    
    switch (type) {
      case 'history':
        const history = getTradeHistory(snapshot, communityId || undefined, memberId || undefined, status || undefined);
        return NextResponse.json({
          success: true,
          data: history
        });
        
      case 'market':
        const marketData = getMarketData(snapshot);
        return NextResponse.json({
          success: true,
          data: marketData
        });
        
      case 'portfolio':
        if (!memberId) {
          return NextResponse.json(
            { success: false, error: 'Missing memberId for portfolio data' },
            { status: 400 }
          );
        }
        
        const portfolio = getMemberPortfolio(snapshot, memberId);
        return NextResponse.json({
          success: true,
          data: portfolio
        });
        
      default:
        const recentTrades = snapshot.recentTrades;
        return NextResponse.json({
          success: true,
          data: recentTrades
        });
    }
  } catch (error) {
    console.error('Error fetching trading data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trading data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, trade } = body;
    
    const snapshot = await loadMicrogridState();
    
    switch (action) {
      case 'create_trade':
        if (!trade) {
          return NextResponse.json(
            { success: false, error: 'Missing trade data' },
            { status: 400 }
          );
        }
        
        const newTrade = createTrade(snapshot, trade);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: newTrade,
          message: 'Trade created successfully'
        });
        
      case 'execute_trade':
        if (!trade || !trade.id) {
          return NextResponse.json(
            { success: false, error: 'Missing trade ID' },
            { status: 400 }
          );
        }
        
        const executedTrade = executeTrade(snapshot, trade.id);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: executedTrade,
          message: 'Trade executed successfully'
        });
        
      case 'cancel_trade':
        if (!trade || !trade.id) {
          return NextResponse.json(
            { success: false, error: 'Missing trade ID' },
            { status: 400 }
          );
        }
        
        const cancelledTrade = cancelTrade(snapshot, trade.id);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: cancelledTrade,
          message: 'Trade cancelled successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create_trade, execute_trade, cancel_trade' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage trades' },
      { status: 500 }
    );
  }
}

function getTradeHistory(snapshot: any, communityId?: string, memberId?: string, status?: string): any[] {
  let trades = snapshot.recentTrades;
  
  if (communityId) {
    trades = trades.filter((trade: any) => trade.communityId === communityId);
  }
  
  if (memberId) {
    trades = trades.filter((trade: any) => trade.buyerId === memberId || trade.sellerId === memberId);
  }
  
  if (status) {
    trades = trades.filter((trade: any) => trade.status === status);
  }
  
  return trades.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getMarketData(snapshot: any): any {
  const trades = snapshot.recentTrades.filter((trade: any) => trade.status === 'Settled');
  
  const currentPrice = trades.length > 0 
    ? trades.reduce((sum: number, trade: any) => sum + trade.pricePerKwh, 0) / trades.length
    : 5.5; // Default market price
  
  const volume24h = trades
    .filter((trade: any) => {
      const tradeTime = new Date(trade.timestamp).getTime();
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return tradeTime > dayAgo;
    })
    .reduce((sum: number, trade: any) => sum + trade.amountKwh, 0);
  
  const topBuyers = trades
    .reduce((acc: any, trade: any) => {
      acc[trade.buyerId] = (acc[trade.buyerId] || 0) + trade.amountKwh;
      return acc;
    }, {});
  
  const topSellers = trades
    .reduce((acc: any, trade: any) => {
      acc[trade.sellerId] = (acc[trade.sellerId] || 0) + trade.amountKwh;
      return acc;
    }, {});
  
  return {
    currentPrice: Number(currentPrice.toFixed(2)),
    volume24h: Number(volume24h.toFixed(2)),
    priceChange: Number((Math.random() - 0.5) * 2).toFixed(2),
    topBuyers: Object.entries(topBuyers)
      .map(([id, volume]) => ({ memberId: id, volume: Number(volume) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5),
    topSellers: Object.entries(topSellers)
      .map(([id, volume]) => ({ memberId: id, volume: Number(volume) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5),
    marketStatus: 'Active',
    lastUpdated: new Date().toISOString()
  };
}

function getMemberPortfolio(snapshot: any, memberId: string): any {
  const memberTrades = snapshot.recentTrades.filter(
    (trade: any) => trade.buyerId === memberId || trade.sellerId === memberId
  );
  
  const boughtEnergy = memberTrades
    .filter((trade: any) => trade.buyerId === memberId && trade.status === 'Settled')
    .reduce((sum: number, trade: any) => sum + trade.amountKwh, 0);
  
  const soldEnergy = memberTrades
    .filter((trade: any) => trade.sellerId === memberId && trade.status === 'Settled')
    .reduce((sum: number, trade: any) => sum + trade.amountKwh, 0);
  
  const pendingTrades = memberTrades.filter((trade: any) => trade.status === 'Pending');
  
  const totalSpent = memberTrades
    .filter((trade: any) => trade.buyerId === memberId && trade.status === 'Settled')
    .reduce((sum: number, trade: any) => sum + (trade.amountKwh * trade.pricePerKwh), 0);
  
  const totalEarned = memberTrades
    .filter((trade: any) => trade.sellerId === memberId && trade.status === 'Settled')
    .reduce((sum: number, trade: any) => sum + (trade.amountKwh * trade.pricePerKwh), 0);
  
  return {
    memberId,
    boughtEnergy: Number(boughtEnergy.toFixed(2)),
    soldEnergy: Number(soldEnergy.toFixed(2)),
    netEnergy: Number((soldEnergy - boughtEnergy).toFixed(2)),
    pendingTrades: pendingTrades.length,
    totalSpent: Number(totalSpent.toFixed(2)),
    totalEarned: Number(totalEarned.toFixed(2)),
    netProfit: Number((totalEarned - totalSpent).toFixed(2)),
    averagePrice: boughtEnergy > 0 ? Number((totalSpent / boughtEnergy).toFixed(2)) : 0,
    lastUpdated: new Date().toISOString()
  };
}

function createTrade(snapshot: any, tradeData: any): any {
  const newTrade = {
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...tradeData,
    status: 'Pending',
    timestamp: new Date().toISOString(),
    createdAt: Date.now()
  };
  
  snapshot.recentTrades.unshift(newTrade);
  
  // Keep only last 100 trades
  if (snapshot.recentTrades.length > 100) {
    snapshot.recentTrades = snapshot.recentTrades.slice(0, 100);
  }
  
  return newTrade;
}

function executeTrade(snapshot: any, tradeId: string): any {
  const tradeIndex = snapshot.recentTrades.findIndex((trade: any) => trade.id === tradeId);
  
  if (tradeIndex === -1) {
    throw new Error('Trade not found');
  }
  
  const trade = snapshot.recentTrades[tradeIndex];
  
  if (trade.status !== 'Pending') {
    throw new Error('Trade cannot be executed - not in pending status');
  }
  
  // Update trade status
  trade.status = 'Settled';
  trade.executedAt = new Date().toISOString();
  
  return trade;
}

function cancelTrade(snapshot: any, tradeId: string): any {
  const tradeIndex = snapshot.recentTrades.findIndex((trade: any) => trade.id === tradeId);
  
  if (tradeIndex === -1) {
    throw new Error('Trade not found');
  }
  
  const trade = snapshot.recentTrades[tradeIndex];
  
  if (trade.status !== 'Pending') {
    throw new Error('Trade cannot be cancelled - not in pending status');
  }
  
  // Update trade status
  trade.status = 'Cancelled';
  trade.cancelledAt = new Date().toISOString();
  
  return trade;
}
