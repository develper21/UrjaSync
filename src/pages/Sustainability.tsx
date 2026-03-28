import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Leaf, TreePine, Sun, Droplets, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { sustainabilityService, SustainabilityGoal, SustainabilityStats, EmissionData } from "@/services/sustainability.service";
import { toast } from "@/hooks/use-toast";

const iconMap: Record<string, typeof Leaf> = {
  co2_reduction: Leaf,
  solar_usage: Sun,
  zero_waste: Target,
};

const goalLabels: Record<string, string> = {
  co2_reduction: "Reduce CO₂ by 30%",
  solar_usage: "Solar covers 50% usage",
  zero_waste: "Zero waste energy days",
};

const SustainabilityPage = () => {
  const [stats, setStats] = useState<SustainabilityStats | null>(null);
  const [goals, setGoals] = useState<SustainabilityGoal[]>([]);
  const [emissions, setEmissions] = useState<EmissionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSustainabilityData = async () => {
      try {
        setLoading(true);
        const [statsData, goalsData, emissionsData] = await Promise.all([
          sustainabilityService.getStats(),
          sustainabilityService.getGoals(),
          sustainabilityService.getEmissions(),
        ]);
        setStats(statsData);
        setGoals(goalsData);
        setEmissions(emissionsData.emissions);
      } catch (error) {
        console.error("Error fetching sustainability data:", error);
        toast({
          title: "Error",
          description: "Failed to load sustainability data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSustainabilityData();
  }, []);

  const statCards = stats
    ? [
        { icon: Leaf, label: "Carbon Saved", value: `${stats.carbonSaved} tons`, sub: "This year" },
        { icon: TreePine, label: "Trees Equivalent", value: `${stats.treesEquivalent} trees`, sub: "Planted equivalent" },
        { icon: Droplets, label: "Water Saved", value: `${stats.waterSaved.toLocaleString()}L`, sub: "Via energy optimization" },
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
          <h1 className="font-display text-2xl font-bold">Sustainability</h1>
          <p className="text-sm text-muted-foreground">Your environmental impact dashboard</p>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="font-display text-lg">Emissions Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={emissions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Bar dataKey="emissions" fill="hsl(152,60%,42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="font-display text-lg">Sustainability Goals</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {goals.map((g) => {
                const Icon = iconMap[g.type] || Target;
                return (
                  <div key={g._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{goalLabels[g.type] || g.type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{g.progress}%</span>
                    </div>
                    <Progress value={g.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {g.current} / {g.target} {g.unit}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SustainabilityPage;
