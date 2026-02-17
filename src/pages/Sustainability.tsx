import { motion } from "framer-motion";
import { Leaf, TreePine, Sun, Droplets, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { carbonData } from "@/lib/mock-data";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const goals = [
  { label: "Reduce CO₂ by 30%", progress: 72, icon: Leaf },
  { label: "Solar covers 50% usage", progress: 48, icon: Sun },
  { label: "Zero waste energy days", progress: 35, icon: Target },
];

const SustainabilityPage = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Sustainability</h1>
        <p className="text-sm text-muted-foreground">Your environmental impact dashboard</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Leaf, label: "Carbon Saved", value: "2.4 tons", sub: "This year" },
          { icon: TreePine, label: "Trees Equivalent", value: "38 trees", sub: "Planted equivalent" },
          { icon: Droplets, label: "Water Saved", value: "12,400L", sub: "Via energy optimization" },
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Emissions Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
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

        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Sustainability Goals</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {goals.map((g) => (
              <div key={g.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <g.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{g.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{g.progress}%</span>
                </div>
                <Progress value={g.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
);

export default SustainabilityPage;
