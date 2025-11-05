import React from 'react';

const GrowthStageTracker = ({ stages }) => (
  <div className="growth-stage-summary">
    <h4>Financial Summary by Growth Stage</h4>
    {stages.length === 0 && <p>No growth stage data available.</p>}
    {stages.map((stage) => (
      <div key={stage.stage_name} className="stage-row">
        <span className="stage-name">{stage.stage_name}</span>
        <span className="stage-income positive">R{stage.total_income.toFixed(2)}</span>
        <span className="stage-expense negative">R{stage.total_expense.toFixed(2)}</span>
        <span className={`stage-net ${stage.net >= 0 ? 'positive' : 'negative'}`}>
          R{stage.net.toFixed(2)}
        </span>
      </div>
    ))}
  </div>
);

export default GrowthStageTracker;
