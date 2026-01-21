import { NextRequest, NextResponse } from 'next/server';
import { getBillProcessor } from '../../../../lib/billing/bill-processor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const billId = searchParams.get('billId');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const billType = searchParams.get('billType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const type = searchParams.get('type');
    
    const billProcessor = getBillProcessor();
    
    switch (type) {
      case 'analytics':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for analytics' },
            { status: 400 }
          );
        }
        
        const analyticsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : undefined;
        
        const analytics = billProcessor.getBillAnalytics(userId, analyticsPeriod);
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'overdue':
        const overdueBills = billProcessor.getOverdueBills();
        return NextResponse.json({
          success: true,
          data: overdueBills
        });
        
      case 'upcoming':
        const days = parseInt(searchParams.get('days') || '7');
        const upcomingBills = billProcessor.getUpcomingBills(days);
        return NextResponse.json({
          success: true,
          data: upcomingBills
        });
        
      case 'status':
        const statusBills = billProcessor.getBillsByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: statusBills
        });
        
      default:
        if (billId) {
          // Get specific bill
          const bill = billProcessor.getBill(billId);
          if (!bill) {
            return NextResponse.json(
              { success: false, error: 'Bill not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: bill
          });
        }
        
        if (userId) {
          // Get user bills with filters
          const filters = {
            status: status as any,
            provider: provider || undefined,
            billType: billType as any,
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : undefined,
            minAmount: minAmount ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
          };
          
          const userBills = billProcessor.getUserBills(userId, filters);
          return NextResponse.json({
            success: true,
            data: userBills,
            count: userBills.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing billId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, attachmentData, billId, updates } = body;
    
    const billProcessor = getBillProcessor();
    
    switch (action) {
      case 'upload_bill':
        if (!attachmentData || !attachmentData.fileName || !attachmentData.fileData || !attachmentData.userId) {
          return NextResponse.json(
            { success: false, error: 'Missing required attachment data' },
            { status: 400 }
          );
        }
        
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(attachmentData.fileData, 'base64');
        
        const attachment = await billProcessor.processBillUpload(
          fileBuffer,
          attachmentData.fileName,
          attachmentData.userId
        );
        
        return NextResponse.json({
          success: true,
          data: attachment,
          message: 'Bill uploaded successfully'
        });
        
      case 'create_bill':
        if (!attachmentData || !attachmentData.attachmentId || !attachmentData.userId) {
          return NextResponse.json(
            { success: false, error: 'Missing attachment data' },
            { status: 400 }
          );
        }
        
        const bill = await billProcessor.createBillFromAttachment(
          attachmentData.attachmentId,
          attachmentData.userId,
          attachmentData.manualData
        );
        
        return NextResponse.json({
          success: true,
          data: bill,
          message: 'Bill created successfully'
        });
        
      case 'update_bill':
        if (!billId || !updates) {
          return NextResponse.json(
            { success: false, error: 'Missing billId or updates' },
            { status: 400 }
          );
        }
        
        const updatedBill = await billProcessor.updateBill(billId, updates);
        return NextResponse.json({
          success: true,
          data: updatedBill,
          message: 'Bill updated successfully'
        });
        
      case 'delete_bill':
        if (!billId) {
          return NextResponse.json(
            { success: false, error: 'Missing billId' },
            { status: 400 }
          );
        }
        
        const deleted = await billProcessor.deleteBill(billId);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Bill not found or cannot be deleted' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Bill deleted successfully'
        });
        
      case 'match_payment':
        if (!billId || !body.paymentAmount || !body.paymentDate) {
          return NextResponse.json(
            { success: false, error: 'Missing billId, paymentAmount, or paymentDate' },
            { status: 400 }
          );
        }
        
        const matchResult = await billProcessor.matchBillWithPayment(
          billId,
          parseFloat(body.paymentAmount),
          new Date(body.paymentDate)
        );
        
        return NextResponse.json({
          success: true,
          data: matchResult
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: upload_bill, create_bill, update_bill, delete_bill, match_payment' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing bills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage bills' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId, updates } = body;
    
    if (!billId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing billId or updates' },
        { status: 400 }
      );
    }
    
    const billProcessor = getBillProcessor();
    const updatedBill = await billProcessor.updateBill(billId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedBill,
      message: 'Bill updated successfully'
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('billId');
    
    if (!billId) {
      return NextResponse.json(
        { success: false, error: 'Missing billId' },
        { status: 400 }
      );
    }
    
    const billProcessor = getBillProcessor();
    const deleted = await billProcessor.deleteBill(billId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Bill not found or cannot be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
}
