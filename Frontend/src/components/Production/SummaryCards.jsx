import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling, faCheckCircle, faLeaf, faChartBar } from '@fortawesome/free-solid-svg-icons';

const SummaryCards = ({ summary }) => (
  <div className="summary-cards">
    <div className="card">
      <FontAwesomeIcon icon={faSeedling} />
      <h4>Total Crops</h4>
      <p>{summary.totalCrops}</p>
    </div>
    <div className="card">
      <FontAwesomeIcon icon={faCheckCircle} />
      <h4>Harvested</h4>
      <p>{summary.harvestedCrops}</p>
    </div>
    <div className="card">
      <FontAwesomeIcon icon={faLeaf} />
      <h4>Active</h4>
      <p>{summary.activeCrops}</p>
    </div>
    <div className="card">
      <FontAwesomeIcon icon={faChartBar} />
      <h4>Total Yield (kg)</h4>
      <p>{summary.totalYield}</p>
    </div>
  </div>
);

export default SummaryCards;
