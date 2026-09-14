import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Sparkles,
  TrendingDown,
  Sun,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground animate-pulse">
          <Zap className="w-5 h-5 fill-primary-foreground" />
        </div>
        <p className="text-xs text-muted-foreground font-mono">Authenticating with UrjaSync...</p>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleQuickDemoFill = () => {
    setEmail("demo@urjasync.com");
    setPassword("password123");
    toast({
      title: "Demo Credentials Populated",
      description: "Click 'Sign In' to access the live dashboard instantly.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "Logged into UrjaSync energy console successfully.",
        });
      }
    } else {
      if (!fullName.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message || "Could not complete registration.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to UrjaSync! Redirecting to your energy dashboard.",
        });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Left side - Interactive Platform Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12 overflow-hidden text-primary-foreground">
        {/* Background Grid Pattern & Ambient Lighting */}
        <div className="absolute inset-0 bg-grid-boxes opacity-15" />
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground text-primary flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 fill-primary" />
            </div>
            <span>UrjaSync</span>
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 text-xs font-mono border border-primary-foreground/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Smart Grid Online</span>
          </div>
        </div>

        {/* Middle Feature Cards & Visuals */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 text-xs font-medium text-primary-foreground">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI-Driven Microgrid Optimization</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight">
              Intelligent Energy Orchestration for Modern Homes & Grids
            </h1>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Experience seamless real-time load analytics, automated peak-tariff shifting, and rooftop solar synchronization.
            </p>
          </div>

          {/* Simulated Real-Time Metric Widget */}
          <div className="bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs border-b border-primary-foreground/15 pb-3">
              <span className="font-mono text-primary-foreground/80 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Node: DEL-GRID-04
              </span>
              <span className="text-emerald-300 font-semibold font-mono">● 0.04s Telemetry</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <p className="text-[11px] text-primary-foreground/70">Current Load</p>
                <div className="flex items-center gap-1 font-mono font-bold text-lg">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>2.4 kW</span>
                </div>
              </div>

              <div className="space-y-1 border-l border-primary-foreground/15 pl-3">
                <p className="text-[11px] text-primary-foreground/70">Solar Export</p>
                <div className="flex items-center gap-1 font-mono font-bold text-lg text-emerald-300">
                  <Sun className="w-4 h-4" />
                  <span>4.1 kW</span>
                </div>
              </div>

              <div className="space-y-1 border-l border-primary-foreground/15 pl-3">
                <p className="text-[11px] text-primary-foreground/70">Monthly Saved</p>
                <div className="flex items-center gap-1 font-mono font-bold text-lg">
                  <TrendingDown className="w-4 h-4 text-emerald-300" />
                  <span>₹3,420</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Compliance */}
        <div className="relative z-10 flex items-center justify-between text-xs text-primary-foreground/70 pt-6 border-t border-primary-foreground/15">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End TLS 1.3 Encryption</span>
          </div>
          <span>ISO 27001 Certified Smart Metering</span>
        </div>
      </div>

      {/* Right side - Authentication Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative bg-grid-boxes">
        {/* Top Header Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to UrjaSync Home
          </Link>

          {/* Quick Demo Fill Button */}
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Auto-fill Demo Credentials</span>
          </button>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-md mx-auto my-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            {/* Mobile UrjaSync Logo */}
            <div className="lg:hidden flex items-center gap-2 justify-center mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                <Zap className="w-4 h-4 fill-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">UrjaSync</span>
            </div>

            {/* Auth Tab Switcher (Sign In vs Sign Up) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/60 mb-6 border border-border/60">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  isLogin
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  !isLogin
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {isLogin ? "Welcome back" : "Join the Clean Energy Network"}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {isLogin
                  ? "Enter your credentials to access your smart energy console."
                  : "Connect your smart meter and start optimizing electricity costs."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="fullName" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9 bg-background text-sm"
                        maxLength={100}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="demo@urjasync.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-background text-sm"
                    required
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Password
                  </Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Password Recovery",
                          description: "Password reset link can be sent to your registered email.",
                        })
                      }
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 bg-background text-sm"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 shadow-xs mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In to Console" : "Create My Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Info Pill */}
            <div className="mt-5 p-3 rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant Demo:</span>
              </div>
              <span className="font-mono text-[11px] text-foreground">demo@urjasync.com</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center text-xs text-muted-foreground">
          © 2026 UrjaSync Technologies. Powered by Green Energy.
        </div>
      </div>
    </div>
  );
};

export default Auth;
