import { motion } from "framer-motion";
import { IndianRupee, TrendingDown, Receipt, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const bills = [
  { month: "January 2026", amount: 4200, paid: true },
  { month: "December 2025", amount: 3890, paid: true },
  { month: "November 2025", amount: 4560, paid: true },
  { month: "October 2025", amount: 3750, paid: true },
];

const BillingPage = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Track your energy costs and payments</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: IndianRupee, label: "Current Bill", value: "₹3,240", sub: "Due Feb 28" },
          { icon: TrendingDown, label: "Savings This Month", value: "₹860", sub: "vs last month" },
          { icon: Calendar, label: "Avg Daily Cost", value: "₹108", sub: "17 days tracked" },
        ].map((s, i) => (
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
            <span className="font-medium">₹3,240 / ₹5,000</span>
          </div>
          <Progress value={64.8} className="h-3" />
          <p className="text-xs text-muted-foreground">You're on track to save ₹1,760 this month</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display text-lg">Billing History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bills.map((b) => (
              <div key={b.month} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{b.month}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">₹{b.amount.toLocaleString()}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default BillingPage;
