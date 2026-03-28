import { motion } from "framer-motion";
import {
  Zap, TrendingDown, IndianRupee, Leaf, Thermometer, Lightbulb,
  ArrowUpRight, ArrowDownRight, Refrigerator, Tv, Flame, Fan, Wifi, Power
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { analyticsService, DashboardStats } from "@/services/analytics.service";
import { energyService, HourlyData, WeeklyData } from "@/services/energy.service";
import { deviceService, Device } from "@/services/device.service";
import { billingService } from "@/services/billing.service";
import { socketService } from "@/services/socket.service";
import { toast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ElementType> = {
  Thermometer, Lightbulb, Refrigerator, Tv, Flame, Fan, Wifi,
};

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [budgetPercentage, setBudgetPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, todayData, weeklyData, devicesData, budgetData] = await Promise.all([
          analyticsService.getDashboardStats(),
          energyService.getToday(),
          energyService.getWeekly(),
          deviceService.getDevices(),
          billingService.getBudgetStatus(),
        ]);

        setStats(statsData);
        setHourlyData(todayData.hourlyData);
        setWeeklyData(weeklyData.weeklyData);
        setDevices(devicesData);
        setBudgetPercentage(parseFloat(budgetData.percentage));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    socketService.connect();
    socketService.subscribeEnergy();

    socketService.onEnergyUpdate((data) => {
      setStats((prev) =>
        prev
          ? {
              ...prev,
              currentUsage: data.usage,
            }
          : null
      );
    });

    socketService.onDeviceStatus((data) => {
      setDevices((prev) =>
        prev.map((d) =>
          d._id === data.deviceId
            ? { ...d, status: data.status, intensity: data.intensity }
            : d
        )
      );
    });

    return () => {
      socketService.unsubscribeEnergy();
      socketService.offEnergyUpdate();
      socketService.offDeviceStatus();
    };
  }, []);

  const toggleDevice = async (id: string) => {
    const device = devices.find((d) => d._id === id);
    if (!device) return;

    const newStatus = !device.status;

    try {
      await deviceService.toggleDevice(id, newStatus);
      setDevices((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status: newStatus, lastUsed: newStatus ? new Date().toISOString() : d.lastUsed } : d
        )
      );
      toast({
        title: "Success",
        description: `${device.name} turned ${newStatus ? "on" : "off"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control device",
        variant: "destructive",
      });
    }
  };

  const activeDevices = devices.filter((d) => d.status);
  const totalPower = activeDevices.reduce((sum, d) => sum + d.powerRating, 0);

  const statCards = stats
    ? [
        {
          label: "Current Usage",
          value: `${stats.currentUsage} kW`,
          change: `${stats.costChange > 0 ? "+" : ""}${stats.costChange}%`,
          up: stats.costChange > 0,
          icon: Zap,
          color: "text-energy-blue",
        },
        {
          label: "Today's Cost",
          value: `₹${stats.todayCost}`,
          change: "-8%",
          up: false,
          icon: IndianRupee,
          color: "text-energy-green",
        },
        {
          label: "Monthly Bill",
          value: `₹${stats.monthlyBill}`,
          change: "-15%",
          up: false,
          icon: TrendingDown,
          color: "text-primary",
        },
        {
          label: "Carbon Saved",
          value: `${stats.carbonSaved} kg`,
          change: "+24%",
          up: true,
          icon: Leaf,
          color: "text-energy-green",
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
                <AreaChart data={hourlyData}>
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
              {devices.slice(0, 5).map((d) => {
                const Icon = iconMap[d.icon] || Power;
                return (
                  <div key={d._id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.status ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.room}</p>
                      </div>
                    </div>
                    <Switch checked={d.status} onCheckedChange={() => toggleDevice(d._id)} />
                  </div>
                );
              })}
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

          {/* Budget */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Budget Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Budget Used</span>
                  <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={budgetPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {budgetPercentage >= 80 ? "⚠️ Budget threshold reached!" : "You're on track with your budget"}
                </p>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Devices</span>
                  <span className="font-medium">{stats?.activeDevices || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Load</span>
                  <span className="font-medium">{totalPower.toFixed(2)} kW</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
