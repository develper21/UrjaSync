import api from './api';

export interface Bill {
  _id: string;
  month: string;
  year: number;
  amount: number;
  unitsConsumed: number;
  solarCredits: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  savings: number;
}

export interface BudgetStatus {
  budget: number;
  spent: string;
  remaining: string;
  percentage: string;
  threshold: number;
  alertTriggered: boolean;
  projectedMonthly: string;
  daysElapsed: number;
  daysInMonth: number;
}

export interface SavingsData {
  currentMonth: {
    cost: string;
    usage: string;
  };
  previousMonth: {
    cost: string;
    usage: string;
  };
  savings: string;
  savingsPercentage: number;
  isSaving: boolean;
}

export interface CurrentBillData {
  bill: Bill;
  budget: {
    limit: number;
    used: number;
    percentage: string;
    remaining: number;
  };
}

export const billingService = {
  // Get current month's bill
  getCurrentBill: async (): Promise<CurrentBillData> => {
    const response = await api.get('/billing/current');
    return response.data.data;
  },

  // Get bill history
  getBillHistory: async (limit: number = 12): Promise<Bill[]> => {
    const response = await api.get('/billing/history', { params: { limit } });
    return response.data.data.bills;
  },

  // Get budget status
  getBudgetStatus: async (): Promise<BudgetStatus> => {
    const response = await api.get('/billing/budget-status');
    return response.data.data;
  },

  // Get savings
  getSavings: async (): Promise<SavingsData> => {
    const response = await api.get('/billing/savings');
    return response.data.data;
  },

  // Generate bill (admin function)
  generateBill: async (month: string, year: number): Promise<Bill> => {
    const response = await api.post('/billing/generate', { month, year });
    return response.data.data.bill;
  },
};
