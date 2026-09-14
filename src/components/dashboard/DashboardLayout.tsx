import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Smartphone,
  BarChart3,
  IndianRupee,
  Leaf,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  Sliders,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPopover } from "./NotificationPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Smartphone, label: "Devices", path: "/dashboard/devices" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: IndianRupee, label: "Billing", path: "/dashboard/billing" },
  { icon: Leaf, label: "Sustainability", path: "/dashboard/sustainability" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const userInitial = (user?.fullName?.[0] || user?.email?.[0] || "U").toUpperCase();

  const Sidebar = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full bg-card border-r ${
        !mobile && (collapsed ? "w-16" : "w-60")
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {(!collapsed || mobile) && (
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <Zap className="w-4 h-4 fill-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-base tracking-tight leading-none">UrjaSync</span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5">Energy Console</span>
            </div>
          </Link>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto text-primary-foreground shadow-xs">
            <Zap className="w-4 h-4 fill-primary-foreground" />
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="hidden md:flex w-7 h-7 rounded-md items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-64 h-full"
          >
            <Sidebar mobile />
          </motion.div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b bg-card/85 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Real-time platform badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Grid Live</span>
              <span className="text-foreground font-semibold">2.8 kW</span>
            </div>
          </div>

          {/* Right Topbar actions: Notifications + Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Notification Popover */}
            <NotificationPopover />

            {/* Profile Dropdown & Navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User account menu"
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border border-border/80 bg-background/80 hover:bg-accent/80 hover:border-border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs group"
                >
                  <div className="flex flex-col text-right hidden sm:flex leading-tight mr-1">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors max-w-[140px] truncate">
                      {user?.fullName || user?.email?.split("@")[0] || "Urja User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono max-w-[140px] truncate">
                      {user?.email || "user@urjasync.com"}
                    </span>
                  </div>

                  {/* Modern Avatar with live indicator */}
                  <div className="relative">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-xs transition-transform group-hover:scale-105">
                      {userInitial}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background ring-1 ring-emerald-400/30" />
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5 shadow-xl border-border bg-card/95 backdrop-blur-md rounded-xl">
                <div className="px-3 py-2.5 bg-muted/30 rounded-lg mb-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.fullName || "Urja User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    {user?.email || "demo@urjasync.com"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Account Active • Smart Grid Sync
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Primary Navigate to Profile */}
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/settings?tab=profile")}
                  className="cursor-pointer text-xs flex items-center gap-2 py-2 px-2.5 font-medium"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>Profile & Account</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/settings?tab=notifications")}
                  className="cursor-pointer text-xs flex items-center gap-2 py-2 px-2.5"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span>Notification Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/settings?tab=budget")}
                  className="cursor-pointer text-xs flex items-center gap-2 py-2 px-2.5"
                >
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  <span>Energy Budget & Limits</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/settings?tab=preferences")}
                  className="cursor-pointer text-xs flex items-center gap-2 py-2 px-2.5"
                >
                  <Sliders className="w-4 h-4 text-muted-foreground" />
                  <span>Preferences & Display</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={signOut}
                  className="cursor-pointer text-xs flex items-center gap-2 py-2 px-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Right side content container with square box grid pattern and subtle ambient aura */}
        <main className="flex-1 overflow-auto p-4 md:p-6 relative bg-grid-boxes">
          {/* Subtle Ambient Glowing Background Orbs */}
          <div className="pointer-events-none absolute -top-32 right-12 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

          {/* Actual View Content */}
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
