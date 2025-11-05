import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faTimes, faSpinner, faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { autoOrder, getAvailableCrops, getCropAvailabilityDetails } from '../services/autoOrderService';
import '../styles/Order.css'
import { ThemeContext } from '../contexts/ThemeContext';

// Enhanced crop units configuration
const CROP_UNITS = {
  'Cabbage': ['heads', 'kg'],
  'Lettuce': ['heads', 'kg'],
  'Potato': ['bags_10kg', 'bags_7kg', 'kg'],
  'Onion': ['bags_10kg', 'bags_7kg', 'kg'],
  'Tomato': ['crates', 'kg'],
  'Carrot': ['kg'],
  'Pumpkin': ['units', 'kg'],
  'Butternut': ['units', 'kg'],
  'Spinach': ['bunches', 'kg'],
  'Kale': ['bunches', 'kg'],
  'Brinjal': ['kg'],
  'Pepper': ['kg'],
  'Beetroot': ['kg'],
  'default': ['kg']
};

const UNIT_DISPLAY_NAMES = {
  'kg': 'kilograms',
  'heads': 'heads',
  'bags_10kg': '10kg bags',
  'bags_7kg': '7kg bags',
  'crates': 'crates',
  'units': 'units',
  'bunches': 'bunches'
};

// Unit conversion factors (same as backend)
const UNIT_CONVERSION_FACTORS = {
  'kg': 1,
  'heads': 4,
  'bags_10kg': 10,
  'bags_7kg': 7,
  'crates': 20,
  'units': 4,
  'bunches': 0.5
};

const convertToKg = (quantity, unit) => {
  const factor = UNIT_CONVERSION_FACTORS[unit] || 1;
  return quantity * factor;
};

const convertFromKg = (quantityKg, unit) => {
  const factor = UNIT_CONVERSION_FACTORS[unit] || 1;
  return quantityKg / factor;
};

