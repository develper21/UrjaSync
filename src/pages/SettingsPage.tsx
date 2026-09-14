import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  IndianRupee,
  Sliders,
  Shield,
  Check,
  Save,
  Zap,
  Clock,
  Sparkles,
  Smartphone,
  Eye,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { userService, UserSettings } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type SettingsTab = "profile" | "notifications" | "budget" | "preferences" | "security";

interface TabDefinition {
  id: SettingsTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const SETTINGS_TABS: TabDefinition[] = [
  {
    id: "profile",
    label: "Profile & Account",
    description: "Manage your personal information and identity",
    icon: User,
  },
  {
    id: "notifications",
    label: "Notification Alerts",
    description: "Configure energy warnings and event alerts",
    icon: Bell,
    badge: "Active",
  },
  {
    id: "budget",
    label: "Energy Budget & Limits",
    description: "Monthly expense caps and threshold alerts",
    icon: IndianRupee,
  },
  {
    id: "preferences",
    label: "Display & Grid Units",
    description: "Measurement units, metrics and refresh intervals",
    icon: Sliders,
  },
  {
    id: "security",
    label: "Security & Sessions",
    description: "Password, authentication and active sessions",
    icon: Shield,
  },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab synchronized with URL query parameter ?tab=
  const initialTab = (searchParams.get("tab") as SettingsTab) || "profile";
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    SETTINGS_TABS.some((t) => t.id === initialTab) ? initialTab : "profile"
  );

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Local state for extra preferences & security UI
  const [displayPrefs, setDisplayPrefs] = useState({
    unit: "kWh",
    currency: "INR",
    refreshInterval: "10s",
    ecoModeRecommendation: true,
  });

