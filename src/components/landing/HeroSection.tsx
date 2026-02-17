import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingDown, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-energy.jpg";

const stats = [
  { icon: Zap, label: "Energy Saved", value: "40%" },
  { icon: TrendingDown, label: "Cost Reduction", value: "₹12K/yr" },
  { icon: Leaf, label: "Carbon Offset", value: "2.4 tons" },
];

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-background" />
    <div className="container relative z-10 py-20">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            <Zap className="w-3 h-3" /> Smart Energy Management
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Take Control of Your{" "}
            <span className="gradient-text">Energy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Monitor, optimize, and automate your home energy consumption. Save money while reducing your carbon footprint.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link to="/dashboard">
                Start Saving <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
          <div className="flex gap-8 pt-4">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <s.icon className="w-4 h-4" />
                  <span className="text-2xl font-display font-bold">{s.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-2xl overflow-hidden energy-glow">
            <img src={heroImage} alt="UrjaSync smart energy dashboard" className="w-full rounded-2xl" />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