const OrderForm = ({ user }) => {
  const [variableCrops, setVariableCrops] = useState([]);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [cropAvailability, setCropAvailability] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [availableUnits, setAvailableUnits] = useState(['kg']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { theme } = useContext(ThemeContext);

  // Load available crops from backend on component mount
  useEffect(() => {
    const loadAvailableCrops = async () => {
      setIsLoadingCrops(true);
      try {
        const response = await getAvailableCrops();
        if (response.success && response.data.available_crops) {
          const cropsWithAvailability = response.data.available_crops.reduce((acc, crop) => {
            acc[crop.crop_name] = crop.total_availability;
            return acc;
          }, {});
          
          setCropAvailability(cropsWithAvailability);
          
          const cropNames = response.data.available_crops
            .map(crop => crop.crop_name)
            .filter((name, index, array) => array.indexOf(name) === index)
            .sort();
          
          setAvailableCrops(cropNames);
        }
      } catch (error) {
        console.error('Failed to load available crops:', error);
        // Fallback to hardcoded list
        setAvailableCrops([
          'Tomato', 'Brinjal', 'Butternut', 'Pumpkin', 'Spinach', 
          'Cabbage', 'Potato', 'Onion', 'Carrot'
        ]);
      } finally {
        setIsLoadingCrops(false);
      }
    };

    loadAvailableCrops();
  }, []);

  // Update available units when crop selection changes
  useEffect(() => {
    if (selectedCrop) {
      const units = CROP_UNITS[selectedCrop] || CROP_UNITS.default;
      setAvailableUnits(units);
      
      // Set default unit to first available option
      if (!units.includes(unit)) {
        setUnit(units[0]);
      }
    } else {
      setAvailableUnits(['kg']);
      setUnit('kg');
    }
  }, [selectedCrop, unit]);

  // Check availability when crop or quantity changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (selectedCrop && quantity) {
        setIsCheckingAvailability(true);
        try {
          const response = await getCropAvailabilityDetails(selectedCrop);
          if (response.success) {
            setCropAvailability(prev => ({
              ...prev,
              [selectedCrop]: response.data.total_availability
            }));
          }
        } catch (error) {
          console.error('Failed to check availability:', error);
        } finally {
          setIsCheckingAvailability(false);
        }
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCrop, quantity]);

  const displayMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const handleCropChange = (e) => {
    setSelectedCrop(e.target.value);
  }

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) > 0 && Number(value) <= 10000)) {
      setQuantity(value);
    }
  }

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  }

  const getUnitDisplayName = (unitCode) => {
    return UNIT_DISPLAY_NAMES[unitCode] || unitCode;
  };

  const getAvailableQuantity = (cropName, requestedUnit) => {
    const availableKg = cropAvailability[cropName] || 0;
    return convertFromKg(availableKg, requestedUnit);
  };

  const isQuantityExceedingAvailability = (cropName, quantity, unit) => {
    const availableInUnit = getAvailableQuantity(cropName, unit);
    return quantity > availableInUnit;
  };

  const addVariableCrop = async () => {
    if (!selectedCrop) {
      displayMessage('Please select a crop.');
      return;
    }
    
    const quantityNum = parseFloat(quantity);
    if (!quantity || quantityNum <= 0) {
      displayMessage('Please enter a valid quantity greater than 0.');
      return;
    }

    // Check if requested quantity exceeds available quantity
    if (isQuantityExceedingAvailability(selectedCrop, quantityNum, unit)) {
      const availableInUnit = getAvailableQuantity(selectedCrop, unit);
      displayMessage(
        `Insufficient ${selectedCrop} available. Requested: ${quantityNum} ${getUnitDisplayName(unit)}, Available: ${availableInUnit.toFixed(2)} ${getUnitDisplayName(unit)}`,
        'error'
      );
      return;
    }

    // Check if crop already exists in the list with same unit
    const existingCropIndex = variableCrops.findIndex(
      crop => crop.name === selectedCrop && crop.unit === unit
    );
    
    if (existingCropIndex >= 0) {
      // Check if updated quantity would exceed availability
      const updatedQuantity = variableCrops[existingCropIndex].quantity + quantityNum;
      if (isQuantityExceedingAvailability(selectedCrop, updatedQuantity, unit)) {
        const availableInUnit = getAvailableQuantity(selectedCrop, unit);
        const currentQuantity = variableCrops[existingCropIndex].quantity;
        displayMessage(
          `Cannot update ${selectedCrop}. Total would exceed available quantity. Current: ${currentQuantity}, Adding: ${quantityNum}, Available: ${availableInUnit.toFixed(2)} ${getUnitDisplayName(unit)}`,
          'error'
        );
        return;
      }

      // Update existing crop quantity
      const updatedCrops = [...variableCrops];
      updatedCrops[existingCropIndex].quantity += quantityNum;
      setVariableCrops(updatedCrops);
      displayMessage(`Updated ${selectedCrop} quantity`, 'success');
    } else {
      // Add new crop
      setVariableCrops([...variableCrops, { 
        name: selectedCrop, 
        quantity: quantityNum,
        unit: unit,
        unitDisplay: getUnitDisplayName(unit),
        available: getAvailableQuantity(selectedCrop, unit)
      }]);
      displayMessage(`Added ${selectedCrop} to order`, 'success');
    }
    
    setSelectedCrop('');
    setQuantity('');
    setUnit('kg');
  };

  const removeVariableCrop = (index) => {
    const crop = variableCrops[index];
    setVariableCrops(variableCrops.filter((_, i) => i !== index));
    displayMessage(`Removed ${crop.name} from order`, 'info');
  };

  const getTotalQuantity = () => {
    return variableCrops.reduce((total, crop) => total + crop.quantity, 0);
  };

  const submitOrder = async () => {
    if (variableCrops.length === 0) {
      displayMessage('Please add at least one crop to the order.');
      return;
    }

    // Final validation before submission
    const exceedingCrops = variableCrops.filter(crop => 
      isQuantityExceedingAvailability(crop.name, crop.quantity, crop.unit)
    );

    if (exceedingCrops.length > 0) {
      const cropNames = exceedingCrops.map(crop => crop.name).join(', ');
      displayMessage(`Insufficient quantity for: ${cropNames}. Please adjust quantities.`, 'error');
      return;
    }

    setIsSubmitting(true);
    const crops = variableCrops.map(crop => ({
      crop: crop.name,
      quantity: crop.quantity,
      unit: crop.unit
    }));
   
    const orderData = { crops };

    try {
      const result = await autoOrder(orderData);
      console.log("Order submitted successfully", result);
      
      // Show success message with details
      const successMsg = `Order created successfully! ${result.data.orders_created} orders generated.`;
      displayMessage(successMsg, 'success');
      
      // Clear the form on success
      setVariableCrops([]);
      
      // Show unfulfilled requests if any
      if (result.data.unfulfilled_requests) {
        const unfulfilledDetails = result.data.unfulfilled_requests
          .map(req => `${req.crop}: ${req.shortfall} ${req.unit_display || req.unit} short`)
          .join(', ');
        
        const unfulfilledMsg = `Partial fulfillment: ${unfulfilledDetails}`;
        setTimeout(() => displayMessage(unfulfilledMsg, 'warning'), 1000);
      }
      
    } catch (error) {
      console.error("Order submission failed", error);
      const errorMsg = error.message || error.errMessage || 'An error occurred while submitting the order.';
      displayMessage(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityStatus = () => {
    if (!selectedCrop || !quantity) return null;
    
    const quantityNum = parseFloat(quantity);
    const availableInUnit = getAvailableQuantity(selectedCrop, unit);
    const isExceeding = isQuantityExceedingAvailability(selectedCrop, quantityNum, unit);
    
    if (isExceeding) {
      return (
        <div className='availability-warning'>
          <FontAwesomeIcon icon={faExclamationTriangle} className='warning-icon' />
          <span>Insufficient quantity. Available: {availableInUnit.toFixed(2)} {getUnitDisplayName(unit)}</span>
        </div>
      );
    } else {
      return (
        <div className='availability-success'>
          <FontAwesomeIcon icon={faInfoCircle} className='success-icon' />
          <span>Available: {availableInUnit.toFixed(2)} {getUnitDisplayName(unit)}</span>
        </div>
      );
    }
  };

  return (
    <div className='orders-container'>
      <div className='orders-wrapper'>
        <div className={`orders-title ${theme}`}>
          <h1>Auto Ordering</h1>
          <p className='orders-subtitle'>Distribute orders across multiple farmers automatically</p>
        </div>
        
        <div className={`orders-nav-container ${theme}`}>
          <div className={`orders-title-container ${theme}`}>
            <p className={`Orders-nav-title ${theme}`}>Create Order</p>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message-alert ${message.type} ${theme}`}>
            {message.text}
          </div>
        )}

        <div className={`order-selectors ${theme}`}>
          <div className={`orders-s-crop-type-container ${theme}`}>
            <p className={`order-s-crops-title ${theme}`}>Crop Selection</p>
            <div className={`orders-s-crop-type-btn ${theme}`}>
              <select 
                value={selectedCrop} 
                onChange={handleCropChange} 
                className={`crop-type-sel ${theme}`}
                disabled={isSubmitting || isLoadingCrops}
              >
                <option value="">
                  {isLoadingCrops ? 'Loading crops...' : 'Select a crop...'}
                </option>
                {availableCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={`orders-s-quality-container ${theme}`}>
            <p className={`order-s-quantity-title ${theme}`}>Quantity</p>
            <div className={`orders-s-quantity-input-group ${theme}`}>
              <input 
                type='number' 
                className={`orders-s-quantity-input-btn ${theme}`} 
                placeholder='0' 
                required 
                value={quantity} 
                onChange={handleQuantityChange}
                min="0.1"
                max="10000"
                step="0.1"
                disabled={isSubmitting}
              />
              <select 
                value={unit}
                onChange={handleUnitChange}
                className={`quantity-unit-select ${theme}`}
                disabled={isSubmitting || !selectedCrop}
              >
                {availableUnits.map(unitOption => (
                  <option key={unitOption} value={unitOption}>
                    {getUnitDisplayName(unitOption)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Availability Status */}
            {getAvailabilityStatus()}
            
            {selectedCrop && (
              <div className='unit-help-section'>
                <p className='unit-help-text'>
                  <FontAwesomeIcon icon={faInfoCircle} className='info-icon' />
                  Available units for {selectedCrop}: {availableUnits.map(u => getUnitDisplayName(u)).join(', ')}
                </p>
                {availableUnits.length > 1 && (
                  <p className='unit-conversion-help'>
                    All units are automatically converted to kilograms for inventory management
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className='place-order-btn-container'>
          <div 
            className={`add-order-container add-order-btn-container ${isSubmitting ? 'disabled' : ''}`} 
            onClick={isSubmitting ? null : addVariableCrop}
          >
            <FontAwesomeIcon icon={faCirclePlus} className='add-orderIcon' />
            <p>Add Crop</p>
          </div>
          
          <div 
            className={`cancel-order-container ${isSubmitting ? 'submitting' : ''}`} 
            onClick={isSubmitting ? null : submitOrder}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className='spinner' />
                <p>Processing...</p>
              </>
            ) : (
              <p>Submit Auto Order</p>
            )}
          </div>
        </div>

        {variableCrops.length > 0 && (
          <div className='order-form-container'>
            <div className='order-summary-header'>
              <h3>Order Summary</h3>
              <p>Total: {variableCrops.length} crop type{variableCrops.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className='order-output-container'>
              <div className='order-output-header'>
                <p className='order-output-title'>Crop</p>
                <p className='order-output-title'>Quantity</p>
                <p className='order-output-title'>Unit</p>
                <p className='order-output-title'>Available</p>
                <p className='order-output-title'>Action</p>
              </div>
              {variableCrops.map((crop, index) => (
                <div key={index} className={`order-output-item ${isQuantityExceedingAvailability(crop.name, crop.quantity, crop.unit) ? 'exceeding-quantity' : ''}`}>
                  <p className='crop-name'>{crop.name}</p>
                  <p className='crop-quantity'>{crop.quantity}</p>
                  <p className='crop-unit'>{crop.unitDisplay || getUnitDisplayName(crop.unit)}</p>
                  <p className='crop-available'>
                    {getAvailableQuantity(crop.name, crop.unit).toFixed(2)}
                    {isQuantityExceedingAvailability(crop.name, crop.quantity, crop.unit) && (
                      <FontAwesomeIcon icon={faExclamationTriangle} className='warning-icon-small' title="Quantity exceeds available stock" />
                    )}
                  </p>
                  <FontAwesomeIcon 
                    icon={faTimes} 
                    className='remove-crop-icon' 
                    onClick={isSubmitting ? null : () => removeVariableCrop(index)}
                    title="Remove crop"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div> 
  );  
}

export default OrderForm;