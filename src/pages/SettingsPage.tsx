import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const SettingsPage = () => (
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
            <Input defaultValue="User" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="user@urjasync.com" />
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display text-lg">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Energy usage alerts", "Cost threshold warnings", "Device offline notifications", "Weekly reports"].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <span className="text-sm">{n}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display text-lg">Energy Budget</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Monthly Budget (₹)</Label>
            <Input type="number" defaultValue="5000" />
          </div>
          <div className="space-y-2">
            <Label>Alert Threshold (%)</Label>
            <Input type="number" defaultValue="80" />
          </div>
          <Button size="sm">Update Budget</Button>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default SettingsPage;
