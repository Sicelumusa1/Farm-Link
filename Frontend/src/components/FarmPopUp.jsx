import { useContext, useState } from 'react'
import '../styles/FarmPopUp.css'
import { addFarmerDatails } from '../services/farmerService'
import { UserContext } from '../contexts/UserContext'
import { GetCurrentLocationContext } from '../contexts/CurrentLocationContext'


export const FarmPopUp = ({ setPopUp, onSuccess }) => {
 
  const { user } = useContext(UserContext)
  const locationContext = useContext(GetCurrentLocationContext);
  const coordinates = locationContext?.coordinates || { latitude: '', longitude: '' };
  const handleGetLocation = locationContext?.handleGetLocation || (() => console.warn('Location context not available'));
  const locationError = locationContext?.locationError || null;
  const isGettingLocation = locationContext?.isGettingLocation || false;

  const [formData, setFormData] = useState({
    name: '',
    municipality: '',
    ward: '',
    city: '',
    farm_size: '',
    latitude: coordinates.latitude || '',
    longitude: coordinates.longitude || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }

  const handleGetCurrentLocation = async () => {
    try {
      const coords = await handleGetLocation();
      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  }

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Farm name is required';
    }

    if (!formData.municipality.trim()) {
      errors.municipality = 'Municipality is required';
    }

    if (!formData.ward.trim()) {
      errors.ward = 'Ward is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.farm_size || parseFloat(formData.farm_size) <= 0) {
      errors.farm_size = 'Valid farm size is required';
    }

    if (!formData.latitude || !formData.longitude) {
      errors.coordinates = 'Please get your current location to set farm coordinates';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addFarmerDatails(formData);
      setPopUp(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create farm:', error);
      alert(error.errMessage || 'Failed to create farm. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="farmpopup-container">
      <div className="popup-content">
        <div className="popupwrapper">
          <div className="popup-title">
            <h1>Welcome to <span className="popup-title-company">FarmLink</span></h1>
            <p>Please enter your farm information to get started</p>
            <p className="location-note">Make sure you're at your farm location when getting coordinates</p>
          </div>

          {/* Location Section */}
          <div className="location-section">
            <div className="location-header">
              <h3>Farm Location</h3>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="get-location-btn"
              >
                {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </button>
            </div>

            {locationError && (
              <div className="location-error">
                {locationError}
              </div>
            )}

            {formErrors.coordinates && (
              <div className="field-error">
                {formErrors.coordinates}
              </div>
            )}

            {formData.latitude && formData.longitude && (
              <div className="coordinates-display">
                <p>Coordinates set: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
              </div>
            )}
          </div>

          <div className="popup-inputs">
            <div className="input-group">
              <input
                type="text"
                placeholder="Farm Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={formErrors.name ? 'error' : ''}
                required
              />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Municipality *"
                value={formData.municipality}
                onChange={(e) => handleInputChange('municipality', e.target.value)}
                className={formErrors.municipality ? 'error' : ''}
                required
              />
              {formErrors.municipality && <span className="field-error">{formErrors.municipality}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Ward *"
                value={formData.ward}
                onChange={(e) => handleInputChange('ward', e.target.value)}
                className={formErrors.ward ? 'error' : ''}
                required
              />
              {formErrors.ward && <span className="field-error">{formErrors.ward}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="City *"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={formErrors.city ? 'error' : ''}
                required
              />
              {formErrors.city && <span className="field-error">{formErrors.city}</span>}
            </div>

            <div className="input-group">
              <input
                type="number"
                placeholder="Farm Size (Ha) *"
                value={formData.farm_size}
                onChange={(e) => handleInputChange('farm_size', e.target.value)}
                className={formErrors.farm_size ? 'error' : ''}
                step="0.1"
                min="0.1"
                required
              />
              {formErrors.farm_size && <span className="field-error">{formErrors.farm_size}</span>}
            </div>
          </div>

          <div className="popup-btn">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Farm...' : 'Create Farm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}