// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// const IncomeExpenseChart = ({ summary }) => {
//   const data = summary.trends || []; // [{ month, income, expense }]

//   return (
//     <div className="chart-card">
//       <h4>Income vs Expenses</h4>
//       <ResponsiveContainer width="100%" height={250}>
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="month" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="income" stroke="#4caf50" name="Income" />
//           <Line type="monotone" dataKey="expense" stroke="#f44336" name="Expense" />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default IncomeExpenseChart;

import React, { useContext } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { ThemeContext } from '../../contexts/ThemeContext';
import '../../styles/IncomeExpenseChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  const { theme } = useContext(ThemeContext);
  
  if (active && payload && payload.length) {
    return (
      <div className={`custom-tooltip ${theme}`}>
        <div className="label">{`${label}`}</div>
        <div className="item">
          <div className="color-indicator income-indicator"></div>
          <span>Income: R{payload[0]?.value?.toFixed(2) || 0}</span>
        </div>
        <div className="item">
          <div className="color-indicator expense-indicator"></div>
          <span>Expense: R{payload[1]?.value?.toFixed(2) || 0}</span>
        </div>
      </div>
    );
  }
  return null;
};

const IncomeExpenseChart = ({ summary }) => {
  const { theme } = useContext(ThemeContext);
  const data = summary?.trends || [];

  if (!data || data.length === 0) {
    return (
      <div className={`chart-card empty ${theme}`}>
        <h4>Income vs Expenses</h4>
        <p>No data available for the selected timeframe</p>
      </div>
    );
  }

  return (
    <div className={`chart-card ${theme}`}>
      <h4>Income vs Expenses Trend</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `R${value}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconSize={10}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            className="income-line"
            stroke="#10b981"
            name="Income"
            strokeWidth={3}
            dot={{ 
              fill: theme === 'light' ? '#ffffff' : '#2d2d2d', 
              strokeWidth: 2, 
              r: 4,
              className: 'income-dot'
            }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            className="expense-line"
            stroke="#ef4444"
            name="Expense"
            strokeWidth={3}
            dot={{ 
              fill: theme === 'light' ? '#ffffff' : '#2d2d2d', 
              strokeWidth: 2, 
              r: 4,
              className: 'expense-dot'
            }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
