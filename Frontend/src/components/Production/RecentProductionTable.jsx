import React from 'react';

const RecentProductionTable = ({ data }) => (
  <div className="table-card">
    <h3>Recent Production</h3>
    <table>
      <thead>
        <tr>
          <th>Crop</th>
          <th>Type</th>
          <th>Stage</th>
          <th>Yield (kg)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((crop, idx) => (
          <tr key={idx}>
            <td>{crop.cropName}</td>
            <td>{crop.type}</td>
            <td>{crop.growthStage}</td>
            <td>{crop.yield ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RecentProductionTable;