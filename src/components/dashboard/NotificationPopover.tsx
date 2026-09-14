import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Zap,
  Cpu,
  IndianRupee,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export type NotificationCategory = "all" | "energy" | "devices" | "billing";

export interface UrjaNotification {
  id: string;
  category: "energy" | "devices" | "billing";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "critical" | "warning" | "info" | "success";
  actionUrl?: string;
  actionText?: string;
}

const INITIAL_NOTIFICATIONS: UrjaNotification[] = [
  {
    id: "notif-1",
    category: "energy",
    title: "Surge Alert: High Consumption",
    message: "Main Distribution Panel exceeded 5.8 kW during peak tariff hours.",
    timestamp: "10m ago",
    read: false,
    severity: "warning",
    actionUrl: "/dashboard/analytics",
    actionText: "Analyze Load",
  },
  {
    id: "notif-2",
    category: "energy",
    title: "Solar Export Peak Reached",
    message: "Rooftop PV generated 4.2 kW; net export credits added to grid account.",
    timestamp: "45m ago",
    read: false,
    severity: "success",
    actionUrl: "/dashboard/sustainability",
    actionText: "View Solar Data",
  },
  {
    id: "notif-3",
    category: "devices",
    title: "HVAC Zone 2 Offline",
    message: "Smart sensor timed out. Last telemetry heartbeat received 25 minutes ago.",
    timestamp: "1h ago",
    read: false,
    severity: "critical",
    actionUrl: "/dashboard/devices",
    actionText: "Check Device",
  },
  {
    id: "notif-4",
    category: "billing",
    title: "Monthly Budget Threshold (82%)",
    message: "You have consumed ₹4,100 of your ₹5,000 monthly allocated energy budget.",
    timestamp: "3h ago",
    read: false,
    severity: "warning",
    actionUrl: "/dashboard/settings?tab=budget",
    actionText: "Adjust Budget",
  },
  {
    id: "notif-5",
    category: "devices",
    title: "EV Fast Charger Cycle Complete",
    message: "Vehicle battery charged to 90% (24.6 kWh transferred at off-peak rates).",
    timestamp: "5h ago",
    read: true,
    severity: "info",
    actionUrl: "/dashboard/devices",
    actionText: "View Charger",
  },
  {
    id: "notif-6",
    category: "billing",
    title: "Peak Tariff Rate Started",
    message: "Peak hour pricing (₹8.20/kWh) active until 10:00 PM. Automated eco-mode recommended.",
    timestamp: "1d ago",
    read: true,
    severity: "info",
    actionUrl: "/dashboard/billing",
    actionText: "View Rates",
  },
];

export const NotificationPopover = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<UrjaNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === "all") return true;
    return n.category === activeCategory;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getCategoryIcon = (category: UrjaNotification["category"], severity: UrjaNotification["severity"]) => {
    switch (category) {
      case "energy":
        return severity === "warning" ? (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        ) : (
          <Zap className="w-4 h-4 text-emerald-500" />
        );
      case "devices":
        return severity === "critical" ? (
          <Cpu className="w-4 h-4 text-rose-500" />
        ) : (
          <Cpu className="w-4 h-4 text-sky-500" />
        );
      case "billing":
        return <IndianRupee className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-foreground" />;
    }
  };

  const getSeverityBadge = (severity: UrjaNotification["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Critical
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Alert
          </span>
        );
      case "success":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Eco Gain
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Info
          </span>
        );
    }
  };

  const categories: { id: NotificationCategory; label: string; count?: number }[] = [
    { id: "all", label: "All", count: notifications.length },
    {
      id: "energy",
      label: "Energy",
      count: notifications.filter((n) => n.category === "energy").length,
    },
    {
      id: "devices",
      label: "Devices",
      count: notifications.filter((n) => n.category === "devices").length,
    },
    {
      id: "billing",
      label: "Budget & Billing",
      count: notifications.filter((n) => n.category === "billing").length,
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Open notifications"
          className="relative w-9 h-9 rounded-lg border border-border/80 bg-background/60 hover:bg-accent/80 hover:border-border transition-all flex items-center justify-center text-foreground group"
        >
          <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
              <span className="relative">{unreadCount}</span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[420px] p-0 shadow-xl border-border bg-card/95 backdrop-blur-md overflow-hidden rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold tracking-tight">Urja Notifications</h4>
                {unreadCount > 0 ? (
                  <Badge variant="destructive" className="h-4 px-1.5 text-[10px] font-medium leading-none">
                    {unreadCount} new
                  </Badge>
                ) : (
                  <span className="text-[11px] text-muted-foreground">All caught up</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark read</span>
              </Button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-sections / Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/20 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded-full ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
          <AnimatePresence initial={false}>
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No alerts in the {activeCategory === "all" ? "current queue" : activeCategory} section.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                    notif.read
                      ? "bg-card hover:bg-accent/40"
                      : "bg-accent/20 hover:bg-accent/40"
                  }`}
                >
                  {/* Category icon avatar */}
                  <div className="w-8 h-8 rounded-lg bg-background border border-border/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getCategoryIcon(notif.category, notif.severity)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-xs font-semibold ${notif.read ? "text-foreground" : "text-foreground"}`}>
                        {notif.title}
                      </span>
                      {getSeverityBadge(notif.severity)}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {notif.timestamp}
                      </span>

                      {notif.actionUrl && (
                        <Link
                          to={notif.actionUrl}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <span>{notif.actionText || "View Details"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Action buttons on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-2 flex items-center gap-1">
                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        title="Mark as read"
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-background/80"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => removeNotification(notif.id, e)}
                      title="Dismiss"
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background/80"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t bg-muted/40 flex items-center justify-between text-xs">
          <Link
            to="/dashboard/settings?tab=notifications"
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Notification Settings →
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono">
            UrjaSync Real-Time Telemetry
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
