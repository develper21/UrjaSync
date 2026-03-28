import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { userService, UserSettings } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [settingsData] = await Promise.all([
          userService.getSettings(),
        ]);
        setSettings(settingsData);
        setProfile({
          fullName: user?.fullName || "",
          email: user?.email || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateProfile(profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await userService.updateSettings({
        monthlyBudget: settings.monthlyBudget,
        alertThreshold: settings.alertThreshold,
      });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key: keyof UserSettings["notifications"]) => {
    if (!settings) return;
    const newNotifications = { ...settings.notifications, [key]: !settings.notifications[key] };
    try {
      await userService.updateNotifications({ [key]: !settings.notifications[key] });
      setSettings({ ...settings, notifications: newNotifications });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const notificationLabels: Record<string, string> = {
    energyAlerts: "Energy usage alerts",
    costWarnings: "Cost threshold warnings",
    deviceOffline: "Device offline notifications",
    weeklyReports: "Weekly reports",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences</p>
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settings && Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{notificationLabels[key] || key}</span>
                <Switch
                  checked={value}
                  onCheckedChange={() => handleNotificationToggle(key as keyof UserSettings["notifications"])}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="font-display text-lg">Energy Budget</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Monthly Budget (₹)</Label>
              <Input
                type="number"
                value={settings?.monthlyBudget || 5000}
                onChange={(e) => setSettings(settings ? { ...settings, monthlyBudget: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alert Threshold (%)</Label>
              <Input
                type="number"
                value={settings?.alertThreshold || 80}
                onChange={(e) => setSettings(settings ? { ...settings, alertThreshold: parseInt(e.target.value) } : null)}
              />
            </div>
            <Button size="sm" onClick={handleUpdateSettings} disabled={saving}>
              {saving ? "Updating..." : "Update Budget"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
