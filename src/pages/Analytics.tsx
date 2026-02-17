import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { energyUsageData, weeklyData, carbonData } from "@/lib/mock-data";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const deviceBreakdown = [
  { name: "AC", value: 42, color: "hsl(210, 100%, 50%)" },
  { name: "Heater", value: 22, color: "hsl(25, 95%, 53%)" },
  { name: "Lighting", value: 15, color: "hsl(45, 93%, 58%)" },
  { name: "Kitchen", value: 12, color: "hsl(152, 60%, 42%)" },
  { name: "Other", value: 9, color: "hsl(220, 10%, 50%)" },
];

const AnalyticsPage = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your energy patterns</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-display text-lg">Usage Trend (Today)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={energyUsageData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152,60%,42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152,60%,42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="usage" stroke="hsl(152,60%,42%)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-display text-lg">Cost Analysis (Today)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={energyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="hsl(210,100%,50%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-display text-lg">Device Breakdown</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={deviceBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {deviceBreakdown.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {deviceBreakdown.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-display text-lg">Carbon Emissions Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Bar dataKey="emissions" fill="hsl(152,60%,42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  </DashboardLayout>
);

export default AnalyticsPage;
