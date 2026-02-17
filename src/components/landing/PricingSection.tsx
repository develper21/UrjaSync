import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Get started with basic energy monitoring",
    features: [
      "Up to 5 devices",
      "Real-time energy monitoring",
      "Daily usage reports",
      "Basic analytics",
      "Mobile app access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "Advanced features for smart homeowners",
    features: [
      "Unlimited devices",
      "AI-powered analytics",
      "Predictive maintenance",
      "Time-of-use optimization",
      "Custom automation rules",
      "Carbon footprint tracking",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For property managers & large setups",
    features: [
      "Everything in Pro",
      "Multi-property management",
      "Tenant energy tracking",
      "Energy marketplace access",
      "Microgrid management",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 space-y-3"
      >
        <p className="text-sm font-medium text-primary tracking-wider uppercase">Pricing</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold">
          Simple, transparent pricing
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that fits your energy management needs. Upgrade or downgrade anytime.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl border p-8 flex flex-col ${
              plan.popular
                ? "border-primary bg-card energy-glow"
                : "border-border bg-card"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "default" : "outline"}
              className="w-full gap-2"
              asChild
            >
              <Link to="/auth">
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
