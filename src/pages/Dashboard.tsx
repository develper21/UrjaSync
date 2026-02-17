import { motion } from "framer-motion";
import {
  Zap, TrendingDown, IndianRupee, Leaf, Thermometer, Lightbulb,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { energyUsageData, weeklyData, devices, tariffSchedule } from "@/lib/mock-data";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";

const statCards = [
  { label: "Current Usage", value: "4.5 kW", change: "+12%", up: true, icon: Zap, color: "text-energy-blue" },
  { label: "Today's Cost", value: "₹134.40", change: "-8%", up: false, icon: IndianRupee, color: "text-energy-green" },
  { label: "Monthly Bill", value: "₹3,240", change: "-15%", up: false, icon: TrendingDown, color: "text-primary" },
  { label: "Carbon Saved", value: "18.2 kg", change: "+24%", up: true, icon: Leaf, color: "text-energy-green" },
];

const DashboardPage = () => {
  const [deviceStates, setDeviceStates] = useState(
    Object.fromEntries(devices.map((d) => [d.id, d.status]))
  );

  const toggleDevice = (id: string) => {
    setDeviceStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeDevices = devices.filter((d) => deviceStates[d.id]);
  const totalPower = activeDevices.reduce((sum, d) => sum + d.power, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your energy at a glance</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <span className={`text-xs flex items-center gap-0.5 ${s.up ? "text-energy-orange" : "text-energy-green"}`}>
                      {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {s.change}
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Energy Usage Chart */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Today's Energy Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={energyUsageData}>
                  <defs>
                    <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="usage" stroke="hsl(152, 60%, 42%)" fill="url(#usageGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Device Control */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Quick Controls</CardTitle>
              <p className="text-xs text-muted-foreground">{activeDevices.length} active · {totalPower.toFixed(2)} kW</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {devices.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${deviceStates[d.id] ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {d.icon === "Thermometer" ? <Thermometer className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.room}</p>
                    </div>
                  </div>
                  <Switch checked={deviceStates[d.id]} onCheckedChange={() => toggleDevice(d.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Weekly Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                  <Tooltip />
                  <Bar dataKey="usage" fill="hsl(210, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="solar" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tariff & Budget */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Tariff Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tariffSchedule.map((t) => (
                <div key={t.period} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.period}</span>
                    <span className="text-muted-foreground">₹{t.rate}/kWh</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.time}</p>
                </div>
              ))}
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Budget</span>
                  <span className="font-medium">₹3,240 / ₹5,000</span>
                </div>
                <Progress value={64.8} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
