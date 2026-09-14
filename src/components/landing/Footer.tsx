import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Cpu,
  Leaf,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const footerLinks = {
  platform: [
    { label: "Overview & Dashboard", href: "/dashboard" },
    { label: "Smart Devices Sync", href: "/dashboard/devices" },
    { label: "Real-Time Analytics", href: "/dashboard/analytics" },
    { label: "Billing & Tariffs", href: "/dashboard/billing" },
    { label: "Sustainability Index", href: "/dashboard/sustainability" },
    { label: "Settings Console", href: "/dashboard/settings" },
  ],
  solutions: [
    { label: "Smart Home Automation", href: "#features" },
    { label: "Commercial Microgrids", href: "#features" },
    { label: "Rooftop Solar PV Sync", href: "#features" },
    { label: "EV Fleet Charging", href: "#features" },
    { label: "Energy Storage (BESS)", href: "#features" },
    { label: "Time-of-Use Optimization", href: "#features" },
  ],
  resources: [
    { label: "API Documentation", href: "#" },
    { label: "Energy Tariff Calculator", href: "/dashboard/billing" },
    { label: "Smart Meter Setup Guide", href: "#" },
    { label: "Community Forum", href: "#" },
    { label: "Developer SDKs", href: "#" },
    { label: "Release Changelog", href: "#" },
  ],
  company: [
    { label: "About UrjaSync", href: "#" },
    { label: "Clean Energy Pledge", href: "/dashboard/sustainability" },
    { label: "Security & TLS 1.3", href: "/dashboard/settings?tab=security" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Support", href: "#" },
  ],
};

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setSubscribed(true);
    toast({
      title: "Subscribed to Grid Pulse",
      description: "You'll now receive our weekly energy optimization insights.",
    });
    setNewsletterEmail("");
  };

  return (
    <footer className="border-t bg-card text-foreground relative overflow-hidden bg-grid-boxes">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -bottom-32 right-10 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-10 left-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      {/* Top Banner: Real-time Status & Newsletter */}
      <div className="border-b border-border/70 bg-background/60 backdrop-blur-sm relative z-10">
        <div className="container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">
            {/* Mission & Status */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4 fill-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold tracking-tight">UrjaSync</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Grid Telemetry Online (42ms)
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                India's next-generation AI-powered energy intelligence and smart microgrid platform.
                Monitor, optimize, and curtail power expenses in real-time.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="lg:col-span-6 bg-card/80 p-5 rounded-2xl border border-border/80 shadow-xs backdrop-blur-sm">
              <div className="space-y-1 mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Subscribe to Urja Grid Pulse
                </h4>
                <p className="text-xs text-muted-foreground">
                  Get weekly solar forecasts, tariff updates, and AI efficiency tips. No spam.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-background text-xs h-9"
                  disabled={subscribed}
                />
                <Button type="submit" size="sm" className="h-9 gap-1.5 shrink-0" disabled={subscribed}>
                  {subscribed ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Subscribed
                    </>
                  ) : (
                    <>
                      <span>Join</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Platform
            </h5>
            <ul className="space-y-2 text-xs">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Solutions
            </h5>
            <ul className="space-y-2 text-xs">
              {footerLinks.solutions.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Resources
            </h5>
            <ul className="space-y-2 text-xs">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" />
              Company
            </h5>
            <ul className="space-y-2 text-xs">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Socials */}
      <div className="border-t border-border/60 bg-background/80 py-6 relative z-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>© 2026 UrjaSync Technologies. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline flex items-center gap-1 font-mono">
              <Globe className="w-3 h-3 text-emerald-500" />
              Grid Standard: 230V / 50Hz
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="UrjaSync GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="UrjaSync Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="UrjaSync LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ⚡ 100% Green Hosted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
