'use client';

import React, { useState } from 'react';

const MarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trade');

  // Mock data for marketplace
  const buyOrders = [
    { id: 1, user: 'Rahul S.', amount: 50, price: 8.5, time: '2 min ago', rating: 4.8, verified: true },
    { id: 2, user: 'Priya M.', amount: 30, price: 8.2, time: '5 min ago', rating: 4.6, verified: true },
    { id: 3, user: 'Amit K.', amount: 75, price: 8.8, time: '8 min ago', rating: 4.9, verified: false },
    { id: 4, user: 'Sneha L.', amount: 25, price: 8.1, time: '12 min ago', rating: 4.7, verified: true },
  ];

  const sellOrders = [
    { id: 5, user: 'Vikram P.', amount: 40, price: 9.2, time: '1 min ago', rating: 4.8, verified: true },
    { id: 6, user: 'Anita R.', amount: 60, price: 9.5, time: '3 min ago', rating: 4.9, verified: true },
    { id: 7, user: 'Rohit S.', amount: 35, price: 9.1, time: '6 min ago', rating: 4.5, verified: false },
    { id: 8, user: 'Kavita M.', amount: 80, price: 9.8, time: '10 min ago', rating: 4.7, verified: true },
  ];

  const myTransactions = [
    { id: 'TXN001', type: 'sell', amount: 25, price: 9.3, total: 232.5, date: '2024-01-15', status: 'completed', buyer: 'Rahul S.' },
    { id: 'TXN002', type: 'buy', amount: 40, price: 8.4, total: 336, date: '2024-01-14', status: 'completed', seller: 'Priya M.' },
    { id: 'TXN003', type: 'sell', amount: 30, price: 9.1, total: 273, date: '2024-01-13', status: 'pending', buyer: 'Amit K.' },
  ];

  const communityStats = {
    totalTraders: 1247,
    totalEnergy: 5240,
    avgPrice: 8.9,
    totalSavings: 45600,
    activeNow: 89,
  };

  const createOrder = () => {
    // Handle order creation
    console.log('Creating new order...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Energy Marketplace</h1>
          <p className="text-gray-600 mt-1">Peer-to-peer energy trading platform</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={createOrder}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Order
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Trading History
          </button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Traders</p>
              <p className="text-2xl font-bold text-gray-900">{communityStats.totalTraders}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Energy Traded (kWh)</p>
              <p className="text-2xl font-bold text-gray-900">{communityStats.totalEnergy}</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Price (₹/kWh)</p>
              <p className="text-2xl font-bold text-gray-900">{communityStats.avgPrice}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">₹{communityStats.totalSavings}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-green-600">{communityStats.activeNow}</p>
            </div>
            <div className="text-3xl">🟢</div>
          </div>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('trade')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trade'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Trade Energy
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Transactions
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'portfolio'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Portfolio
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'trade' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buy Orders */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600">Buy Orders</h3>
                <div className="space-y-3">
                  {buyOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold">B</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{order.user}</p>
                              {order.verified && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Verified</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-500">⭐ {order.rating}</span>
                              <span className="text-sm text-gray-500">{order.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{order.amount} kWh</p>
                          <p className="text-lg font-semibold text-green-600">₹{order.price}/kWh</p>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
                        Sell Energy
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell Orders */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600">Sell Orders</h3>
                <div className="space-y-3">
                  {sellOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-semibold">S</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{order.user}</p>
                              {order.verified && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Verified</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-500">⭐ {order.rating}</span>
                              <span className="text-sm text-gray-500">{order.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{order.amount} kWh</p>
                          <p className="text-lg font-semibold text-red-600">₹{order.price}/kWh</p>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                        Buy Energy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.amount} kWh</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{transaction.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{transaction.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type === 'buy' ? transaction.seller : transaction.buyer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Energy Portfolio</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Energy</span>
                    <span className="text-xl font-bold text-green-600">125 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Traded</span>
                    <span className="text-xl font-bold text-blue-600">1,240 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="text-xl font-bold text-green-600">₹11,280</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Savings</span>
                    <span className="text-xl font-bold text-blue-600">₹3,450</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Trading Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-xl font-bold text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Profit/Trade</span>
                    <span className="text-xl font-bold text-blue-600">₹85</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reputation Score</span>
                    <span className="text-xl font-bold text-yellow-600">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Verification Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceView;
