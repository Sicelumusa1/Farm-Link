// components/AdminLocationPopUp.jsx
import { useContext, useState } from 'react'
import '../styles/AdminLocationPopUp.css'
import { setAdminMunicipality } from '../services/adminService'
import { UserContext } from '../contexts/UserContext'

export const AdminLocationPopUp = ({ setPopUp, onSuccess }) => {
  const { user } = useContext(UserContext)

  const [formData, setFormData] = useState({
    municipality: '',
    city: ''
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

  const validateForm = () => {
    const errors = {};

    if (!formData.municipality.trim()) {
      errors.municipality = 'Municipality is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
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
      const response = await setAdminMunicipality(formData);
      console.log('Location set successfully:', response);
      
      // Close the popup
      setPopUp(false);
      
      // Call onSuccess callback to refresh the data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to set admin municipality:', error);
      alert(error.errMessage || 'Failed to set location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-location-popup-container">
      <div className="popup-content">
        <div className="popupwrapper">
          <div className="popup-title">
            <h1>Welcome to <span className="popup-title-company">FarmLink Admin</span></h1>
            <p>Please set your administrative municipality to access farmers in your area</p>
          </div>

          <div className="popup-inputs">
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
                placeholder="City *"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={formErrors.city ? 'error' : ''}
                required
              />
              {formErrors.city && <span className="field-error">{formErrors.city}</span>}
            </div>
          </div>

          <div className="popup-btn">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}