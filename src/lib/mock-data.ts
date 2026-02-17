export const energyUsageData = [
  { time: "00:00", usage: 1.2, cost: 4.8 },
  { time: "04:00", usage: 0.8, cost: 3.2 },
  { time: "08:00", usage: 3.5, cost: 21.0 },
  { time: "12:00", usage: 4.2, cost: 25.2 },
  { time: "16:00", usage: 3.8, cost: 22.8 },
  { time: "20:00", usage: 5.1, cost: 30.6 },
  { time: "Now", usage: 4.5, cost: 27.0 },
];

export const weeklyData = [
  { day: "Mon", usage: 18.2, solar: 6.1 },
  { day: "Tue", usage: 21.5, solar: 5.8 },
  { day: "Wed", usage: 16.8, solar: 7.2 },
  { day: "Thu", usage: 22.1, solar: 4.9 },
  { day: "Fri", usage: 19.4, solar: 6.5 },
  { day: "Sat", usage: 24.6, solar: 8.1 },
  { day: "Sun", usage: 20.3, solar: 7.4 },
];

export const devices = [
  { id: "1", name: "Living Room AC", room: "Living Room", power: 1.5, status: true, icon: "Thermometer" },
  { id: "2", name: "Ceiling Light", room: "Bedroom", power: 0.06, status: true, icon: "Lightbulb" },
  { id: "3", name: "Refrigerator", room: "Kitchen", power: 0.15, status: true, icon: "Refrigerator" },
  { id: "4", name: "Washing Machine", room: "Utility", power: 0.5, status: false, icon: "WashingMachine" },
  { id: "5", name: "TV", room: "Living Room", power: 0.12, status: true, icon: "Tv" },
  { id: "6", name: "Water Heater", room: "Bathroom", power: 2.0, status: false, icon: "Flame" },
  { id: "7", name: "Ceiling Fan", room: "Bedroom", power: 0.07, status: true, icon: "Fan" },
  { id: "8", name: "Router", room: "Study", power: 0.02, status: true, icon: "Wifi" },
];

export const rooms = ["All", "Living Room", "Bedroom", "Kitchen", "Utility", "Bathroom", "Study"];

export const carbonData = [
  { month: "Jan", emissions: 145 },
  { month: "Feb", emissions: 132 },
  { month: "Mar", emissions: 121 },
  { month: "Apr", emissions: 115 },
  { month: "May", emissions: 98 },
  { month: "Jun", emissions: 87 },
];

export const tariffSchedule = [
  { period: "Off-Peak", time: "10PM - 6AM", rate: 4.0, color: "energy-green" },
  { period: "Mid-Peak", time: "6AM - 10AM & 6PM - 10PM", rate: 6.0, color: "energy-yellow" },
  { period: "Peak", time: "10AM - 6PM", rate: 8.5, color: "energy-red" },
];
