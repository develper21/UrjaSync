import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative rounded-3xl bg-primary p-12 md:p-20 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-[hsl(var(--energy-cyan))] opacity-90" />
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">
            Ready to Sync Your Energy?
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of smart homeowners saving money and the planet.
          </p>
          <Button size="lg" variant="secondary" className="gap-2 text-base" asChild>
            <Link to="/auth">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
