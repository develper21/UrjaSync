import { NextRequest, NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/billing/payment-gateway';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const gateway = searchParams.get('gateway');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const type = searchParams.get('type');
    
    const paymentGateway = getPaymentGateway();
    
    switch (type) {
      case 'analytics':
        const analyticsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : undefined;
        
        const analytics = paymentGateway.getPaymentAnalytics(analyticsPeriod);
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'status':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Missing status parameter' },
            { status: 400 }
          );
        }
        
        const statusPayments = paymentGateway.getPaymentsByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: statusPayments,
          count: statusPayments.length
        });
        
      case 'gateway':
        if (!gateway) {
          return NextResponse.json(
            { success: false, error: 'Missing gateway parameter' },
            { status: 400 }
          );
        }
        
        const gatewayPayments = paymentGateway.getPaymentsByGateway(gateway as any);
        return NextResponse.json({
          success: true,
          data: gatewayPayments,
          count: gatewayPayments.length
        });
        
      default:
        if (paymentId) {
          // Get specific payment
          const payment = paymentGateway.getPayment(paymentId);
          if (!payment) {
            return NextResponse.json(
              { success: false, error: 'Payment not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: payment
          });
        }
        
        if (userId) {
          // Get user payments with filters
          const filters = {
            status: status as any,
            method: method as any,
            gateway: gateway as any,
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : undefined,
            minAmount: minAmount ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
          };
          
          const userPayments = paymentGateway.getUserPayments(userId, filters);
          return NextResponse.json({
            success: true,
            data: userPayments,
            count: userPayments.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing paymentId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, paymentData, paymentId, amount, reason } = body;
    
    const paymentGateway = getPaymentGateway();
    
    switch (action) {
      case 'process_payment':
        if (!paymentData || !paymentData.billId || !paymentData.userId || !paymentData.amount || !paymentData.method || !paymentData.gateway) {
          return NextResponse.json(
            { success: false, error: 'Missing required payment data' },
            { status: 400 }
          );
        }
        
        const payment = await paymentGateway.processPayment(paymentData);
        return NextResponse.json({
          success: true,
          data: payment,
          message: 'Payment processed successfully'
        });
        
      case 'refund_payment':
        if (!paymentId) {
          return NextResponse.json(
            { success: false, error: 'Missing paymentId' },
            { status: 400 }
          );
        }
        
        const refundAmount = amount ? parseFloat(amount) : undefined;
        const refundReason = reason || 'Customer requested refund';
        
        const refundedPayment = await paymentGateway.refundPayment(paymentId, refundAmount, refundReason);
        return NextResponse.json({
          success: true,
          data: refundedPayment,
          message: 'Payment refunded successfully'
        });
        
      case 'retry_payment':
        if (!paymentId) {
          return NextResponse.json(
            { success: false, error: 'Missing paymentId' },
            { status: 400 }
          );
        }
        
        const retriedPayment = await paymentGateway.retryPayment(paymentId);
        return NextResponse.json({
          success: true,
          data: retriedPayment,
          message: 'Payment retry initiated'
        });
        
      case 'webhook':
        if (!paymentData.gateway || !paymentData.payload) {
          return NextResponse.json(
            { success: false, error: 'Missing gateway or payload for webhook' },
            { status: 400 }
          );
        }
        
        const webhookResult = await paymentGateway.handleWebhook(
          paymentData.gateway as any,
          paymentData.payload,
          paymentData.signature
        );
        
        return NextResponse.json({
          success: true,
          data: webhookResult,
          message: 'Webhook processed successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: process_payment, refund_payment, retry_payment, webhook' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage payments' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, action } = body;
    
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing paymentId' },
        { status: 400 }
      );
    }
    
    const paymentGateway = getPaymentGateway();
    
    switch (action) {
      case 'retry':
        const retriedPayment = await paymentGateway.retryPayment(paymentId);
        return NextResponse.json({
          success: true,
          data: retriedPayment,
          message: 'Payment retry initiated'
        });
        
      case 'refund':
        const amount = body.amount ? parseFloat(body.amount) : undefined;
        const reason = body.reason || 'Customer requested refund';
        
        const refundedPayment = await paymentGateway.refundPayment(paymentId, amount, reason);
        return NextResponse.json({
          success: true,
          data: refundedPayment,
          message: 'Payment refunded successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: retry, refund' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
