import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { IndianRupee, TrendingDown, Receipt, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { billingService, Bill, SavingsData, BudgetStatus } from "@/services/billing.service";
import { toast } from "@/hooks/use-toast";

const BillingPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const [billsData, savingsData, budgetData] = await Promise.all([
          billingService.getBillHistory(),
          billingService.getSavings(),
          billingService.getBudgetStatus(),
        ]);
        setBills(billsData);
        setSavings(savingsData);
        setBudget(budgetData);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load billing data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const statCards = savings && budget
    ? [
        {
          icon: IndianRupee,
          label: "Current Bill",
          value: `₹${parseFloat(budget.spent).toLocaleString()}`,
          sub: `${budget.daysElapsed} days tracked`,
        },
        {
          icon: TrendingDown,
          label: "Savings This Month",
          value: `₹${parseFloat(savings.savings).toLocaleString()}`,
          sub: savings.isSaving ? "vs last month" : "more than last month",
        },
        {
          icon: Calendar,
          label: "Avg Daily Cost",
          value: `₹${budget.daysElapsed > 0 ? (parseFloat(budget.spent) / budget.daysElapsed).toFixed(0) : 0}`,
          sub: "per day",
        },
      ]
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Billing</h1>
          <p className="text-sm text-muted-foreground">Track your energy costs and payments</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="p-5">
                  <s.icon className="w-5 h-5 text-primary mb-3" />
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Budget Tracker</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Monthly Budget</span>
              <span className="font-medium">₹{parseFloat(budget?.spent || "0").toLocaleString()} / ₹{budget?.budget.toLocaleString()}</span>
            </div>
            <Progress value={parseFloat(budget?.percentage || "0")} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {budget?.alertTriggered
                ? "⚠️ Budget threshold reached! Consider reducing usage."
                : `You're on track. Projected monthly: ₹${parseFloat(budget?.projectedMonthly || "0").toLocaleString()}`}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Billing History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bills.map((b) => (
                <div key={`${b.month}-${b.year}`} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{b.month} {b.year}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-sm">₹{b.amount.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === "paid"
                        ? "bg-accent text-accent-foreground"
                        : b.status === "overdue"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {b.status === "paid" ? "Paid" : b.status === "overdue" ? "Overdue" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
