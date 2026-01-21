import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceGenerator } from '../../../../lib/billing/invoice-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const action = searchParams.get('action');
    
    const invoiceGenerator = getInvoiceGenerator();
    
    switch (action) {
      case 'analytics':
        const analyticsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : undefined;
        
        const analytics = invoiceGenerator.getInvoiceAnalytics(analyticsPeriod);
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
        
        const statusInvoices = invoiceGenerator.getInvoicesByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: statusInvoices,
          count: statusInvoices.length
        });
        
      case 'type':
        if (!type) {
          return NextResponse.json(
            { success: false, error: 'Missing type parameter' },
            { status: 400 }
          );
        }
        
        const typeInvoices = invoiceGenerator.getInvoicesByType(type as any);
        return NextResponse.json({
          success: true,
          data: typeInvoices,
          count: typeInvoices.length
        });
        
      default:
        if (invoiceId) {
          // Get specific invoice
          const invoice = invoiceGenerator.getInvoice(invoiceId);
          if (!invoice) {
            return NextResponse.json(
              { success: false, error: 'Invoice not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: invoice
          });
        }
        
        if (userId) {
          // Get user invoices with filters
          const filters = {
            status: status as any,
            type: type as any,
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : undefined,
            minAmount: minAmount ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
          };
          
          const userInvoices = invoiceGenerator.getUserInvoices(userId, filters);
          return NextResponse.json({
            success: true,
            data: userInvoices,
            count: userInvoices.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing invoiceId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, invoiceData } = body;
    
    const invoiceGenerator = getInvoiceGenerator();
    
    switch (action) {
      case 'generate_bill_invoice':
        if (!invoiceData.billId) {
          return NextResponse.json(
            { success: false, error: 'Missing billId' },
            { status: 400 }
          );
        }
        
        // Get bill details (mock implementation)
        const bill = {
          id: invoiceData.billId,
          userId: invoiceData.userId || 'user_1',
          amount: invoiceData.amount || 1000,
          currency: invoiceData.currency || 'INR',
          provider: invoiceData.provider || 'Electricity Board',
          billNumber: invoiceData.billNumber || 'EB123456',
          dueDate: new Date(invoiceData.dueDate || Date.now() + 15 * 24 * 60 * 60 * 1000),
          consumptionData: invoiceData.consumptionData,
          tariffDetails: invoiceData.tariffDetails
        } as any;
        
        const billInvoice = await invoiceGenerator.generateBillPaymentInvoice(bill, invoiceData.paymentId);
        return NextResponse.json({
          success: true,
          data: billInvoice,
          message: 'Bill payment invoice generated successfully'
        });
        
      case 'generate_subscription_invoice':
        if (!invoiceData.subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId' },
            { status: 400 }
          );
        }
        
        // Get subscription details (mock implementation)
        const subscription = {
          id: invoiceData.subscriptionId,
          userId: invoiceData.userId || 'user_1',
          amount: invoiceData.amount || 299,
          currency: invoiceData.currency || 'INR',
          name: invoiceData.name || 'Pro Plan',
          billingCycle: invoiceData.billingCycle || 'monthly',
          nextBillingDate: new Date(invoiceData.nextBillingDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
          features: invoiceData.features || []
        } as any;
        
        const subscriptionInvoice = await invoiceGenerator.generateSubscriptionInvoice(subscription);
        return NextResponse.json({
          success: true,
          data: subscriptionInvoice,
          message: 'Subscription invoice generated successfully'
        });
        
      case 'generate_service_invoice':
        if (!invoiceData.userId || !invoiceData.items || !invoiceData.dueDate) {
          return NextResponse.json(
            { success: false, error: 'Missing userId, items, or dueDate' },
            { status: 400 }
          );
        }
        
        const serviceInvoice = await invoiceGenerator.generateServiceInvoice(
          invoiceData.userId,
          invoiceData.items,
          new Date(invoiceData.dueDate),
          invoiceData.notes
        );
        
        return NextResponse.json({
          success: true,
          data: serviceInvoice,
          message: 'Service invoice generated successfully'
        });
        
      case 'generate_refund_invoice':
        if (!invoiceData.originalInvoiceId || !invoiceData.refundAmount) {
          return NextResponse.json(
            { success: false, error: 'Missing originalInvoiceId or refundAmount' },
            { status: 400 }
          );
        }
        
        const refundInvoice = await invoiceGenerator.generateRefundInvoice(
          invoiceData.originalInvoiceId,
          parseFloat(invoiceData.refundAmount),
          invoiceData.reason
        );
        
        return NextResponse.json({
          success: true,
          data: refundInvoice,
          message: 'Refund invoice generated successfully'
        });
        
      case 'send_invoice':
        if (!invoiceData.invoiceId || !invoiceData.deliveryMethods) {
          return NextResponse.json(
            { success: false, error: 'Missing invoiceId or deliveryMethods' },
            { status: 400 }
          );
        }
        
        const sentInvoice = await invoiceGenerator.sendInvoice(invoiceData.invoiceId, invoiceData.deliveryMethods);
        return NextResponse.json({
          success: true,
          data: sentInvoice,
          message: 'Invoice sent successfully'
        });
        
      case 'mark_paid':
        if (!invoiceData.invoiceId || !invoiceData.paymentId) {
          return NextResponse.json(
            { success: false, error: 'Missing invoiceId or paymentId' },
            { status: 400 }
          );
        }
        
        const paidInvoice = await invoiceGenerator.markInvoiceAsPaid(invoiceData.invoiceId, invoiceData.paymentId);
        return NextResponse.json({
          success: true,
          data: paidInvoice,
          message: 'Invoice marked as paid'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: generate_bill_invoice, generate_subscription_invoice, generate_service_invoice, generate_refund_invoice, send_invoice, mark_paid' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage invoices' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, updates } = body;
    
    if (!invoiceId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing invoiceId or updates' },
        { status: 400 }
      );
    }
    
    const invoiceGenerator = getInvoiceGenerator();
    const updatedInvoice = await invoiceGenerator.updateInvoice(invoiceId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, reason } = body;
    
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Missing invoiceId' },
        { status: 400 }
      );
    }
    
    const invoiceGenerator = getInvoiceGenerator();
    const cancelledInvoice = await invoiceGenerator.cancelInvoice(invoiceId, reason);
    
    return NextResponse.json({
      success: true,
      data: cancelledInvoice,
      message: 'Invoice cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel invoice' },
      { status: 500 }
    );
  }
}
