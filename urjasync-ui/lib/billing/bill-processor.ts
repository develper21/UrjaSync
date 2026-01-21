import { Bill, BillAttachment, ExtractedBillData } from './types';
import { v4 as uuidv4 } from 'uuid';

export class BillProcessor {
  private bills: Map<string, Bill> = new Map();
  private attachments: Map<string, BillAttachment> = new Map();
  private ocrService: OCRService;
  private validationService: ValidationService;

  constructor() {
    this.ocrService = new OCRService();
    this.validationService = new ValidationService();
  }

  // Bill Processing
  async processBillUpload(fileData: Buffer, fileName: string, _userId: string): Promise<BillAttachment> {
    try {
      // Create attachment record
      const attachment: BillAttachment = {
        id: uuidv4(),
        fileName,
        fileType: this.getFileType(fileName),
        fileSize: fileData.length,
        url: `/uploads/bills/${uuidv4()}/${fileName}`,
        uploadedAt: new Date()
      };

      // Extract data using OCR
      const extractedData = await this.ocrService.extractBillData(fileData);
      attachment.extractedData = extractedData;

      // Store attachment
      this.attachments.set(attachment.id, attachment);

      return attachment;
    } catch (error) {
      throw new Error(`Failed to process bill upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createBillFromAttachment(attachmentId: string, userId: string, manualData?: Partial<Bill>): Promise<Bill> {
    const attachment = this.attachments.get(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const extractedData = attachment.extractedData;
    if (!extractedData) {
      throw new Error('No extracted data found for attachment');
    }

    // Create bill from extracted data
    const bill: Bill = {
      id: uuidv4(),
      userId,
      billNumber: extractedData.fields.billNumber || this.generateBillNumber(),
      provider: extractedData.fields.provider || 'Unknown',
      billType: 'electricity', // Default, can be overridden
      billingPeriod: extractedData.fields.period || {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      dueDate: extractedData.fields.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: extractedData.fields.amount || 0,
      currency: 'INR',
      status: 'pending',
      meterReadings: extractedData.fields.meterReadings ? {
        ...extractedData.fields.meterReadings,
        unit: 'kWh'
      } : undefined,
      tariffDetails: extractedData.fields.tariff ? {
        ...extractedData.fields.tariff,
        fixedCharges: 50
      } : undefined,
      consumptionData: extractedData.fields.consumption ? {
        units: extractedData.fields.consumption,
        peakUnits: 0,
        standardUnits: 0,
        offPeakUnits: 0
      } : undefined,
      attachments: [attachment],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...manualData // Override with manual data if provided
    };

    // Validate bill
    const validation = this.validationService.validateBill(bill);
    if (!validation.isValid) {
      throw new Error(`Bill validation failed: ${validation.errors.join(', ')}`);
    }

    // Store bill
    this.bills.set(bill.id, bill);

    return bill;
  }

  async updateBill(billId: string, updates: Partial<Bill>): Promise<Bill> {
    const bill = this.bills.get(billId);
    if (!bill) {
      throw new Error('Bill not found');
    }

    const updatedBill = {
      ...bill,
      ...updates,
      updatedAt: new Date()
    };

    // Validate updated bill
    const validation = this.validationService.validateBill(updatedBill);
    if (!validation.isValid) {
      throw new Error(`Bill validation failed: ${validation.errors.join(', ')}`);
    }

    this.bills.set(billId, updatedBill);
    return updatedBill;
  }

  async deleteBill(billId: string): Promise<boolean> {
    const bill = this.bills.get(billId);
    if (!bill) {
      return false;
    }

    // Check if bill has payments
    if (bill.paymentId) {
      throw new Error('Cannot delete bill with associated payments');
    }

    this.bills.delete(billId);
    return true;
  }

  // Bill Retrieval
  getBill(billId: string): Bill | undefined {
    return this.bills.get(billId);
  }

  getUserBills(userId: string, filters?: BillFilters): Bill[] {
    const userBills = Array.from(this.bills.values())
      .filter(bill => bill.userId === userId);

    return this.applyFilters(userBills, filters);
  }

  getBillsByStatus(status: Bill['status']): Bill[] {
    return Array.from(this.bills.values())
      .filter(bill => bill.status === status);
  }

  getOverdueBills(): Bill[] {
    const now = new Date();
    return Array.from(this.bills.values())
      .filter(bill => bill.status === 'pending' && bill.dueDate < now);
  }

  getUpcomingBills(daysAhead: number = 7): Bill[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return Array.from(this.bills.values())
      .filter(bill => 
        bill.status === 'pending' && 
        bill.dueDate >= now && 
        bill.dueDate <= futureDate
      );
  }

  // Bill Analysis
  getBillAnalytics(userId: string, period?: { startDate: Date; endDate: Date }): BillAnalytics {
    const bills = this.getUserBills(userId, { period });
    
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const overdueAmount = bills
      .filter(bill => bill.status === 'overdue')
      .reduce((sum, bill) => sum + bill.amount, 0);

    const billsByProvider = bills.reduce((acc, bill) => {
      acc[bill.provider] = (acc[bill.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const billsByType = bills.reduce((acc, bill) => {
      acc[bill.billType] = (acc[bill.billType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBills: bills.length,
      totalAmount,
      paidAmount,
      overdueAmount,
      averageBillAmount: bills.length > 0 ? totalAmount / bills.length : 0,
      billsByProvider,
      billsByType,
      paymentRate: bills.length > 0 ? (bills.filter(b => b.status === 'paid').length / bills.length) * 100 : 0
    };
  }

  // Bill Matching
  async matchBillWithPayment(billId: string, paymentAmount: number, paymentDate: Date): Promise<BillMatchResult> {
    const bill = this.bills.get(billId);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Check amount match (allowing small variations)
    const amountDifference = Math.abs(bill.amount - paymentAmount);
    const amountMatch = amountDifference <= (bill.amount * 0.01); // 1% tolerance

    // Check date proximity
    const daysDifference = Math.abs((bill.dueDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    const dateMatch = daysDifference <= 30; // 30 days tolerance

    const confidence = this.calculateMatchConfidence(amountMatch, dateMatch, amountDifference, daysDifference);

    return {
      billId,
      matched: confidence > 0.7,
      confidence,
      amountMatch,
      dateMatch,
      amountDifference,
      daysDifference
    };
  }

  // Utility Methods
  private generateBillNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `BILL-${timestamp}-${random}`;
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }

  private applyFilters(bills: Bill[], filters?: BillFilters): Bill[] {
    if (!filters) return bills;

    return bills.filter(bill => {
      if (filters.status && bill.status !== filters.status) return false;
      if (filters.provider && bill.provider !== filters.provider) return false;
      if (filters.billType && bill.billType !== filters.billType) return false;
      if (filters.period) {
        const billDate = bill.billingPeriod.endDate;
        if (billDate < filters.period.startDate || billDate > filters.period.endDate) return false;
      }
      if (filters.minAmount && bill.amount < filters.minAmount) return false;
      if (filters.maxAmount && bill.amount > filters.maxAmount) return false;
      return true;
    });
  }

  private calculateMatchConfidence(amountMatch: boolean, dateMatch: boolean, amountDiff: number, daysDiff: number): number {
    let confidence = 0;

    if (amountMatch) confidence += 0.5;
    if (dateMatch) confidence += 0.3;

    // Bonus for exact amount match
    if (amountDiff === 0) confidence += 0.1;

    // Bonus for payment on due date
    if (daysDiff === 0) confidence += 0.1;

    return Math.min(confidence, 1);
  }
}

// Supporting Classes
class OCRService {
  async extractBillData(_fileData: Buffer): Promise<ExtractedBillData> {
    // Mock OCR implementation
    // In production, this would integrate with actual OCR service like Tesseract, Google Vision, etc.
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          extractedAt: new Date(),
          confidence: 0.85 + Math.random() * 0.15,
          fields: {
            billNumber: `EB${Math.floor(Math.random() * 1000000)}`,
            provider: 'State Electricity Board',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            amount: Math.floor(Math.random() * 5000) + 500,
            period: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              endDate: new Date()
            },
            meterReadings: {
              previous: Math.floor(Math.random() * 10000),
              current: Math.floor(Math.random() * 10000) + 1000
            },
            consumption: Math.floor(Math.random() * 500) + 100,
            tariff: {
              peakRate: 8.5,
              standardRate: 5.8,
              offPeakRate: 3.2
            }
          }
        });
      }, 1000);
    });
  }
}

class ValidationService {
  validateBill(bill: Bill): ValidationResult {
    const errors: string[] = [];

    if (!bill.billNumber || bill.billNumber.trim() === '') {
      errors.push('Bill number is required');
    }

    if (!bill.provider || bill.provider.trim() === '') {
      errors.push('Provider is required');
    }

    if (bill.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (bill.billingPeriod.startDate >= bill.billingPeriod.endDate) {
      errors.push('Billing period start date must be before end date');
    }

    if (bill.dueDate <= bill.billingPeriod.endDate) {
      errors.push('Due date must be after billing period end date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Supporting Types
interface BillFilters {
  status?: Bill['status'];
  provider?: string;
  billType?: Bill['billType'];
  period?: { startDate: Date; endDate: Date };
  minAmount?: number;
  maxAmount?: number;
}

interface BillAnalytics {
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  averageBillAmount: number;
  billsByProvider: Record<string, number>;
  billsByType: Record<string, number>;
  paymentRate: number;
}

interface BillMatchResult {
  billId: string;
  matched: boolean;
  confidence: number;
  amountMatch: boolean;
  dateMatch: boolean;
  amountDifference: number;
  daysDifference: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Singleton instance
let billProcessorInstance: BillProcessor | null = null;

export function getBillProcessor(): BillProcessor {
  if (!billProcessorInstance) {
    billProcessorInstance = new BillProcessor();
  }
  return billProcessorInstance;
}
