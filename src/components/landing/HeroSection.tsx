import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingDown, Leaf, Sun, ShieldCheck, Activity, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-energy.jpg";

const stats = [
  { icon: Zap, label: "Energy Optimized", value: "40%", detail: "Avg. efficiency gain" },
  { icon: TrendingDown, label: "Annual Cost Savings", value: "₹14,500+", detail: "Peak-load shift" },
  { icon: Leaf, label: "Carbon Offsetting", value: "2.8 tons", detail: "Rooftop PV export" },
];

const HeroSection = () => (
  <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-grid-boxes">
    {/* Ambient radial blur glowing orbs */}
    <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
    <div className="pointer-events-none absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background pointer-events-none" />

    <div className="container relative z-10">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-background/80 backdrop-blur-sm text-xs font-mono text-foreground shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">UrjaSync v2.4</span>
            <span className="text-muted-foreground">• AI Microgrid Management</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-tight">
              Take Complete Control of Your{" "}
              <span className="gradient-text">Energy Ecosystem</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Monitor real-time wattage, curtail peak-tariff electricity costs, and balance rooftop solar panels with millisecond AI telemetry.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="gap-2 text-sm sm:text-base h-12 px-6 shadow-sm" asChild>
              <Link to="/dashboard">
                <span>Open Energy Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-sm sm:text-base h-12 px-6 border-border/80" asChild>
              <Link to="/auth">Sign In / Demo</Link>
            </Button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/70">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <s.icon className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xl sm:text-2xl font-display font-bold text-foreground">
                    {s.value}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">{s.detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Grid Interoperability Line */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Compatible with Tata Power, Adani Electricity, BESCOM & Smart Inverters</span>
          </div>
        </motion.div>

        {/* Right Column: Hero Dashboard Mockup + Live Overlay Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-xl bg-card">
            {/* Window header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/60 border-b border-border/70 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                urjasync-cloud-gateway.local
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </div>
            </div>

            <img
              src={heroImage}
              alt="UrjaSync smart energy dashboard interface"
              className="w-full object-cover max-h-[380px] sm:max-h-[440px]"
            />

            {/* Floating Live Telemetry Badge Overlay 1 (Top Right) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute top-14 right-4 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-3 shadow-lg max-w-[200px]"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Solar Feed</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Peak
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold font-mono">4.2 kW</p>
                  <p className="text-[10px] text-muted-foreground">Net Grid Export</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Live Telemetry Badge Overlay 2 (Bottom Left) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-3 shadow-lg max-w-[220px]"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">AI Efficiency</span>
                <span className="text-[10px] font-bold text-emerald-600">96.4%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Dynamic Shifting</p>
                  <p className="text-[10px] text-muted-foreground">Off-peak tariff active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
