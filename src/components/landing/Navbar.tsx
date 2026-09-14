import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/80"
    >
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 fill-primary-foreground" />
          </div>
          <span>UrjaSync</span>
        </Link>

        {/* Live Grid indicator badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/40 text-xs text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Smart Grid Active</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button size="sm" className="gap-2 shadow-xs" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                <span>Console Dashboard</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" className="gap-1.5 shadow-xs" asChild>
                <Link to="/auth">
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t bg-card/95 backdrop-blur-md p-4 space-y-3"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t flex flex-col gap-2">
            <Button size="sm" className="w-full gap-2" asChild>
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Open Energy Console" : "Get Started Free"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
