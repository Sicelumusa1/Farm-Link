
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faCirclePlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { autoOrder } from '../services/autoOrderService';



const VARIABLE_CROPS = [
  'tomatoes', 'pappers', 'brinjal', 'butternut', 'babyMarrows', 'sweetPotatoes', 'beans',
  'peas', 'pumpkin', 'englishSpinach', 'swissChard', 'beetroot', ''
]

const OrderForm = ({ theme, user }) => {
  const [variableCrops, setVariableCrops] = useState([]);
  const [errorMessage,  setErrorMessage] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('0');


  // Display an error/success message for 3 seconds
  const displayMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const handleCropChange = (e) => {
    setSelectedCrop(e.target.value);
  }


  const handleQuantityChange = (e) => {
    setQuantity(e.target.value ? parseInt(e.target.value) : 0);
  }

  const addVariableCrop = () => {
    if (!selectedCrop || !quantity > 0) {
      displayMessage('Please select a crop and enter a valid quantity.');
      return;
    }
    setVariableCrops([...variableCrops, { name: selectedCrop, quantity }]);
    setSelectedCrop('');
    setQuantity(0);
    setErrorMessage('');
    
  };

  const removeVariableCrop = (index) => {
    setVariableCrops(variableCrops.filter((_, i) => i !== index));
  };

  const submitOrder = async () => {
    if (variableCrops.length === 0) {
      displayMessage('Please select a crop and enter a valid quantity.');
      return;
    }
    const crops = variableCrops.filter(crops => crops.name).map(crop => ({
      crop: crop.name,
      quantity: crop.quantity
    }));
    // const orderData = { crops };
    
    const orderData = { crops };

    try {
      const result = await autoOrder(orderData);
      console.log("Order submited successfully", result);
      setErrorMessage('');
      // Notification endpoint used hare
    } catch (error) {
      console.error("Order submission failed", error);
      displayMessage(error.errMessage || 'An error occurred while submitting the order.')
    }
  }

  return (
    <div className='orders-container'>
      <div className='orders-wrapper'>
        <div className={`orders-title ${theme}`}>
          <h1>Auto Ordering</h1>
        </div>
        <div className={`orders-nav-container ${theme}`}>
          <div className={`orders-title-container ${theme}`}>
            <p className={`Orders-nav-title ${theme}`}>Order</p>
          </div>
        </div>
        <div className={`order-selectors ${theme}`}>
          <div className={`orders-s-crop-type-container ${theme}`}>
            <p className={`order-s-crops-title ${theme}`}>Crops</p>
            <div className={`orders-s-crop-type-btn ${theme}`}>
              <select value={selectedCrop} onChange={handleCropChange} className={`crop-type-sel ${theme}`}>
                <option value=""></option>
                {VARIABLE_CROPS.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={`orders-s-quality-container ${theme}`}>
            <p className={`order-s-quantity-title ${theme}`}>Quantity (kg)</p>
            <div className={`orders-s-quantity-btn ${theme}`}>
              <input type='number' className={`orders-s-quantity-input-btn ${theme}`} placeholder='0' required value={quantity} onChange={handleQuantityChange} />
              <span>kg</span>
            </div>
          </div>
        </div>
        <div className='place-order-btn-container'>
          <div className='add-order-container add-order-btn-container' onClick={addVariableCrop}>
            <FontAwesomeIcon icon={faCirclePlus} className='add-orderIcon' />
            <p>Add</p>
          </div>
          <div className='cancel-order-container' onClick={submitOrder}>
            <p>Submit</p>
        </div>
      </div>
      {errorMessage && <p style={{ color: 'red', fontSize: '0.9em', marginTop: '10px' }}>{errorMessage}</p>}
      {variableCrops.length > 0 && (
        <div className='order-form-container'>
          <div className='order-output-container'>
            <div className='order-output-header'>
              <p className='order-output-title'>Crop</p>
              <p className='order-output-title'>Quantity (kg)</p>
            </div>
            {variableCrops.map((crop, index) => (
              <div key={index} className='order-output-item'>
                <p>{crop.name}</p>
                <p>{crop.quantity}</p>
                <FontAwesomeIcon icon={faTimes} className='remove-crop-icon' onClick={() => removeVariableCrop(index)} />
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
