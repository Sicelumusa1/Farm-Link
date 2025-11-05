import React from 'react';

const TimeframeSelector = ({ timeframe, onChange }) => (
  <div className="timeframe-selector">
    <select value={timeframe} onChange={(e) => onChange(e.target.value)}>
      <option value="today">Today</option>
      <option value="this-week">This Week</option>
      <option value="this-month">This Month</option>
      <option value="this-quarter">This Quarter</option>
      <option value="this-year">This Year</option>
    </select>
  </div>
);

export default TimeframeSelector;