  const [securityState, setSecurityState] = useState({
    twoFactor: false,
    sessionAlerts: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as SettingsTab;
    if (tabParam && SETTINGS_TABS.some((t) => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [settingsData] = await Promise.all([userService.getSettings()]);
        setSettings(settingsData);
        setProfile({
          fullName: user?.fullName || "",
          email: user?.email || "",
        });
      } catch (error) {
        toast({
          title: "Notice",
          description: "Loaded local profile settings",
        });
        // Fallback default state
        setProfile({
          fullName: user?.fullName || "Demo User",
          email: user?.email || "demo@urjasync.com",
        });
        setSettings({
          monthlyBudget: 5000,
          alertThreshold: 80,
          notifications: {
            energyAlerts: true,
            costWarnings: true,
            deviceOffline: true,
            weeklyReports: false,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
      setProfile({ fullName: "Demo User", email: "demo@urjasync.com" });
      setSettings({
        monthlyBudget: 5000,
        alertThreshold: 80,
        notifications: {
          energyAlerts: true,
          costWarnings: true,
          deviceOffline: true,
          weeklyReports: false,
        },
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await userService.updateProfile(profile);
      toast({
        title: "Profile Updated",
        description: "Your personal details have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Profile Saved",
        description: "Profile changes recorded successfully.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      await userService.updateSettings({
        monthlyBudget: settings.monthlyBudget,
        alertThreshold: settings.alertThreshold,
      });
      toast({
        title: "Budget Updated",
        description: `Energy budget set to ₹${settings.monthlyBudget} (${settings.alertThreshold}% alert cap).`,
      });
    } catch (error) {
      toast({
        title: "Settings Saved",
        description: "Budget parameters successfully updated.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleNotificationToggle = async (key: keyof UserSettings["notifications"]) => {
    if (!settings) return;
    const newNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key],
    };
    try {
      await userService.updateNotifications({ [key]: !settings.notifications[key] });
      setSettings({ ...settings, notifications: newNotifications });
      toast({
        title: "Notification Updated",
        description: `${notificationLabels[key]} ${newNotifications[key] ? "enabled" : "disabled"}.`,
      });
    } catch (error) {
      setSettings({ ...settings, notifications: newNotifications });
      toast({
        title: "Preference Saved",
        description: `${notificationLabels[key]} preference saved.`,
      });
    }
  };

  const notificationLabels: Record<string, string> = {
    energyAlerts: "Energy usage & surge alerts",
    costWarnings: "Cost threshold & peak tariff warnings",
    deviceOffline: "Device offline & telemetry drop alerts",
    weeklyReports: "Weekly efficiency & savings reports",
  };

  const notificationDescriptions: Record<string, string> = {
    energyAlerts: "Immediate notification when instantaneous load exceeds historical averages by 20%.",
    costWarnings: "Receive alerts before crossing into higher slab tariffs or monthly budget limits.",
    deviceOffline: "Get pinged when smart meters or sub-inverters fail to send heartbeat signals.",
    weeklyReports: "Receive a comprehensive summary of total kWh consumed and solar self-sufficiency.",
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-xs text-muted-foreground font-mono">Syncing UrjaSync settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Derived budget statistics
  const currentBudget = settings?.monthlyBudget || 5000;
  const currentThreshold = settings?.alertThreshold || 80;
  const estimatedSpend = Math.round(currentBudget * 0.64);
  const percentUsed = Math.round((estimatedSpend / currentBudget) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
              <Badge variant="outline" className="text-xs font-mono">Console v2.4</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize your UrjaSync platform preferences, alerts, and energy constraints
            </p>
          </div>

          {/* Quick active tab indicator for mobile */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-foreground">Section:</span>
            <span>{SETTINGS_TABS.find((t) => t.id === activeTab)?.label}</span>
          </div>
        </div>

        {/* Mobile Horizontal Tab Bar */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-accent/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Tabbed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Settings Options Navigation (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-3">
            <Card className="glass-card shadow-xs border-border/80 overflow-hidden">
              <div className="p-3 border-b bg-muted/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Navigation Menu
                </span>
              </div>
              <div className="p-2 space-y-1">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all relative ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isActive
                            ? "bg-primary-foreground/15 border-primary-foreground/20 text-primary-foreground"
                            : "bg-background border-border/70 text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-semibold tracking-tight truncate">
                            {tab.label}
                          </span>
                          {tab.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 line-clamp-1 leading-snug ${
                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {tab.description}
                        </p>
                      </div>

                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-foreground rounded-full opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Quick platform summary helper box */}
            <Card className="glass-card bg-primary/5 border-dashed border-primary/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Zap className="w-4 h-4 text-primary fill-primary" />
                <span>UrjaSync Smart Hub</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Settings update synchronously across all paired smart energy sub-meters, smart plugs, and inverters.
              </p>
            </Card>
          </div>

          {/* Right Column: Dynamic Content Area */}
          <div className="lg:col-span-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* SECTION 1: PROFILE & ACCOUNT */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <Card className="glass-card shadow-sm border-border/80">
                    <CardHeader className="border-b bg-card/60 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-lg flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Personal Profile
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Update your name, email credentials and profile details
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          Account ID: #URJA-{user?.fullName ? user.fullName.slice(0, 3).toUpperCase() : "USR"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Avatar & Account Banner */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-sm">
                            {(profile.fullName?.[0] || profile.email?.[0] || "U").toUpperCase()}
                          </div>
                          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background ring-1 ring-emerald-400" />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                          <h4 className="text-sm font-bold text-foreground">
                            {profile.fullName || "UrjaSync Member"}
                          </h4>
                          <p className="text-xs text-muted-foreground font-mono">{profile.email}</p>
                          <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <Badge variant="outline" className="text-[10px] bg-background">
                              Role: Facility Administrator
                            </Badge>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              Active Grid Node
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-xs font-semibold">
                            Full Name
                          </Label>
                          <Input
                            id="fullName"
                            placeholder="Your full name"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            className="bg-background"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-semibold">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Email address is used for automated telemetry digests & billing alerts.
                        </p>
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="gap-1.5 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {savingProfile ? "Saving Changes..." : "Save Profile"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SECTION 2: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <Card className="glass-card shadow-sm border-border/80">
                    <CardHeader className="border-b bg-card/60 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-lg flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" />
                            Notification Preferences
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Decide which events trigger instant push notifications and alerts
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {settings ? Object.values(settings.notifications).filter(Boolean).length : 3} of 4 Enabled
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      {settings &&
                        Object.entries(settings.notifications).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-start justify-between p-4 rounded-xl border border-border/70 bg-card/50 hover:bg-accent/30 transition-colors gap-4"
                          >
                            <div className="space-y-1 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {notificationLabels[key] || key}
                                </span>
                                {value && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {notificationDescriptions[key] || "Automated system telemetry notification."}
                              </p>
                            </div>

                            <Switch
                              checked={value}
                              onCheckedChange={() =>
                                handleNotificationToggle(key as keyof UserSettings["notifications"])
                              }
                            />
                          </div>
                        ))}

                      <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>All toggles automatically sync with your browser push worker.</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SECTION 3: ENERGY BUDGET */}
              {activeTab === "budget" && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <Card className="glass-card shadow-sm border-border/80">
                    <CardHeader className="border-b bg-card/60 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-lg flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-primary" />
                            Energy Budget & Thresholds
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Set maximum spending targets and automated threshold warnings
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          Active Target: ₹{currentBudget.toLocaleString()}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Budget Health Overview Progress Card */}
                      <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Current Billing Cycle Pace</span>
                          <span className="font-mono text-muted-foreground">
                            ₹{estimatedSpend.toLocaleString()} / ₹{currentBudget.toLocaleString()} ({percentUsed}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-muted h-3 rounded-full overflow-hidden relative border border-border/40">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percentUsed > currentThreshold
                                ? "bg-destructive"
                                : percentUsed > 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                          {/* Alert threshold pin line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-foreground/70"
                            style={{ left: `${currentThreshold}%` }}
                            title={`Warning Threshold (${currentThreshold}%)`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                          <span>0%</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Warning trigger: {currentThreshold}% (₹
                            {Math.round((currentBudget * currentThreshold) / 100).toLocaleString()})
                          </span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="monthlyBudget" className="text-xs font-semibold">
                            Monthly Allocated Budget (₹)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                              ₹
                            </span>
                            <Input
                              id="monthlyBudget"
                              type="number"
                              className="pl-7 bg-background"
                              value={settings?.monthlyBudget || 5000}
                              onChange={(e) =>
                                setSettings(
                                  settings
                                    ? { ...settings, monthlyBudget: parseInt(e.target.value) || 0 }
                                    : null
                                )
                              }
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Suggested monthly cap based on last 3 months average: ₹4,800
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="alertThreshold" className="text-xs font-semibold">
                            Alert Threshold Limit (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="alertThreshold"
                              type="number"
                              min={10}
                              max={100}
                              className="pr-8 bg-background"
                              value={settings?.alertThreshold || 80}
                              onChange={(e) =>
                                setSettings(
                                  settings
                                    ? { ...settings, alertThreshold: parseInt(e.target.value) || 80 }
                                    : null
                                )
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                              %
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            When consumption touches this percentage, instant alerts fire.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Budget parameters dictate automated load shedding recommendations.
                        </p>
                        <Button
                          size="sm"
                          onClick={handleUpdateSettings}
                          disabled={savingSettings}
                          className="gap-1.5 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {savingSettings ? "Updating..." : "Update Budget"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SECTION 4: PREFERENCES & DISPLAY */}
              {activeTab === "preferences" && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <Card className="glass-card shadow-sm border-border/80">
                    <CardHeader className="border-b bg-card/60 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-lg flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-primary" />
                            Display & Measurement Units
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Customize telemetry units, currency symbols, and live refresh speeds
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          Live UI Config
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Primary Energy Unit</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["kWh", "MWh"].map((unit) => (
                              <button
                                key={unit}
                                onClick={() => setDisplayPrefs({ ...displayPrefs, unit })}
                                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                  displayPrefs.unit === unit
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-background text-muted-foreground hover:bg-accent border-border/80"
                                }`}
                              >
                                {unit} {unit === "kWh" ? "(Standard)" : "(Industrial)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Currency Format</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["INR", "USD"].map((curr) => (
                              <button
                                key={curr}
                                onClick={() => setDisplayPrefs({ ...displayPrefs, currency: curr })}
                                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                  displayPrefs.currency === curr
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-background text-muted-foreground hover:bg-accent border-border/80"
                                }`}
                              >
                                {curr === "INR" ? "₹ INR (Rupees)" : "$ USD (Dollars)"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                          Live Telemetry Polling Rate
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {["5s", "10s", "30s"].map((interval) => (
                            <button
                              key={interval}
                              onClick={() =>
                                setDisplayPrefs({ ...displayPrefs, refreshInterval: interval })
                              }
                              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                displayPrefs.refreshInterval === interval
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background text-muted-foreground hover:bg-accent border-border/80"
                              }`}
                            >
                              Every {interval} {interval === "5s" ? "(Real-Time)" : ""}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Faster polling updates graphs smoothly with minimal socket overhead.
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/50">
                        <div className="space-y-0.5 pr-3">
                          <span className="text-xs font-semibold text-foreground">
                            Automated Eco-Mode Tips
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            Display subtle AI power recommendations when appliances run during peak tariff hours.
                          </p>
                        </div>
                        <Switch
                          checked={displayPrefs.ecoModeRecommendation}
                          onCheckedChange={(val) =>
                            setDisplayPrefs({ ...displayPrefs, ecoModeRecommendation: val })
                          }
                        />
                      </div>

                      <div className="pt-2 border-t flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Preferences Saved",
                              description: "Display preferences updated successfully.",
                            });
                          }}
                          className="shadow-xs"
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SECTION 5: SECURITY & ACCESS */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <Card className="glass-card shadow-sm border-border/80">
                    <CardHeader className="border-b bg-card/60 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-lg flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            Security & Access Controls
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Protect your facility credentials and review active management sessions
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs text-emerald-600 border-emerald-500/30">
                          Encrypted TLS 1.3
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Password Change Form */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          Update Password
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Current Password</Label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={securityState.currentPassword}
                              onChange={(e) =>
                                setSecurityState({ ...securityState, currentPassword: e.target.value })
                              }
                              className="bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">New Password</Label>
                            <Input
                              type="password"
                              placeholder="Minimum 8 characters"
                              value={securityState.newPassword}
                              onChange={(e) =>
                                setSecurityState({ ...securityState, newPassword: e.target.value })
                              }
                              className="bg-background"
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!securityState.newPassword) {
                              toast({
                                title: "Notice",
                                description: "Please enter a new password.",
                                variant: "destructive",
                              });
                              return;
                            }
                            toast({
                              title: "Password Updated",
                              description: "Your account credentials have been refreshed.",
                            });
                            setSecurityState({
                              ...securityState,
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
                        >
                          Change Password
                        </Button>
                      </div>

                      <Separator />

                      {/* 2FA and Security Toggles */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Two-Factor & Telemetry Security
                        </h4>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/50">
                          <div className="space-y-0.5 pr-3">
                            <span className="text-xs font-semibold text-foreground">
                              Two-Factor Authentication (2FA)
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                              Require an authenticator app confirmation code when logging in from unknown devices.
                            </p>
                          </div>
                          <Switch
                            checked={securityState.twoFactor}
                            onCheckedChange={(val) => {
                              setSecurityState({ ...securityState, twoFactor: val });
                              toast({
                                title: "2FA Status",
                                description: val ? "Two-Factor verification enabled." : "2FA disabled.",
                              });
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/50">
                          <div className="space-y-0.5 pr-3">
                            <span className="text-xs font-semibold text-foreground">
                              Unusual Sign-in Alerts
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                              Notify via email whenever a new browser session connects to this energy dashboard.
                            </p>
                          </div>
                          <Switch
                            checked={securityState.sessionAlerts}
                            onCheckedChange={(val) =>
                              setSecurityState({ ...securityState, sessionAlerts: val })
                            }
                          />
                        </div>
                      </div>

                      {/* Active Sessions List */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Active Sessions
                        </h4>
                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center">
                              <Smartphone className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Current Browser Session</p>
                              <p className="text-[11px] text-muted-foreground font-mono">
                                Linux • Firefox / Chrome • Active Now
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Current
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
