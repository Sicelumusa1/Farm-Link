import React, { useState } from 'react';

export default function FarmersTable({ 
  users, 
  theme, 
  handleClick, 
  isLoading 
}) {
  const [showAllCrops, setShowAllCrops] = useState(false);

  const getFilteredCrops = (crops) => {
    if (!crops || !Array.isArray(crops)) return [];
    
    if (showAllCrops) {
      return crops;
    }
    
    // Show only crops with availability > 0 by default
    return crops.filter(crop => {
      const availability = crop.availability || crop.PRODUCE_YIELD || 0;
      return availability > 0;
    });
  };

  const getGrowthStageBadge = (growthStage) => {
    if (!growthStage) return null;
    
    const stage = growthStage.toLowerCase();
    const stageClasses = {
      'planting': 'growth-stage-planting',
      'vegetative': 'growth-stage-vegetative', 
      'flowering': 'growth-stage-flowering',
      'fruiting': 'growth-stage-fruiting',
      'harvesting': 'growth-stage-harvesting',
      'harvested': 'growth-stage-harvested'
    };
    
    return (
      <span className={`growth-stage-badge ${stageClasses[stage] || 'growth-stage-default'}`}>
        {growthStage}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-state-container">
        <div className="loading-spinner"></div>
        <p>Loading farmers data...</p>
      </div>
    );
  }

  return (
    <div className={`table-container ${theme}`}>
      {/* Crop Display Toggle */}
      <div className={`crop-display-toggle ${theme}`}>
        <label>
          <input
            type="checkbox"
            checked={showAllCrops}
            onChange={(e) => setShowAllCrops(e.target.checked)}
          />
          Show all crops (including zero availability)
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Farm Name</th>
            <th>Ward</th>
            <th>Crop Type</th>
            <th>QTY Available (kg)</th>
            <th>Growth Stage</th>
            <th>Last Visited</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((user) => {
              const filteredCrops = getFilteredCrops(user.farm?.crops);
              
              return (
                <tr 
                  key={user._id} 
                  className={`table-tr-container ${theme}`} 
                  onClick={() => handleClick(user._id)}
                >
                  <td>{user.farm ? user.farm.name : 'No Farm Name'}</td>
                  
                  {/* Location - Show only ward as requested */}
                  <td>
                    {user.farm?.ward ? `Ward ${user.farm.ward}` : 'Not specified'}
                  </td>
                  
                  {/* Crop Type - Show filtered crops */}
                  <td>
                    {filteredCrops.length > 0 ? (
                      <ul className="crops-list">
                        {filteredCrops.map((crop) => (
                          <li key={crop._id} className="crop-item">
                            {crop.cropName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-crops">No active crops</span>
                    )}
                  </td>
                  
                  {/* Quantity Available - Show filtered crops */}
                  <td>
                    {filteredCrops.length > 0 ? (
                      <ul className="availability-list">
                        {filteredCrops.map((crop) => (
                          <li key={crop._id} className="availability-item">
                            {crop.availability || 0} kg
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  
                  {/* Growth Stage - New column */}
                  <td>
                    {filteredCrops.length > 0 ? (
                      <ul className="growth-stage-list">
                        {filteredCrops.map((crop) => (
                          <li key={crop._id} className="growth-stage-item">
                            {getGrowthStageBadge(crop.growthStage)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  
                  <td>{user.lastVisited ? new Date(user.lastVisited).toLocaleDateString() : 'Never'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No farmers data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}