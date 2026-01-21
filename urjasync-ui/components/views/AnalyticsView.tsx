'use client';

import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for analytics
  const consumptionData = [
    { time: '00:00', consumption: 2.4, cost: 12, predicted: 2.2 },
    { time: '04:00', consumption: 1.8, cost: 9, predicted: 1.9 },
    { time: '08:00', consumption: 4.2, cost: 21, predicted: 4.0 },
    { time: '12:00', consumption: 5.8, cost: 29, predicted: 6.0 },
    { time: '16:00', consumption: 4.9, cost: 24, predicted: 4.7 },
    { time: '20:00', consumption: 6.2, cost: 31, predicted: 6.4 },
    { time: '23:59', consumption: 3.1, cost: 15, predicted: 3.0 },
  ];

  const applianceBreakdown = [
    { name: 'AC', value: 35, color: '#3B82F6' },
    { name: 'Fridge', value: 20, color: '#10B981' },
    { name: 'Washing Machine', value: 15, color: '#F59E0B' },
    { name: 'TV', value: 12, color: '#8B5CF6' },
    { name: 'Lights', value: 10, color: '#EF4444' },
    { name: 'Others', value: 8, color: '#6B7280' },
  ];

  const monthlyTrend = [
    { month: 'Jan', consumption: 320, cost: 1600, savings: 0 },
    { month: 'Feb', consumption: 290, cost: 1450, savings: 150 },
    { month: 'Mar', consumption: 310, cost: 1550, savings: 50 },
    { month: 'Apr', consumption: 280, cost: 1400, savings: 200 },
    { month: 'May', consumption: 350, cost: 1750, savings: -50 },
    { month: 'Jun', consumption: 380, cost: 1900, savings: -100 },
  ];

  const aiInsights = [
    {
      type: 'warning',
      title: 'Peak Hour Alert',
      description: 'Your consumption peaks between 8-10 PM. Consider shifting heavy appliances to off-peak hours.',
      potentialSavings: '₹450/month',
      icon: '⚠️'
    },
    {
      type: 'success',
      title: 'Great Progress!',
      description: 'You saved 12% more energy this month compared to last month.',
      potentialSavings: '₹320 saved',
      icon: '📈'
    },
    {
      type: 'info',
      title: 'AC Optimization',
      description: 'Your AC consumes 35% of total energy. A 2°C adjustment could save 15% on cooling costs.',
      potentialSavings: '₹280/month',
      icon: '❄️'
    }
  ];

  const predictions = [
    { date: 'Tomorrow', predicted: 28.5, confidence: 92 },
    { date: 'This Week', predicted: 195, confidence: 88 },
    { date: 'This Month', predicted: 820, confidence: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">AI-powered insights and energy consumption patterns</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
            insight.type === 'success' ? 'bg-green-50 border-green-400' :
            'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                <p className="text-sm font-medium mt-2 text-green-600">{insight.potentialSavings}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption vs Prediction */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Consumption vs AI Prediction</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="consumption" stroke="#3B82F6" name="Actual" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" stroke="#10B981" name="AI Predicted" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appliance Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Appliance Energy Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={applianceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name}: ${props.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {applianceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend and Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Monthly Consumption Trend & Savings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="consumption" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Consumption (kWh)" />
              <Area type="monotone" dataKey="savings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Savings (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Predictions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">AI Predictions</h3>
          <div className="space-y-4">
            {predictions.map((pred, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{pred.date}</span>
                  <span className="text-sm text-gray-500">{pred.confidence}% confidence</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{pred.predicted}</span>
                  <span className="text-sm text-gray-600">kWh predicted</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${pred.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Daily Consumption</p>
              <p className="text-2xl font-bold text-gray-900">24.3 kWh</p>
              <p className="text-sm text-green-600">↓ 8% from last week</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peak Hour Usage</p>
              <p className="text-2xl font-bold text-gray-900">8-10 PM</p>
              <p className="text-sm text-red-600">↑ 15% higher than average</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-sm text-green-600">↑ 2.1% improvement</p>
            </div>
            <div className="text-3xl">🤖</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold text-gray-900">₹1,240</p>
              <p className="text-sm text-green-600">Per month</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
