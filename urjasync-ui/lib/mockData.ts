import { MockData } from './types';
import React from 'react';
import AirVentIcon from '@/components/icons/AirVentIcon';
import WasherIcon from '@/components/icons/WasherIcon';
import LightbulbIcon from '@/components/icons/LightbulbIcon';
import MoonIcon from '@/components/icons/MoonIcon';
import SunIcon from '@/components/icons/SunIcon';

export const MOCK_DATA: MockData = {
  liveUsage: 2.8,
  peakStatus: 'Peak Time',
  estimatedBill: 4250.75,
  totalSavings: 620.5,
  appliances: [
    {
      id: 1,
      name: 'Living Room AC',
      type: 'AC',
      status: 'On',
      consumption: 1.2,
      icon: React.createElement(AirVentIcon, { className: 'w-8 h-8 text-blue-500' }),
    },
    {
      id: 2,
      name: 'Washing Machine',
      type: 'Washer',
      status: 'On',
      consumption: 0.8,
      icon: React.createElement(WasherIcon, { className: 'w-8 h-8 text-gray-700' }),
    },
    {
      id: 3,
      name: 'Kitchen Lights',
      type: 'Light',
      status: 'Off',
      consumption: 0.0,
      icon: React.createElement(LightbulbIcon, { className: 'w-8 h-8 text-gray-400' }),
    },
    {
      id: 4,
      name: 'Bedroom AC',
      type: 'AC',
      status: 'Off',
      consumption: 0.0,
      icon: React.createElement(AirVentIcon, { className: 'w-8 h-8 text-gray-400' }),
    },
    {
      id: 5,
      name: 'Office Lights',
      type: 'Light',
      status: 'On',
      consumption: 0.1,
      icon: React.createElement(LightbulbIcon, { className: 'w-8 h-8 text-yellow-500' }),
    },
    {
      id: 6,
      name: 'Geyser',
      type: 'Geyser',
      status: 'Scheduled',
      consumption: 0.0,
      icon: React.createElement(WasherIcon, { className: 'w-8 h-8 text-blue-300' }),
    },
  ],
  usageHistory: [
    { name: '12 AM', usage: 0.5 },
    { name: '4 AM', usage: 0.4 },
    { name: '8 AM', usage: 1.5 },
    { name: '12 PM', usage: 2.0 },
    { name: '4 PM', usage: 2.8 },
    { name: '8 PM', usage: 3.5 },
  ],
  toDTariff: [
    {
      id: 1,
      period: '10 PM - 6 AM',
      rate: 3.5,
      type: 'Off-Peak',
      icon: React.createElement(MoonIcon, { className: 'text-gray-700' }),
    },
    {
      id: 2,
      period: '6 AM - 6 PM',
      rate: 5.8,
      type: 'Standard',
      icon: React.createElement(SunIcon, { className: 'text-yellow-500' }),
    },
    {
      id: 3,
      period: '6 PM - 10 PM',
      rate: 8.2,
      type: 'Peak',
      icon: React.createElement(SunIcon, { className: 'text-red-500' }),
    },
  ],
  recommendations: [
    {
      id: 'rec1',
      title: 'Pause Washing Machine',
      description:
        'You are running your washer during Peak Time. Pause it and run after 10 PM to save approx. ₹22 on this wash.',
      cta: 'Schedule for 10 PM',
    },
    {
      id: 'rec2',
      title: 'Adjust Living Room AC',
      description:
        'Your AC is at 18°C. Setting it to 24°C during Peak Time can save ₹8/hour.',
      cta: 'Set to 24°C',
    },
  ],
  routines: [
    {
      id: 'r1',
      name: 'Good Night',
      trigger: 'At 11:00 PM',
      actions: ['Turn off all lights', 'Set Bedroom AC to 25°C'],
    },
    {
      id: 'r2',
      name: 'Away From Home',
      trigger: 'Manual Run',
      actions: ['Turn off all appliances', 'Arm security'],
    },
    {
      id: 'r3',
      name: 'Morning',
      trigger: 'At 6:00 AM',
      actions: ['Turn on Geyser', 'Start Coffee Machine'],
    },
  ],
  bills: [
    {
      id: 'bill_003',
      date: 'Oct 1, 2025',
      amount: 4150.0,
      status: 'Paid',
      period: 'Sep 2025',
    },
    {
      id: 'bill_002',
      date: 'Sep 1, 2025',
      amount: 3980.0,
      status: 'Paid',
      period: 'Aug 2025',
    },
  ],
};
