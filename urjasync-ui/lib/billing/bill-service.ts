interface Bill {
  id: string;
  userId: string;
  provider: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  units: number;
  rate: number;
  period: string;
  createdAt: string;
}

interface BillAnalytics {
  totalBills: number;
  totalAmount: number;
  averageMonthlyBill: number;
  overdueAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

interface BillServiceInterface {
  getBills(userId: string): Promise<Bill[]>;
  getBill(billId: string): Promise<Bill | null>;
  getBillAnalytics(userId: string): Promise<BillAnalytics>;
  getOverdueBills(userId: string): Promise<Bill[]>;
  getUpcomingBills(userId: string): Promise<Bill[]>;
  getBillsByStatus(userId: string, status: string): Promise<Bill[]>;
  processBillUpload(userId: string, file: File): Promise<Bill>;
  createBillFromAttachment(userId: string, attachment: any): Promise<Bill>;
  updateBill(billId: string, billData: Partial<Bill>): Promise<Bill>;
  deleteBill(billId: string): Promise<boolean>;
  matchBillWithPayment(billId: string, paymentId: string): Promise<boolean>;
}

export const getBillService = (): BillServiceInterface => ({
  getBills: async (_userId: string): Promise<Bill[]> => {
    // Mock implementation
    return [];
  },

  getBill: async (_billId: string): Promise<Bill | null> => {
    // Mock implementation
    return null;
  },

  getBillAnalytics: async (_userId: string): Promise<BillAnalytics> => {
    // Mock implementation
    return {
      totalBills: 0,
      totalAmount: 0,
      averageMonthlyBill: 0,
      overdueAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };
  },

  getOverdueBills: async (_userId: string): Promise<Bill[]> => {
    // Mock implementation
    return [];
  },

  getUpcomingBills: async (_userId: string): Promise<Bill[]> => {
    // Mock implementation
    return [];
  },

  getBillsByStatus: async (_userId: string, _status: string): Promise<Bill[]> => {
    // Mock implementation
    return [];
  },

  processBillUpload: async (_userId: string, _file: File): Promise<Bill> => {
    // Mock implementation
    const bill: Bill = {
      id: 'bill_' + Date.now(),
      userId: _userId,
      provider: 'Unknown',
      amount: 0,
      dueDate: new Date().toISOString(),
      status: 'pending',
      units: 0,
      rate: 0,
      period: new Date().toISOString().slice(0, 7),
      createdAt: new Date().toISOString(),
    };
    return bill;
  },

  createBillFromAttachment: async (_userId: string, _attachment: any): Promise<Bill> => {
    // Mock implementation
    const bill: Bill = {
      id: 'bill_' + Date.now(),
      userId: _userId,
      provider: 'Unknown',
      amount: 0,
      dueDate: new Date().toISOString(),
      status: 'pending',
      units: 0,
      rate: 0,
      period: new Date().toISOString().slice(0, 7),
      createdAt: new Date().toISOString(),
    };
    return bill;
  },

  updateBill: async (billId: string, billData: Partial<Bill>): Promise<Bill> => {
    // Mock implementation
    const bill: Bill = {
      id: billId,
      userId: billData.userId || '',
      provider: billData.provider || '',
      amount: billData.amount || 0,
      dueDate: billData.dueDate || '',
      status: billData.status || 'pending',
      units: billData.units || 0,
      rate: billData.rate || 0,
      period: billData.period || '',
      createdAt: billData.createdAt || new Date().toISOString(),
    };
    return bill;
  },

  deleteBill: async (_billId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  matchBillWithPayment: async (_billId: string, _paymentId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },
});
