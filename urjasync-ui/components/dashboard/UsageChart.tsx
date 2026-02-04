import React from 'react';

interface UsageChartProps {
  data: { name: string; usage: number }[];
}

const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  console.log('UsageChart received data:', data); // Debug log
  
  // Always ensure we have data
  const chartData = data.length > 0 ? data : [
    { name: '00:00', usage: 0.8 },
    { name: '02:00', usage: 0.6 },
    { name: '04:00', usage: 0.5 },
    { name: '06:00', usage: 1.2 },
    { name: '08:00', usage: 2.1 },
    { name: '10:00', usage: 1.8 },
    { name: '12:00', usage: 2.5 },
    { name: '14:00', usage: 2.2 },
    { name: '16:00', usage: 1.9 },
    { name: '18:00', usage: 3.2 },
    { name: '20:00', usage: 2.8 },
    { name: '22:00', usage: 1.5 },
  ];
  
  const maxUsage = Math.max(...chartData.map(item => item.usage), 4);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Today&apos;s Usage (kW)</h2>
      <div className="flex items-end justify-between h-60 px-2">
        {chartData.map((item, index) => {
          const barHeight = Math.max((item.usage / maxUsage) * 100, 10); // Minimum 10% height
          return (
            <div key={`${item.name}-${index}`} className="flex flex-col items-center flex-1 mx-0.5">
              <div className="flex-1 flex items-end w-full">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 relative group shadow-sm"
                  style={{ 
                    height: `${barHeight}%`,
                    minHeight: '20px' // Absolute minimum height
                  }}
                  title={`${item.usage.toFixed(2)} kW`}
                >
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg">
                    {item.usage.toFixed(2)} kW
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 font-medium">{item.name}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Usage:</span>
          <span className="font-semibold text-blue-600">
            {chartData.reduce((sum, item) => sum + item.usage, 0).toFixed(2)} kW
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Peak Usage:</span>
          <span className="font-semibold text-red-600">
            {Math.max(...chartData.map(item => item.usage)).toFixed(2)} kW
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsageChart;
