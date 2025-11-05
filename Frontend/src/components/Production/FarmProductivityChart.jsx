import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const FarmProductivityChart = ({ data }) => (
  <div className="chart-card">
    <h3>Farm Productivity</h3>
    <BarChart width={400} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="farmName" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="totalYield" fill="#60a5fa" />
    </BarChart>
  </div>
);

export default FarmProductivityChart;
