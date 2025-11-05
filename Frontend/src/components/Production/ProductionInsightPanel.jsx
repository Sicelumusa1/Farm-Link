import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

const ProductionInsightPanel = ({ insights }) => (
  <div className="insight-panel">
    <h3><FontAwesomeIcon icon={faLightbulb} /> Insights</h3>
    <ul>
      {insights.map((tip, index) => (
        <li key={index}>{tip}</li>
      ))}
    </ul>
  </div>
);

export default ProductionInsightPanel;
