import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CropYieldChart = ({ data }) => (
  <div className="chart-card">
    <h3>Yield by Crop</h3>
    <BarChart width={400} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="cropName" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="yield" fill="#34d399" />
    </BarChart>
  </div>
);

export default CropYieldChart;
