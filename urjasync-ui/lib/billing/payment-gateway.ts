import { Payment, PaymentMethod, PaymentGateway, PaymentStatus, GatewayResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PaymentGatewayManager {
  private payments: Map<string, Payment> = new Map();
  private gateways: Map<PaymentGateway, GatewayProvider> = new Map();
  // private _webhooks: Map<string, WebhookHandler> = new Map();

  constructor() {
    this.initializeGateways();
  }

  // Payment Processing
  async processPayment(paymentData: PaymentRequest): Promise<Payment> {
    try {
      const payment: Payment = {
        id: uuidv4(),
        billId: paymentData.billId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        method: paymentData.method,
        status: 'pending',
        gateway: paymentData.gateway,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store payment
      this.payments.set(payment.id, payment);

      // Process with gateway
      const gatewayProvider = this.gateways.get(paymentData.gateway);
      if (!gatewayProvider) {
        throw new Error(`Payment gateway ${paymentData.gateway} not supported`);
      }

      const gatewayResponse = await gatewayProvider.processPayment(payment);
      
      // Update payment with gateway response
      payment.gatewayResponse = gatewayResponse;
      payment.transactionId = gatewayResponse.transactionId;
      payment.status = this.mapGatewayStatusToPaymentStatus(gatewayResponse.status);
      
      if (payment.status === 'completed') {
        payment.processedAt = new Date();
      } else if (payment.status === 'failed') {
        payment.failedAt = new Date();
        payment.failureReason = gatewayResponse.status;
      }

      payment.updatedAt = new Date();

      return payment;
    } catch (error) {
      throw new Error(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refundPayment(paymentId: string, amount?: number, _reason?: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    const gatewayProvider = this.gateways.get(payment.gateway);
    if (!gatewayProvider) {
      throw new Error(`Payment gateway ${payment.gateway} not supported`);
    }

    const refundAmount = amount || payment.amount;
    const refundResponse = await gatewayProvider.processRefund(payment, refundAmount);

    // Update payment with refund details
    payment.refundStatus = 'completed';
    payment.refundAmount = refundAmount;
    payment.refundId = refundResponse.transactionId;
    payment.updatedAt = new Date();

    return payment;
  }

  async retryPayment(paymentId: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'failed') {
      throw new Error('Only failed payments can be retried');
    }

    // Reset payment status
    payment.status = 'pending';
    payment.failureReason = undefined;
    payment.updatedAt = new Date();

    // Process payment again
    const gatewayProvider = this.gateways.get(payment.gateway);
    if (!gatewayProvider) {
      throw new Error(`Payment gateway ${payment.gateway} not supported`);
    }

    const gatewayResponse = await gatewayProvider.processPayment(payment);
    
    payment.gatewayResponse = gatewayResponse;
    payment.transactionId = gatewayResponse.transactionId;
    payment.status = this.mapGatewayStatusToPaymentStatus(gatewayResponse.status);
    
    if (payment.status === 'completed') {
      payment.processedAt = new Date();
    } else if (payment.status === 'failed') {
      payment.failedAt = new Date();
      payment.failureReason = gatewayResponse.status;
    }

    payment.updatedAt = new Date();

    return payment;
  }

  // Payment Retrieval
  getPayment(paymentId: string): Payment | undefined {
    return this.payments.get(paymentId);
  }

  getUserPayments(userId: string, filters?: PaymentFilters): Payment[] {
    const userPayments = Array.from(this.payments.values())
      .filter(payment => payment.userId === userId);

    return this.applyPaymentFilters(userPayments, filters);
  }

  getPaymentsByStatus(status: PaymentStatus): Payment[] {
    return Array.from(this.payments.values())
      .filter(payment => payment.status === status);
  }

  getPaymentsByGateway(gateway: PaymentGateway): Payment[] {
    return Array.from(this.payments.values())
      .filter(payment => payment.gateway === gateway);
  }

  // Payment Analytics
  getPaymentAnalytics(period?: { startDate: Date; endDate: Date }): PaymentAnalytics {
    const payments = Array.from(this.payments.values());
    
    const filteredPayments = period 
      ? payments.filter(payment => payment.createdAt >= period.startDate && payment.createdAt <= period.endDate)
      : payments;

    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const successfulPayments = filteredPayments.filter(payment => payment.status === 'completed');
    const failedPayments = filteredPayments.filter(payment => payment.status === 'failed');
    const refundedPayments = filteredPayments.filter(payment => payment.refundStatus === 'completed');

    const successRate = filteredPayments.length > 0 
      ? (successfulPayments.length / filteredPayments.length) * 100 
      : 0;

    const paymentsByMethod = filteredPayments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {} as Record<PaymentMethod, number>);

    const paymentsByGateway = filteredPayments.reduce((acc, payment) => {
      acc[payment.gateway] = (acc[payment.gateway] || 0) + 1;
      return acc;
    }, {} as Record<PaymentGateway, number>);

    return {
      totalPayments: filteredPayments.length,
      totalAmount,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      refundedPayments: refundedPayments.length,
      successRate,
      averageAmount: filteredPayments.length > 0 ? totalAmount / filteredPayments.length : 0,
      paymentsByMethod,
      paymentsByGateway
    };
  }

  // Webhook Handling
  async handleWebhook(gateway: PaymentGateway, payload: any, signature?: string): Promise<WebhookResult> {
    const gatewayProvider = this.gateways.get(gateway);
    if (!gatewayProvider) {
      throw new Error(`Payment gateway ${gateway} not supported`);
    }

    // Verify webhook signature
    if (signature && !gatewayProvider.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook
    const webhookData = gatewayProvider.parseWebhook(payload);
    
    // Update payment status based on webhook
    if (webhookData.paymentId) {
      const payment = this.payments.get(webhookData.paymentId);
      if (payment) {
        payment.status = webhookData.status;
        payment.gatewayResponse = webhookData.gatewayResponse;
        payment.updatedAt = new Date();
        
        if (payment.status === 'completed') {
          payment.processedAt = new Date();
        } else if (payment.status === 'failed') {
          payment.failedAt = new Date();
          payment.failureReason = webhookData.reason;
        }
      }
    }

    return {
      processed: true,
      paymentId: webhookData.paymentId,
      status: webhookData.status
    };
  }

  // Utility Methods
  private initializeGateways(): void {
    this.gateways.set('razorpay', new RazorpayProvider());
    // this.gateways.set('paytm', new PaytmProvider());
    // this.gateways.set('phonepe', new PhonePeProvider());
    // this.gateways.set('stripe', new StripeProvider());
  }

  private mapGatewayStatusToPaymentStatus(gatewayStatus: string): PaymentStatus {
    switch (gatewayStatus.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'captured':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      case 'pending':
      case 'processing':
        return 'processing';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private applyPaymentFilters(payments: Payment[], filters?: PaymentFilters): Payment[] {
    if (!filters) return payments;

    return payments.filter(payment => {
      if (filters.status && payment.status !== filters.status) return false;
      if (filters.method && payment.method !== filters.method) return false;
      if (filters.gateway && payment.gateway !== filters.gateway) return false;
      if (filters.minAmount && payment.amount < filters.minAmount) return false;
      if (filters.maxAmount && payment.amount > filters.maxAmount) return false;
      if (filters.period) {
        if (payment.createdAt < filters.period.startDate || payment.createdAt > filters.period.endDate) return false;
      }
      return true;
    });
  }
}

// Gateway Provider Interface
abstract class GatewayProvider {
  abstract processPayment(payment: Payment): Promise<GatewayResponse>;
  abstract processRefund(payment: Payment, amount: number): Promise<GatewayResponse>;
  abstract verifyWebhookSignature(payload: any, signature: string): boolean;
  abstract parseWebhook(payload: any): WebhookData;
}

// Razorpay Provider
class RazorpayProvider extends GatewayProvider {
  async processPayment(payment: Payment): Promise<GatewayResponse> {
    // Mock Razorpay implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        resolve({
          status: success ? 'success' : 'failed',
          transactionId: `rzp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: new Date(),
          metadata: {
            method: payment.method,
            gateway: 'razorpay'
          }
        });
      }, 2000);
    });
  }

  async processRefund(payment: Payment, amount: number): Promise<GatewayResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          transactionId: `rzp_refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          currency: payment.currency,
          timestamp: new Date()
        });
      }, 1500);
    });
  }

  verifyWebhookSignature(_payload: any, signature: string): boolean {
    // Mock signature verification
    return signature.length > 20;
  }

  parseWebhook(payload: any): WebhookData {
    return {
      paymentId: payload.payment_id,
      status: payload.status === 'captured' ? 'completed' : 'failed',
      gatewayResponse: {
        status: payload.status,
        transactionId: payload.payment_id,
        timestamp: new Date()
      },
      reason: payload.failure_reason
    };
  }
}




// Supporting Types
interface PaymentRequest {
  billId: string;
  userId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  gateway: PaymentGateway;
}

interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  gateway?: PaymentGateway;
  minAmount?: number;
  maxAmount?: number;
  period?: { startDate: Date; endDate: Date };
}

interface PaymentAnalytics {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  successRate: number;
  averageAmount: number;
  paymentsByMethod: Record<PaymentMethod, number>;
  paymentsByGateway: Record<PaymentGateway, number>;
}

interface WebhookData {
  paymentId?: string;
  status: PaymentStatus;
  gatewayResponse?: GatewayResponse;
  reason?: string;
}

interface WebhookResult {
  processed: boolean;
  paymentId?: string;
  status?: PaymentStatus;
}


// Singleton instance
let paymentGatewayInstance: PaymentGatewayManager | null = null;

export function getPaymentGateway(): PaymentGatewayManager {
  if (!paymentGatewayInstance) {
    paymentGatewayInstance = new PaymentGatewayManager();
  }
  return paymentGatewayInstance;
}
