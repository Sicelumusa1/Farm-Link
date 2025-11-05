import React from 'react';

export default function MunicipalityInfo({ 
  theme, 
  adminMunicipality, 
  totalResults, 
  currentPage, 
  pageSize = 10 
}) {
  if (!adminMunicipality) return null;

  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className={`municipality-info ${theme}`}>
      <div className="municipality-header">
        <p>
          Showing farmers in: <strong>{adminMunicipality}</strong>
        </p>
        {totalResults > 0 && (
          <div className="results-info">
            <p className="results-count">
              Showing {startItem} to {endItem} of {totalResults} farmers
            </p>
            <p className="results-summary">
              • {totalResults} total farmers in municipality
            </p>
          </div>
        )}
      </div>
    </div>
  );
}