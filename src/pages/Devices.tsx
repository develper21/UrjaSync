import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Thermometer, Lightbulb, Refrigerator, Tv, Flame, Fan, Wifi, WashingMachine,
  Power, Plus, Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { deviceService, Device, CreateDeviceData } from "@/services/device.service";
import { socketService } from "@/services/socket.service";
import { toast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ElementType> = {
  Thermometer, Lightbulb, Refrigerator, WashingMachine, Tv, Flame, Fan, Wifi,
};

const deviceTypes = [
  { value: "AC", label: "Air Conditioner" },
  { value: "Light", label: "Light" },
  { value: "Fan", label: "Fan" },
  { value: "Refrigerator", label: "Refrigerator" },
  { value: "TV", label: "TV" },
  { value: "Heater", label: "Heater" },
  { value: "WashingMachine", label: "Washing Machine" },
  { value: "Router", label: "Router" },
  { value: "Other", label: "Other" },
];

const DevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<string[]>(["All"]);
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState<Partial<CreateDeviceData>>({
    name: "",
    room: "",
    type: "Light",
    powerRating: 0,
  });

  // Fetch devices and rooms
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const [devicesData, roomsData] = await Promise.all([
        deviceService.getDevices(),
        deviceService.getRooms(),
      ]);
      setDevices(devicesData);
      setRooms(roomsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load devices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    socketService.onDeviceStatus((data) => {
      setDevices((prev) =>
        prev.map((d) =>
          d._id === data.deviceId
            ? { ...d, status: data.status, intensity: data.intensity }
            : d
        )
      );
    });

    return () => {
      socketService.offDeviceStatus();
    };
  }, []);

  const toggleDevice = async (id: string) => {
    const device = devices.find((d) => d._id === id);
    if (!device) return;

    const newStatus = !device.status;

    try {
      await deviceService.toggleDevice(id, newStatus);
      setDevices((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status: newStatus, lastUsed: newStatus ? new Date().toISOString() : d.lastUsed } : d
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control device",
        variant: "destructive",
      });
    }
  };

  const setIntensity = async (id: string, intensity: number) => {
    try {
      await deviceService.setIntensity(id, intensity);
      setDevices((prev) =>
        prev.map((d) => (d._id === id ? { ...d, intensity } : d))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set intensity",
        variant: "destructive",
      });
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      await deviceService.deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d._id !== id));
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive",
      });
    }
  };

  const addDevice = async () => {
    if (!newDevice.name || !newDevice.room || !newDevice.powerRating) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await deviceService.createDevice(newDevice as CreateDeviceData);
      setDevices((prev) => [...prev, created]);
      setIsAddDialogOpen(false);
      setNewDevice({ name: "", room: "", type: "Light", powerRating: 0 });
      toast({
        title: "Success",
        description: "Device added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add device",
        variant: "destructive",
      });
    }
  };

  const filtered = selectedRoom === "All" ? devices : devices.filter((d) => d.room === selectedRoom);
  const activeCount = devices.filter((d) => d.status).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Devices</h1>
            <p className="text-sm text-muted-foreground">{activeCount} active devices</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Device Name</Label>
                  <Input
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="e.g., Living Room AC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Input
                    value={newDevice.room}
                    onChange={(e) => setNewDevice({ ...newDevice, room: e.target.value })}
                    placeholder="e.g., Living Room"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select
                    value={newDevice.type}
                    onValueChange={(value) => setNewDevice({ ...newDevice, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Power Rating (kW)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newDevice.powerRating}
                    onChange={(e) => setNewDevice({ ...newDevice, powerRating: parseFloat(e.target.value) })}
                    placeholder="e.g., 1.5"
                  />
                </div>
                <Button onClick={addDevice} className="w-full">
                  Add Device
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 flex-wrap">
          {rooms.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedRoom === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d, i) => {
            const Icon = iconMap[d.icon] || Power;
            return (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`glass-card transition-all ${d.status ? "energy-glow" : "opacity-70"}`}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={d.status} onCheckedChange={() => toggleDevice(d._id)} />
                        <button
                          onClick={() => deleteDevice(d._id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{d.name}</h3>
                      <p className="text-xs text-muted-foreground">{d.room}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={d.status ? "default" : "secondary"} className="text-xs">
                        {d.status ? "Active" : "Off"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{d.powerRating} kW</span>
                    </div>
                    {d.status && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Intensity</span>
                          <span>{d.intensity}%</span>
                        </div>
                        <Slider
                          value={[d.intensity]}
                          max={100}
                          step={1}
                          onValueChange={([v]) => setIntensity(d._id, v)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DevicesPage;
