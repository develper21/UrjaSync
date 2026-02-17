import { motion } from "framer-motion";
import {
  BarChart3, Smartphone, Brain, IndianRupee, Leaf, Shield,
  Zap, LayoutGrid, Settings2
} from "lucide-react";

const features = [
  { icon: BarChart3, title: "Real-time Monitoring", desc: "Track energy usage live across every device and appliance in your home." },
  { icon: Smartphone, title: "Smart Device Control", desc: "Remotely manage all connected devices with one-tap automation." },
  { icon: Brain, title: "AI Analytics", desc: "ML-powered insights detect anomalies and predict future energy needs." },
  { icon: IndianRupee, title: "Cost Optimization", desc: "Automatically shift loads to off-peak hours and save on tariffs." },
  { icon: Leaf, title: "Carbon Tracking", desc: "Measure your environmental impact and set sustainability goals." },
  { icon: Shield, title: "Predictive Maintenance", desc: "AI detects device faults before they happen, reducing downtime." },
  { icon: Zap, title: "Energy Marketplace", desc: "Trade excess energy with neighbors in your local microgrid." },
  { icon: LayoutGrid, title: "Microgrid Management", desc: "Manage batteries, solar panels, and backup power seamlessly." },
  { icon: Settings2, title: "Smart Automation", desc: "Create schedules, triggers, and geofence-based routines." },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 space-y-4"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Features</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">Everything You Need</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A complete energy management platform that puts you in control.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group p-6 rounded-xl glass-card hover:energy-glow transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <f.icon className="w-5 h-5 text-accent-foreground group-hover:text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
