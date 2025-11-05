import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlus, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons'
import '../styles/Details.css'
import { allFarmerDatails, updateFarmerDatails } from '../services/farmerService';
import { ThemeContext } from '../contexts/ThemeContext';
import { GetCurrentLocationContext } from '../contexts/CurrentLocationContext';

export default function Details() {
  const [farm, setFarm] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    municipality: '',
    ward: '',
    city: '',
    farm_size: '',
    latitude: '',
    longitude: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { coordinates, handleGetLocation } = useContext(GetCurrentLocationContext);

  useEffect(() => {
    fetchFarmDetails();
  }, []);

  const fetchFarmDetails = async () => {
    try {
      setIsLoading(true);
      const response = await allFarmerDatails();
      if (response.success && response.data) {
        setFarm(response.data);
        // Initialize form data with current farm values
        setFormData({
          name: response.data.NAME || '',
          municipality: response.data.MUNICIPALITY || '',
          ward: response.data.WARD || '',
          city: response.data.CITY || '',
          farm_size: response.data.FARM_SIZE || '',
          latitude: response.data.LATITUDE || '',
          longitude: response.data.LONGITUDE || ''
        });
      }
    } catch (error) {
      console.error('Error fetching farm details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditField = (fieldName) => {
    setEditingField(fieldName);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveField = async (fieldName) => {
    if (!farm) return;

    try {
      setIsUpdating(true);
      
      //  send the field being updated
      const updateData = {
        [fieldName]: formData[fieldName]
      };

      //  send both latitude and longitude
      if (fieldName === 'latitude' || fieldName === 'longitude') {
        updateData.latitude = formData.latitude;
        updateData.longitude = formData.longitude;
      }

      await updateFarmerDatails(updateData);
      
      // Refresh farm data
      await fetchFarmDetails();
      setEditingField(null);
      
    } catch (error) {
      console.error('Error updating farm details:', error);
      alert(error.message || 'Failed to update farm details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCoordinates = async () => {
    if (!coordinates.latitude || !coordinates.longitude) {
      alert('Please get your current location first');
      return;
    }

    try {
      setIsUpdating(true);
      await updateFarmerDatails({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      });
      
      // Refresh farm data
      await fetchFarmDetails();
      alert('Coordinates updated successfully!');
      
    } catch (error) {
      console.error('Error updating coordinates:', error);
      alert(error.message || 'Failed to update coordinates');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      await handleGetLocation();
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get current location. Please ensure location permissions are enabled.');
    }
  };

  const renderEditableField = (fieldName, label, value, type = 'text') => {
    const isEditing = editingField === fieldName;
    
    return (
      <div className={`details-field-container ${theme}`} onClick={() => !isEditing && handleEditField(fieldName)}>
        <p className={`details-field-title details-title ${theme}`}>{label}</p>
        <div className="details-field-input">
          {isEditing ? (
            <div className="details-edit-container">
              <input 
                type={type}
                value={formData[fieldName]}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className="details-input-container"
                autoFocus
                onBlur={() => handleSaveField(fieldName)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveField(fieldName);
                  }
                }}
                disabled={isUpdating}
              />
              {isUpdating && <div className="loading-spinner">Updating...</div>}
            </div>
          ) : (
            <div className={`details-value-container ${theme}`}>
              <p className={`details-value ${theme}`}>{value || 'Not set'}</p>
              <span className="edit-hint">Click to edit</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`details-container ${theme}`}>
        <div className="loading">Loading farm details...</div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className={`details-container ${theme}`}>
        <div className="no-farm-message">
          <p>No farm details found. Please set up your farm first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`details-container ${theme}`}>
      <div className={`details-wrapper ${theme}`}>
        <div className="details-header">
          <h2 className={`details-main-title ${theme}`}>Farm Details</h2>
          <p className="details-subtitle">Click on any field to edit</p>
        </div>
        
        <div className={`details-selectors ${theme}`}>
          {/* Farm Details */}
          {renderEditableField('name', 'Farm Name', farm.NAME)}
          {renderEditableField('municipality', 'Municipality', farm.MUNICIPALITY)}
          {renderEditableField('ward', 'Ward', farm.WARD)}
          {renderEditableField('city', 'City', farm.CITY)}
          {renderEditableField('farm_size', 'Farm Size (Ha)', farm.FARM_SIZE, 'number')}
          
          {/* Coordinates Section */}
          <div className="details-coordinates-section">
            <div className="coordinates-header">
              <p className={`details-title ${theme}`}>Coordinates</p>
              <button 
                className="get-location-btn"
                onClick={handleGetCurrentLocation}
                disabled={isUpdating}
              >
                <FontAwesomeIcon icon={faLocationCrosshairs} />
                Get Current Location
              </button>
            </div>
            
            <div className="coordinates-fields">
              <div className="coordinate-field">
                <span className="coordinate-label">Latitude:</span>
                {editingField === 'coordinates' ? (
                  <input 
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="details-input-container coordinate-input"
                    onBlur={() => handleSaveField('latitude')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveField('latitude')}
                  />
                ) : (
                  <span 
                    className={`coordinate-value ${theme}`}
                    onClick={() => handleEditField('coordinates')}
                  >
                    {farm.LATITUDE || 'Not set'}
                  </span>
                )}
              </div>
              
              <div className="coordinate-field">
                <span className="coordinate-label">Longitude:</span>
                {editingField === 'coordinates' ? (
                  <input 
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="details-input-container coordinate-input"
                    onBlur={() => handleSaveField('longitude')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveField('longitude')}
                  />
                ) : (
                  <span 
                    className={`coordinate-value ${theme}`}
                    onClick={() => handleEditField('coordinates')}
                  >
                    {farm.LONGITUDE || 'Not set'}
                  </span>
                )}
              </div>
            </div>
            
            {coordinates.latitude && coordinates.longitude && (
              <div className="current-coordinates">
                <p>Current location: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}</p>
                <button 
                  className="update-coords-btn"
                  onClick={handleUpdateCoordinates}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update with Current Location'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="details-actions">
          <div className="last-updated">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}