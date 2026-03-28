import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { analyticsService, DeviceBreakdownItem, CarbonData } from "@/services/analytics.service";
import { energyService, HourlyData } from "@/services/energy.service";
import { toast } from "@/hooks/use-toast";

const COLORS = ["hsl(210, 100%, 50%)", "hsl(25, 95%, 53%)", "hsl(45, 93%, 58%)", "hsl(152, 60%, 42%)", "hsl(220, 10%, 50%)"];

const AnalyticsPage = () => {
  const [usageData, setUsageData] = useState<HourlyData[]>([]);
  const [costData, setCostData] = useState<{ time: string; cost: number; usage: number }[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdownItem[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [todayData, costAnalysis, breakdown, carbon] = await Promise.all([
          energyService.getToday(),
          analyticsService.getCostAnalysis(),
          analyticsService.getDeviceBreakdown(),
          analyticsService.getCarbonTrend(),
        ]);

        setUsageData(todayData.hourlyData);
        setCostData(costAnalysis.hourlyCosts);
        setDeviceBreakdown(breakdown.breakdown);
        setCarbonData(carbon.carbonData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

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
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep dive into your energy patterns</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader><CardTitle className="font-display text-lg">Usage Trend (Today)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={usageData}>
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
                  <LineChart data={costData}>
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
                    <Pie 
                      data={deviceBreakdown} 
                      dataKey="usage" 
                      nameKey="name"
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={3}
                    >
                      {deviceBreakdown.map((d, index) => (
                        <Cell key={d.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {deviceBreakdown.map((d, index) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium ml-auto">{d.percentage}%</span>
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
};

export default AnalyticsPage;
