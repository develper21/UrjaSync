import React from 'react';

interface UsageChartProps {
  data: { name: string; usage: number }[];
}

const UsageChart: React.FC<UsageChartProps> = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">Today&apos;s Usage (kW)</h2>
    <div className="flex items-end h-60 space-x-4">
      {data.map((item) => (
        <div key={item.name} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-blue-200 rounded-t-lg transition-all duration-300 hover:bg-blue-400"
            style={{ height: `${(item.usage / 4) * 100}%` }}
            title={`${item.usage} kW`}
          ></div>
          <span className="text-xs text-gray-500 mt-2">{item.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default UsageChart;
