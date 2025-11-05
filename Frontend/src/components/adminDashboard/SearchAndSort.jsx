import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faFilter } from '@fortawesome/free-solid-svg-icons';

export default function SearchAndSort({ 
  theme, 
  searchTerm, 
  setSearchTerm, 
  sortOption, 
  handleSortOptionChange,
  onGrowthStageFilterChange 
}) {
  const [sortBy, setSortBy] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [growthStageFilter, setGrowthStageFilter] = useState('');

  const growthStages = [
    'all', 'planting', 'vegetative', 'flowering', 'fruiting', 'harvesting'
  ];

  const handleGrowthStageChange = (stage) => {
    setGrowthStageFilter(stage);
    if (onGrowthStageFilterChange) {
      onGrowthStageFilterChange(stage === 'all' ? '' : stage);
    }
  };

  return (
    <div className={`header-farmers-containers ${theme}`}>
      <div className="controls-row">
        {/* Sort Controls */}
        <div className="sort-container">
          <div className="sort-by-btn-container">
            <button 
              className={`sort-by-container ${theme}`} 
              onClick={() => setSortBy((prev) => !prev)}
            >
              Sort By <span className="sortIcon"><FontAwesomeIcon icon={faSort} /></span>
            </button>
          </div>
          {sortBy && (
            <div className={`sort-extent ${theme}`}>
              <div className={`sort-options ${theme}`}>
                <p onClick={() => handleSortOptionChange('')}>Default</p>
                <p onClick={() => handleSortOptionChange('name')}>Farmer Name (A-Z)</p>
                <p onClick={() => handleSortOptionChange('farm_name')}>Farm Name (A-Z)</p>
                <p onClick={() => handleSortOptionChange('farm_size')}>Farm Size</p>
                <p onClick={() => handleSortOptionChange('produce_yield')}>Availability</p>
                <p onClick={() => handleSortOptionChange('last_visited')}>Last Visited</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="filter-container">
          <button 
            className={`filter-btn ${theme}`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            Filter <FontAwesomeIcon icon={faFilter} />
          </button>
          
          {showFilters && (
            <div className={`filter-extent ${theme}`}>
              <div className="filter-section">
                <label>Growth Stage:</label>
                <select 
                  value={growthStageFilter}
                  onChange={(e) => handleGrowthStageChange(e.target.value)}
                  className={`filter-select ${theme}`}
                >
                  {growthStages.map(stage => (
                    <option key={stage} value={stage}>
                      {stage === 'all' ? 'All Stages' : stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        className="searchFarmersContainer"
        placeholder="Search by farmer name, farm name, crop, ward..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}