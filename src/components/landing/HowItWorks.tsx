import { motion } from "framer-motion";
import { Plug, BarChart3, Sparkles, TrendingDown } from "lucide-react";

const steps = [
  { icon: Plug, title: "Connect Devices", desc: "Plug in smart meters and connect your IoT devices in minutes." },
  { icon: BarChart3, title: "Monitor Usage", desc: "See real-time energy data across your entire home dashboard." },
  { icon: Sparkles, title: "Get AI Insights", desc: "Receive personalized recommendations to optimize consumption." },
  { icon: TrendingDown, title: "Save & Sustain", desc: "Watch your bills drop and carbon footprint shrink automatically." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-accent/30">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 space-y-4"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-wider">How It Works</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">Simple Setup, Powerful Results</h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center space-y-4"
          >
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
              <s.icon className="w-7 h-7" />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
