import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling } from '@fortawesome/free-solid-svg-icons';

const CropPerformanceTable = ({ crops }) => (
  <div className="crop-performance">
    <h4>Crop Profitability</h4>
    <table>
      <thead>
        <tr>
          <th>Crop</th>
          <th>Stage</th>
          <th>Income (R)</th>
          <th>Expense (R)</th>
          <th>Net (R)</th>
        </tr>
      </thead>
      <tbody>
        {crops.map((crop) => (
          <tr key={crop.crop_id}>
            <td>
              <FontAwesomeIcon icon={faSeedling} /> {crop.crop_name || 'Unknown'}
            </td>
            <td>{crop.growth_stage || 'Unknown'}</td>
            <td className="positive">R{(crop.total_income || 0).toFixed(2)}</td>
            <td className="negative">R{(crop.total_expense || 0).toFixed(2)}</td>
            <td className={crop.profit >= 0 ? 'positive' : 'negative'}>
              R{(crop.profit || 0).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CropPerformanceTable;
