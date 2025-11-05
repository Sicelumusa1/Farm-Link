import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#009688'];

const ExpenseCategoryChart = ({ categoryData }) => {
  const data = categoryData || [];

  return (
    <div className="chart-card">
      <h4>Expense Distribution</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" outerRadius={100}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseCategoryChart;
