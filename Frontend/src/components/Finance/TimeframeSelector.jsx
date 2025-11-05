import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import '../../styles/TimeframeSelector.css';

const TimeframeSelector = ({ timeframe, onChange }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`summary-controls ${theme}`}>
      <label>Timeframe:</label>
      <select value={timeframe} onChange={(e) => onChange(e.target.value)}>
        <option value="today">Today</option>
        <option value="this-week">This Week</option>
        <option value="this-month">This Month</option>
        <option value="this-quarter">This Quarter</option>
        <option value="this-year">This Year</option>
        <option value="last-month">Last Month</option>
        <option value="last-quarter">Last Quarter</option>
        <option value="last-year">Last Year</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
  );
};

export default TimeframeSelector;