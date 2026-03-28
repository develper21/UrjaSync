import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Device from '../models/Device.model.js';
import TariffSchedule from '../models/TariffSchedule.model.js';
import EnergyReading from '../models/EnergyReading.model.js';
import Bill from '../models/Bill.model.js';
import Sustainability from '../models/Sustainability.model.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Device.deleteMany({}),
      TariffSchedule.deleteMany({}),
      EnergyReading.deleteMany({}),
      Bill.deleteMany({}),
      Sustainability.deleteMany({})
    ]);
    console.log('✅ Cleared existing data');

    // Create demo user
    const demoUser = await User.create({
      email: 'demo@urjasync.com',
      password: 'demo123',
      fullName: 'Demo User',
      settings: {
        monthlyBudget: 5000,
        alertThreshold: 80,
        notifications: {
          energyAlerts: true,
          costWarnings: true,
          deviceOffline: true,
          weeklyReports: true
        }
      }
    });
    console.log('✅ Created demo user');

    // Create default tariff schedule
    const tariffSchedule = await TariffSchedule.create({
      name: 'Maharashtra Residential',
      slabs: [
        {
          name: 'Off-Peak',
          timeRange: { start: '22:00', end: '06:00' },
          rate: 4.0,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        {
          name: 'Mid-Peak',
          timeRange: { start: '06:00', end: '10:00' },
          rate: 6.0,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        {
          name: 'Peak',
          timeRange: { start: '10:00', end: '18:00' },
          rate: 8.5,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        {
          name: 'Mid-Peak',
          timeRange: { start: '18:00', end: '22:00' },
          rate: 6.0,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }
      ]
    });
    console.log('✅ Created tariff schedule');

    // Create demo devices
    const devices = await Device.create([
      { userId: demoUser._id, name: 'Living Room AC', room: 'Living Room', type: 'AC', powerRating: 1.5, icon: 'Thermometer', status: true, intensity: 75 },
      { userId: demoUser._id, name: 'Ceiling Light', room: 'Bedroom', type: 'Light', powerRating: 0.06, icon: 'Lightbulb', status: true, intensity: 100 },
      { userId: demoUser._id, name: 'Refrigerator', room: 'Kitchen', type: 'Refrigerator', powerRating: 0.15, icon: 'Refrigerator', status: true },
      { userId: demoUser._id, name: 'Washing Machine', room: 'Utility', type: 'WashingMachine', powerRating: 0.5, icon: 'WashingMachine', status: false },
      { userId: demoUser._id, name: 'Smart TV', room: 'Living Room', type: 'TV', powerRating: 0.12, icon: 'Tv', status: true },
      { userId: demoUser._id, name: 'Water Heater', room: 'Bathroom', type: 'Heater', powerRating: 2.0, icon: 'Flame', status: false },
      { userId: demoUser._id, name: 'Ceiling Fan', room: 'Bedroom', type: 'Fan', powerRating: 0.07, icon: 'Fan', status: true, intensity: 80 },
      { userId: demoUser._id, name: 'WiFi Router', room: 'Study', type: 'Router', powerRating: 0.02, icon: 'Wifi', status: true }
    ]);
    console.log('✅ Created demo devices');

    // Generate sample energy readings for today
    const readings = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let hour = 0; hour <= now.getHours(); hour++) {
      const timestamp = new Date(today);
      timestamp.setHours(hour);
      
      // Simulate realistic usage patterns
      let baseUsage = 0.5;
      if (hour >= 6 && hour <= 9) baseUsage = 2.5; // Morning peak
      if (hour >= 10 && hour <= 17) baseUsage = 1.2; // Day time
      if (hour >= 18 && hour <= 22) baseUsage = 4.0; // Evening peak
      if (hour >= 23 || hour <= 5) baseUsage = 0.3; // Night
      
      const usage = baseUsage + (Math.random() * 0.5);
      const rate = hour >= 10 && hour <= 17 ? 8.5 : (hour >= 22 || hour <= 6 ? 4.0 : 6.0);
      const cost = usage * rate;
      const solar = hour >= 9 && hour <= 17 ? usage * 0.3 : 0;

      readings.push({
        userId: demoUser._id,
        deviceId: null,
        timestamp,
        usage,
        cost,
        rate,
        solarGeneration: solar
      });
    }

    await EnergyReading.insertMany(readings);
    console.log('✅ Created sample energy readings');

    // Create sample bills
    const months = ['October 2025', 'November 2025', 'December 2025', 'January 2026'];
    const bills = months.map((month, index) => ({
      userId: demoUser._id,
      month: month.split(' ')[0],
      year: parseInt(month.split(' ')[1]),
      amount: 3500 + (index * 200),
      unitsConsumed: 400 + (index * 25),
      solarCredits: 50 + (index * 10),
      status: 'paid',
      dueDate: new Date(2025, 9 + index, 15),
      paidDate: new Date(2025, 9 + index, 10),
      savings: index > 0 ? 100 + (index * 50) : 0
    }));

    await Bill.insertMany(bills);
    console.log('✅ Created sample bills');

    // Create sustainability record
    await Sustainability.create({
      userId: demoUser._id,
      goals: [
        { type: 'co2_reduction', target: 30, current: 21.6, unit: '%', progress: 72 },
        { type: 'solar_usage', target: 50, current: 24, unit: '%', progress: 48 },
        { type: 'zero_waste', target: 20, current: 7, unit: 'days', progress: 35 }
      ],
      carbonStats: {
        savedThisYear: 2.4,
        treesEquivalent: 38,
        waterSaved: 12400
      }
    });
    console.log('✅ Created sustainability data');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Email: demo@urjasync.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

export default seedDatabase;
