'use client';

import React, { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SustainabilityView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for sustainability metrics
  const carbonFootprintData = [
    { date: 'Jan 1', emissions: 12.4, target: 10, renewable: 3.2 },
    { date: 'Jan 8', emissions: 11.8, target: 10, renewable: 4.1 },
    { date: 'Jan 15', emissions: 10.9, target: 10, renewable: 5.2 },
    { date: 'Jan 22', emissions: 10.2, target: 10, renewable: 6.8 },
    { date: 'Jan 29', emissions: 9.6, target: 10, renewable: 7.4 },
  ];

  const energySources = [
    { source: 'Solar', percentage: 35, color: '#F59E0B', icon: '☀️' },
    { source: 'Grid', percentage: 45, color: '#6B7280', icon: '⚡' },
    { source: 'Wind', percentage: 15, color: '#3B82F6', icon: '💨' },
    { source: 'Battery', percentage: 5, color: '#10B981', icon: '🔋' },
  ];

  const sustainabilityGoals = [
    {
      id: 1,
      title: 'Reduce Carbon Footprint by 30%',
      current: 22,
      target: 30,
      deadline: '2024-12-31',
      status: 'on-track',
      icon: '🌍'
    },
    {
      id: 2,
      title: '50% Renewable Energy Usage',
      current: 35,
      target: 50,
      deadline: '2024-06-30',
      status: 'on-track',
      icon: '🌱'
    },
    {
      id: 3,
      title: 'Zero Waste Generation',
      current: 75,
      target: 100,
      deadline: '2024-09-30',
      status: 'ahead',
      icon: '♻️'
    },
    {
      id: 4,
      title: 'Plant 100 Trees',
      current: 42,
      target: 100,
      deadline: '2024-03-31',
      status: 'behind',
      icon: '🌳'
    },
  ];

  const achievements = [
    { id: 1, title: 'Eco Warrior', description: '30 days of reduced consumption', date: '2024-01-15', icon: '🏆', unlocked: true },
    { id: 2, title: 'Solar Champion', description: '50% solar energy usage', date: '2024-01-10', icon: '☀️', unlocked: true },
    { id: 3, title: 'Carbon Neutral', description: 'Net-zero emissions for a week', date: '2024-01-08', icon: '🌿', unlocked: true },
    { id: 4, title: 'Green Leader', description: 'Top 10% in community', date: '-', icon: '👑', unlocked: false },
  ];

  const environmentalImpact = {
    carbonSaved: 2.4,
    treesEquivalent: 12,
    waterSaved: 850,
    wasteReduced: 45,
    communityRank: 147,
  };

  const recommendations = [
    {
      type: 'solar',
      title: 'Install Solar Panels',
      description: 'Reduce grid dependency by 40% and save ₹2,500/month',
      impact: 'High',
      cost: '₹1,50,000',
      roi: '4 years',
      icon: '☀️'
    },
    {
      type: 'efficiency',
      title: 'Upgrade to LED Lighting',
      description: 'Reduce lighting energy consumption by 75%',
      impact: 'Medium',
      cost: '₹8,000',
      roi: '1.5 years',
      icon: '💡'
    },
    {
      type: 'appliance',
      title: 'Energy-Efficient Appliances',
      description: 'Replace old appliances with 5-star rated ones',
      impact: 'High',
      cost: '₹45,000',
      roi: '3 years',
      icon: '🔌'
    },
    {
      type: 'behavior',
      title: 'Smart Usage Habits',
      description: 'Optimize appliance usage schedules',
      impact: 'Medium',
      cost: 'Free',
      roi: 'Immediate',
      icon: '📱'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sustainability Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor your environmental impact and green energy usage</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Environmental Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CO₂ Saved</p>
              <p className="text-2xl font-bold text-green-600">{environmentalImpact.carbonSaved} tons</p>
            </div>
            <div className="text-3xl">🌍</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trees Equivalent</p>
              <p className="text-2xl font-bold text-green-600">{environmentalImpact.treesEquivalent}</p>
            </div>
            <div className="text-3xl">🌳</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Water Saved</p>
              <p className="text-2xl font-bold text-blue-600">{environmentalImpact.waterSaved}L</p>
            </div>
            <div className="text-3xl">💧</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waste Reduced</p>
              <p className="text-2xl font-bold text-yellow-600">{environmentalImpact.wasteReduced}%</p>
            </div>
            <div className="text-3xl">♻️</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Community Rank</p>
              <p className="text-2xl font-bold text-purple-600">#{environmentalImpact.communityRank}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Green Score</p>
              <p className="text-2xl font-bold text-green-600">A+</p>
            </div>
            <div className="text-3xl">🌿</div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Carbon Footprint Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Carbon Footprint Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={carbonFootprintData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="emissions" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="CO₂ Emissions" />
                      <Area type="monotone" dataKey="renewable" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Renewable Energy" />
                      <Line type="monotone" dataKey="target" stroke="#6B7280" strokeDasharray="5 5" name="Target" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Energy Sources */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Energy Mix</h3>
                  <div className="space-y-3">
                    {energySources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{source.icon}</span>
                          <div>
                            <p className="font-medium">{source.source}</p>
                            <p className="text-sm text-gray-600">{source.percentage}% of total</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full"
                              style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{source.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sustainability Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sustainabilityGoals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-gray-600">Deadline: {goal.deadline}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        goal.status === 'on-track' ? 'bg-green-100 text-green-800' :
                        goal.status === 'ahead' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {goal.current}%</span>
                        <span>Target: {goal.target}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`border rounded-lg p-4 text-center ${
                    achievement.unlocked ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}>
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    {achievement.unlocked ? (
                      <p className="text-xs text-green-600 font-medium">Unlocked: {achievement.date}</p>
                    ) : (
                      <p className="text-xs text-gray-500 font-medium">Locked</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Personalized Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Impact:</span>
                            <span className={`ml-1 px-2 py-1 rounded ${
                              rec.impact === 'High' ? 'bg-red-100 text-red-800' :
                              rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>{rec.impact}</span>
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span>
                            <span className="ml-1">{rec.cost}</span>
                          </div>
                          <div>
                            <span className="font-medium">ROI:</span>
                            <span className="ml-1">{rec.roi}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityView;
