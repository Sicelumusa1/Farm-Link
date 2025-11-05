import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171'];

const CropGrowthStageChart = ({ data }) => (
  <div className="chart-card">
    <h3>Growth Stages</h3>
    <PieChart width={300} height={200}>
      <Pie data={data} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius={80} label>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </div>
);

export default CropGrowthStageChart;
