// Billing System Core Types and Interfaces

export interface Bill {
  id: string;
  userId: string;
  billNumber: string;
  provider: string;
  billType: 'electricity' | 'gas' | 'water' | 'internet' | 'other';
  billingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  meterReadings?: {
    previous: number;
    current: number;
    unit: string;
  };
  tariffDetails?: {
    peakRate: number;
    standardRate: number;
    offPeakRate: number;
    fixedCharges: number;
  };
  consumptionData?: {
    units: number;
    peakUnits: number;
    standardUnits: number;
    offPeakUnits: number;
  };
  attachments?: BillAttachment[];
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  paymentId?: string;
}

export interface BillAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
  extractedData?: ExtractedBillData;
}

export interface ExtractedBillData {
  extractedAt: Date;
  confidence: number;
  fields: {
    billNumber?: string;
    provider?: string;
    dueDate?: Date;
    amount?: number;
    period?: {
      startDate: Date;
      endDate: Date;
    };
    meterReadings?: {
      previous: number;
      current: number;
    };
    consumption?: number;
    tariff?: {
      peakRate: number;
      standardRate: number;
      offPeakRate: number;
    };
  };
}

export interface Payment {
  id: string;
  billId?: string;
  subscriptionId?: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gateway: PaymentGateway;
  transactionId?: string;
  gatewayResponse?: GatewayResponse;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  refundStatus?: 'none' | 'requested' | 'processing' | 'completed';
  refundAmount?: number;
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'net_banking'
  | 'upi'
  | 'wallet'
  | 'auto_debit'
  | 'cheque'
  | 'cash';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentGateway = 
  | 'razorpay'
  | 'paytm'
  | 'phonepe'
  | 'google_pay'
  | 'stripe'
  | 'paypal'
  | 'bank_transfer';

export interface GatewayResponse {
  status: string;
  transactionId?: string;
  gatewayTransactionId?: string;
  amount?: number;
  currency?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  type: 'bill_payment' | 'subscription' | 'service' | 'refund';
  billId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  taxes: InvoiceTax[];
  discounts: InvoiceDiscount[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category?: string;
}

export interface InvoiceTax {
  id: string;
  name: string;
  rate: number;
  amount: number;
  type: 'percentage' | 'fixed';
}

export interface InvoiceDiscount {
  id: string;
  name: string;
  amount: number;
  type: 'percentage' | 'fixed';
  reason?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  name: string;
  description?: string;
  status: SubscriptionStatus;
  type: SubscriptionType;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  features: SubscriptionFeature[];
  trialPeriod?: {
    startDate: Date;
    endDate: Date;
  };
  currentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  nextBillingDate: Date;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod;
  lastPaymentAt?: Date;
  nextPaymentAt?: Date;
  cancelledAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 
  | 'active'
  | 'trial'
  | 'past_due'
  | 'cancelled'
  | 'paused'
  | 'expired';

export type SubscriptionType = 
  | 'premium'
  | 'pro'
  | 'basic'
  | 'enterprise'
  | 'custom';

export type BillingCycle = 
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'
  | 'custom';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  usage?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: SubscriptionType;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  features: SubscriptionFeature[];
  trialDays?: number;
  setupFee?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface BillingAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalBills: number;
  paidBills: number;
  overdueBills: number;
  averageBillAmount: number;
  paymentMethods: PaymentMethodStats[];
  subscriptions: SubscriptionStats;
  revenueByPeriod: RevenueByPeriod[];
  topCustomers: CustomerStats[];
  churnRate: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  cancelled: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  mrr: number;
  arr: number;
  averageRevenuePerUser: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  subscriptions: number;
  oneTimePayments: number;
}

export interface CustomerStats {
  userId: string;
  name?: string;
  totalSpent: number;
  totalBills: number;
  subscriptionCount: number;
  averageBillAmount: number;
  lastPaymentDate?: Date;
  subscriptionStatus?: SubscriptionStatus;
}

export interface BillingNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel[];
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type NotificationType = 
  | 'bill_due'
  | 'bill_overdue'
  | 'payment_successful'
  | 'payment_failed'
  | 'subscription_renewal'
  | 'subscription_cancelled'
  | 'refund_processed'
  | 'invoice_generated'
  | 'payment_reminder'
  | 'trial_ending';

export type NotificationChannel = 
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'whatsapp';

export interface BillingSettings {
  userId: string;
  defaultPaymentMethod?: PaymentMethod;
  autoPayEnabled: boolean;
  paymentReminders: {
    enabled: boolean;
    daysBefore: number[];
  };
  invoiceDelivery: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  currency: string;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingReport {
  id: string;
  name: string;
  type: ReportType;
  period: {
    startDate: Date;
    endDate: Date;
  };
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'completed' | 'failed';
  generatedAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export type ReportType = 
  | 'billing_summary'
  | 'payment_report'
  | 'subscription_report'
  | 'revenue_report'
  | 'expense_report'
  | 'customer_report'
  | 'tax_report'
  | 'custom';

export interface TaxConfiguration {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  applicableTo: 'all' | 'bills' | 'subscriptions' | 'services';
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSchedule {
  id: string;
  userId: string;
  billId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  scheduledDate: Date;
  paymentMethod: PaymentMethod;
  status: 'scheduled' | 'processed' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  nextRetryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
