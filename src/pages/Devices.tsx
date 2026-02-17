import { useState } from "react";
import { motion } from "framer-motion";
import {
  Thermometer, Lightbulb, Refrigerator, Tv, Flame, Fan, Wifi, WashingMachine,
  Power
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { devices, rooms } from "@/lib/mock-data";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const iconMap: Record<string, React.ElementType> = {
  Thermometer, Lightbulb, Refrigerator, WashingMachine, Tv, Flame, Fan, Wifi,
};

const DevicesPage = () => {
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [deviceStates, setDeviceStates] = useState(
    Object.fromEntries(devices.map((d) => [d.id, { on: d.status, intensity: 75 }]))
  );

  const filtered = selectedRoom === "All" ? devices : devices.filter((d) => d.room === selectedRoom);

  const toggleDevice = (id: string) =>
    setDeviceStates((p) => ({ ...p, [id]: { ...p[id], on: !p[id].on } }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Devices</h1>
          <p className="text-sm text-muted-foreground">{devices.filter((d) => deviceStates[d.id]?.on).length} active devices</p>
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
            const state = deviceStates[d.id];
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`glass-card transition-all ${state.on ? "energy-glow" : "opacity-70"}`}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.on ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Switch checked={state.on} onCheckedChange={() => toggleDevice(d.id)} />
                    </div>
                    <div>
                      <h3 className="font-medium">{d.name}</h3>
                      <p className="text-xs text-muted-foreground">{d.room}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={state.on ? "default" : "secondary"} className="text-xs">
                        {state.on ? "Active" : "Off"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{d.power} kW</span>
                    </div>
                    {state.on && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Intensity</span>
                          <span>{state.intensity}%</span>
                        </div>
                        <Slider
                          value={[state.intensity]}
                          max={100}
                          step={1}
                          onValueChange={([v]) =>
                            setDeviceStates((p) => ({ ...p, [d.id]: { ...p[d.id], intensity: v } }))
                          }
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
