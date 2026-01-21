import { Invoice, InvoiceItem, InvoiceTax, InvoiceDiscount, Bill, Subscription } from './types';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceGenerator {
  private invoices: Map<string, Invoice> = new Map();
  private taxConfigurations: Map<string, TaxConfiguration> = new Map();
  private templates: Map<string, InvoiceTemplate> = new Map();

  constructor() {
    this.initializeTaxConfigurations();
    this.initializeTemplates();
  }

  // Invoice Generation
  async generateBillPaymentInvoice(bill: Bill, _paymentId: string): Promise<Invoice> {
    try {
      const invoiceNumber = this.generateInvoiceNumber('BILL');
      
      const invoice: Invoice = {
        id: uuidv4(),
        invoiceNumber,
        userId: bill.userId,
        type: 'bill_payment',
        billId: bill.id,
        amount: bill.amount,
        currency: bill.currency,
        status: 'draft',
        issuedAt: new Date(),
        dueAt: bill.dueDate,
        items: this.generateBillItems(bill),
        taxes: this.calculateTaxes(bill.amount, 'bill_payment'),
        discounts: [],
        subtotal: bill.amount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: bill.amount,
        notes: `Payment for ${bill.provider} bill - ${bill.billNumber}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      this.calculateInvoiceTotals(invoice);

      // Store invoice
      this.invoices.set(invoice.id, invoice);

      return invoice;
    } catch (error) {
      throw new Error(`Failed to generate bill payment invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSubscriptionInvoice(subscription: Subscription): Promise<Invoice> {
    try {
      const invoiceNumber = this.generateInvoiceNumber('SUB');
      
      const invoice: Invoice = {
        id: uuidv4(),
        invoiceNumber,
        userId: subscription.userId,
        type: 'subscription',
        subscriptionId: subscription.id,
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'draft',
        issuedAt: new Date(),
        dueAt: subscription.nextBillingDate,
        items: this.generateSubscriptionItems(subscription),
        taxes: this.calculateTaxes(subscription.amount, 'subscription'),
        discounts: this.calculateSubscriptionDiscounts(subscription),
        subtotal: subscription.amount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: subscription.amount,
        notes: `Subscription payment for ${subscription.name} - ${subscription.billingCycle}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      this.calculateInvoiceTotals(invoice);

      // Store invoice
      this.invoices.set(invoice.id, invoice);

      return invoice;
    } catch (error) {
      throw new Error(`Failed to generate subscription invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateServiceInvoice(userId: string, items: InvoiceItem[], dueDate: Date, notes?: string): Promise<Invoice> {
    try {
      const invoiceNumber = this.generateInvoiceNumber('SRV');
      
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      
      const invoice: Invoice = {
        id: uuidv4(),
        invoiceNumber,
        userId,
        type: 'service',
        amount: subtotal,
        currency: 'INR',
        status: 'draft',
        issuedAt: new Date(),
        dueAt: dueDate,
        items,
        taxes: this.calculateTaxes(subtotal, 'service'),
        discounts: [],
        subtotal,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: subtotal,
        notes: notes || 'Service invoice',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      this.calculateInvoiceTotals(invoice);

      // Store invoice
      this.invoices.set(invoice.id, invoice);

      return invoice;
    } catch (error) {
      throw new Error(`Failed to generate service invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateRefundInvoice(originalInvoiceId: string, refundAmount: number, reason: string): Promise<Invoice> {
    try {
      const originalInvoice = this.invoices.get(originalInvoiceId);
      if (!originalInvoice) {
        throw new Error('Original invoice not found');
      }

      const invoiceNumber = this.generateInvoiceNumber('REF');
      
      const invoice: Invoice = {
        id: uuidv4(),
        invoiceNumber,
        userId: originalInvoice.userId,
        type: 'refund',
        amount: -refundAmount, // Negative amount for refund
        currency: originalInvoice.currency,
        status: 'draft',
        issuedAt: new Date(),
        dueAt: new Date(),
        items: this.generateRefundItems(originalInvoice, refundAmount),
        taxes: [], // No taxes on refunds
        discounts: [],
        subtotal: -refundAmount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: -refundAmount,
        notes: `Refund for invoice ${originalInvoice.invoiceNumber}: ${reason}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store invoice
      this.invoices.set(invoice.id, invoice);

      return invoice;
    } catch (error) {
      throw new Error(`Failed to generate refund invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Invoice Management
  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'sent' || invoice.status === 'paid') {
      throw new Error('Cannot update invoice that has been sent or paid');
    }

    const updatedInvoice = {
      ...invoice,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate totals if items, taxes, or discounts changed
    if (updates.items || updates.taxes || updates.discounts) {
      this.calculateInvoiceTotals(updatedInvoice);
    }

    this.invoices.set(invoiceId, updatedInvoice);
    return updatedInvoice;
  }

  async sendInvoice(invoiceId: string, deliveryMethods: string[]): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'draft') {
      throw new Error('Only draft invoices can be sent');
    }

    // Send invoice via specified methods
    for (const method of deliveryMethods) {
      await this.sendInvoiceViaMethod(invoice, method);
    }

    // Update invoice status
    invoice.status = 'sent';
    invoice.updatedAt = new Date();

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  async markInvoiceAsPaid(invoiceId: string, _paymentId: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'sent') {
      throw new Error('Only sent invoices can be marked as paid');
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.updatedAt = new Date();

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  async cancelInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new Error('Cannot cancel paid invoice');
    }

    invoice.status = 'cancelled';
    invoice.notes = invoice.notes ? `${invoice.notes}\n\nCancelled: ${reason || 'No reason provided'}` : `Cancelled: ${reason || 'No reason provided'}`;
    invoice.updatedAt = new Date();

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  // Invoice Retrieval
  getInvoice(invoiceId: string): Invoice | undefined {
    return this.invoices.get(invoiceId);
  }

  getUserInvoices(userId: string, filters?: InvoiceFilters): Invoice[] {
    const userInvoices = Array.from(this.invoices.values())
      .filter(invoice => invoice.userId === userId);

    return this.applyInvoiceFilters(userInvoices, filters);
  }

  getInvoicesByStatus(status: Invoice['status']): Invoice[] {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.status === status);
  }

  getInvoicesByType(type: Invoice['type']): Invoice[] {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.type === type);
  }

  // Invoice Analytics
  getInvoiceAnalytics(period?: { startDate: Date; endDate: Date }): InvoiceAnalytics {
    const invoices = Array.from(this.invoices.values());
    
    const filteredInvoices = period 
      ? invoices.filter(invoice => invoice.createdAt >= period.startDate && invoice.createdAt <= period.endDate)
      : invoices;

    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid');
    const overdueInvoices = filteredInvoices.filter(invoice => 
      invoice.status === 'sent' && invoice.dueAt < new Date()
    );

    const invoicesByType = filteredInvoices.reduce((acc, invoice) => {
      acc[invoice.type] = (acc[invoice.type] || 0) + 1;
      return acc;
    }, {} as Record<Invoice['type'], number>);

    const revenueByType = filteredInvoices.reduce((acc, invoice) => {
      if (invoice.status === 'paid') {
        acc[invoice.type] = (acc[invoice.type] || 0) + invoice.totalAmount;
      }
      return acc;
    }, {} as Record<Invoice['type'], number>);

    return {
      totalInvoices: filteredInvoices.length,
      totalAmount,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      averageAmount: filteredInvoices.length > 0 ? totalAmount / filteredInvoices.length : 0,
      paymentRate: filteredInvoices.length > 0 ? (paidInvoices.length / filteredInvoices.length) * 100 : 0,
      invoicesByType,
      revenueByType
    };
  }

  // Utility Methods
  private initializeTaxConfigurations(): void {
    // GST configuration for India
    this.taxConfigurations.set('gst', {
      id: 'gst',
      name: 'Goods and Services Tax',
      rate: 18,
      type: 'percentage',
      applicableTo: 'all',
      isActive: true,
      effectiveFrom: new Date('2017-07-01'),
      description: 'Standard GST rate'
    });

    this.taxConfigurations.set('gst_reduced', {
      id: 'gst_reduced',
      name: 'Reduced GST',
      rate: 5,
      type: 'percentage',
      applicableTo: 'services',
      isActive: true,
      effectiveFrom: new Date('2017-07-01'),
      description: 'Reduced GST rate for certain services'
    });
  }

  private initializeTemplates(): void {
    this.templates.set('standard', {
      id: 'standard',
      name: 'Standard Invoice',
      layout: 'standard',
      includeLogo: true,
      includeBarcode: false,
      colorScheme: 'blue',
      footerText: 'Thank you for your business!'
    });

    this.templates.set('detailed', {
      id: 'detailed',
      name: 'Detailed Invoice',
      layout: 'detailed',
      includeLogo: true,
      includeBarcode: true,
      colorScheme: 'green',
      footerText: 'Detailed breakdown of charges and taxes'
    });
  }

  private generateInvoiceNumber(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
  }

  private generateBillItems(bill: Bill): InvoiceItem[] {
    const items: InvoiceItem[] = [];

    // Base consumption charge
    if (bill.consumptionData) {
      items.push({
        id: uuidv4(),
        description: `Energy consumption - ${bill.consumptionData.units} kWh`,
        quantity: bill.consumptionData.units,
        unitPrice: bill.tariffDetails?.standardRate || 5.8,
        amount: bill.consumptionData.units * (bill.tariffDetails?.standardRate || 5.8),
        category: 'consumption'
      });
    }

    // Fixed charges
    if (bill.tariffDetails?.fixedCharges) {
      items.push({
        id: uuidv4(),
        description: 'Fixed monthly charges',
        quantity: 1,
        unitPrice: bill.tariffDetails.fixedCharges,
        amount: bill.tariffDetails.fixedCharges,
        category: 'fixed'
      });
    }

    // Peak hour charges
    if (bill.consumptionData?.peakUnits && bill.tariffDetails?.peakRate) {
      items.push({
        id: uuidv4(),
        description: `Peak hour consumption - ${bill.consumptionData.peakUnits} kWh`,
        quantity: bill.consumptionData.peakUnits,
        unitPrice: bill.tariffDetails.peakRate,
        amount: bill.consumptionData.peakUnits * bill.tariffDetails.peakRate,
        category: 'peak'
      });
    }

    return items;
  }

  private generateSubscriptionItems(subscription: Subscription): InvoiceItem[] {
    return subscription.features.map(feature => ({
      id: uuidv4(),
      description: feature.name,
      quantity: 1,
      unitPrice: subscription.amount / subscription.features.length,
      amount: subscription.amount / subscription.features.length,
      category: 'subscription'
    }));
  }

  private generateRefundItems(originalInvoice: Invoice, refundAmount: number): InvoiceItem[] {
    // Proportionally distribute refund across original items
    const refundRatio = refundAmount / Math.abs(originalInvoice.totalAmount);
    
    return originalInvoice.items.map(item => ({
      id: uuidv4(),
      description: `Refund: ${item.description}`,
      quantity: item.quantity,
      unitPrice: -(item.unitPrice * refundRatio),
      amount: -(item.amount * refundRatio),
      category: item.category
    }));
  }

  private calculateTaxes(amount: number, type: 'bill_payment' | 'subscription' | 'service'): InvoiceTax[] {
    const taxes: InvoiceTax[] = [];
    
    // Get applicable tax configurations
    const applicableTaxes = Array.from(this.taxConfigurations.values())
      .filter(tax => tax.isActive && 
        (tax.applicableTo === 'all' || 
         (tax.applicableTo === 'bills' && type === 'bill_payment') ||
         (tax.applicableTo === 'subscriptions' && type === 'subscription') ||
         (tax.applicableTo === 'services' && type === 'service')));

    for (const taxConfig of applicableTaxes) {
      const taxAmount = taxConfig.type === 'percentage' 
        ? (amount * taxConfig.rate) / 100 
        : taxConfig.rate;

      taxes.push({
        id: uuidv4(),
        name: taxConfig.name,
        rate: taxConfig.rate,
        amount: taxAmount,
        type: taxConfig.type
      });
    }

    return taxes;
  }

  private calculateSubscriptionDiscounts(subscription: Subscription): InvoiceDiscount[] {
    const discounts: InvoiceDiscount[] = [];

    // Early payment discount
    if (subscription.billingCycle === 'annual') {
      discounts.push({
        id: uuidv4(),
        name: 'Annual subscription discount',
        amount: subscription.amount * 0.1, // 10% discount
        type: 'percentage',
        reason: 'Annual billing discount'
      });
    }

    return discounts;
  }

  private calculateInvoiceTotals(invoice: Invoice): void {
    // Calculate subtotal from items
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate total tax amount
    invoice.taxAmount = invoice.taxes.reduce((sum, tax) => sum + tax.amount, 0);

    // Calculate total discount amount
    invoice.discountAmount = invoice.discounts.reduce((sum, discount) => sum + discount.amount, 0);

    // Calculate total amount
    invoice.totalAmount = invoice.subtotal + invoice.taxAmount - invoice.discountAmount;
  }

  private async sendInvoiceViaMethod(invoice: Invoice, method: string): Promise<void> {
    // Mock implementation - in production would integrate with email/SMS services
    console.log(`Sending invoice ${invoice.invoiceNumber} via ${method}`);
    
    // Simulate async sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Invoice ${invoice.invoiceNumber} sent successfully via ${method}`);
  }

  private applyInvoiceFilters(invoices: Invoice[], filters?: InvoiceFilters): Invoice[] {
    if (!filters) return invoices;

    return invoices.filter(invoice => {
      if (filters.status && invoice.status !== filters.status) return false;
      if (filters.type && invoice.type !== filters.type) return false;
      if (filters.minAmount && invoice.totalAmount < filters.minAmount) return false;
      if (filters.maxAmount && invoice.totalAmount > filters.maxAmount) return false;
      if (filters.period) {
        if (invoice.createdAt < filters.period.startDate || invoice.createdAt > filters.period.endDate) return false;
      }
      return true;
    });
  }
}

// Supporting Types
interface TaxConfiguration {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  applicableTo: 'all' | 'bills' | 'subscriptions' | 'services';
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  description?: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  layout: 'standard' | 'detailed' | 'minimal';
  includeLogo: boolean;
  includeBarcode: boolean;
  colorScheme: 'blue' | 'green' | 'red' | 'black';
  footerText: string;
}

interface InvoiceFilters {
  status?: Invoice['status'];
  type?: Invoice['type'];
  minAmount?: number;
  maxAmount?: number;
  period?: { startDate: Date; endDate: Date };
}

interface InvoiceAnalytics {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  overdueInvoices: number;
  averageAmount: number;
  paymentRate: number;
  invoicesByType: Record<Invoice['type'], number>;
  revenueByType: Record<Invoice['type'], number>;
}

// Singleton instance
let invoiceGeneratorInstance: InvoiceGenerator | null = null;

export function getInvoiceGenerator(): InvoiceGenerator {
  if (!invoiceGeneratorInstance) {
    invoiceGeneratorInstance = new InvoiceGenerator();
  }
  return invoiceGeneratorInstance;
}
