import { useContext } from 'react'
import { useState } from 'react'
import '../styles/Order.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { placeOrder } from '../services/OrderService'
import { ThemeContext } from '../contexts/ThemeContext';
import { useSelectedFarmer } from '../contexts/SelectedFarmerContext'
import Swal from 'sweetalert2';
import '../styles/AlertStyles.css'

export default function Orders({ user }) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState(0);
  const { theme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedFarmer, setSelectedFarmer, setShowOrderForm } = useSelectedFarmer();

  const handleCropChange = (e) => {
    setSelectedCrop(e.target.value);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setQuantity(value);
    }
  };

  const handleOrder = async () => {
  if (isLoading) return;
  if (!selectedFarmer || !selectedCrop || !quantity || parseInt(quantity) <= 0) {
    Swal.fire({
      title: 'Error!',
      text: 'Please select a crop and enter a valid quantity',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'custom-confirm-button-ok'
      }
    });
    return;
  }

  setIsLoading(true);

  try {
    console.log('Starting order placement...');
    console.log('Complete selectedFarmer:', selectedFarmer);

    const crops = selectedFarmer.crops || selectedFarmer.CROPS || [];
    console.log('Available crops:', crops);

    const selectedCropObj = crops.find(crop =>
      crop.cropName === selectedCrop ||
      crop.CROP_NAME === selectedCrop
    );

    console.log('Selected crop object:', selectedCropObj);

    if (!selectedCropObj) {
      Swal.fire({
        title: 'Error!',
        text: 'Selected crop not found',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Get IDs from different possible property names
    const cropId = selectedCropObj._id || selectedCropObj.id || selectedCropObj.ID;
    const userId = selectedFarmer._id || selectedFarmer.id || selectedFarmer.ID || selectedFarmer.userId;

    console.log('Crop ID:', cropId);
    console.log('Quantity:', quantity);
    console.log('Farmer ID:', userId);

    if (!userId) {
      throw new Error('Farmer ID not found in selected farmer data');
    }

    const orderDetails = {
      cropId: parseInt(cropId),
      quantity: parseInt(quantity),
      userId: parseInt(userId) 
    };

    console.log('Order details being sent:', orderDetails);

    const response = await placeOrder(orderDetails);
    console.log('Order response:', response);

    setSelectedCrop('');
    setQuantity(0);
    handleOrderClose();
  } catch (error) {
    console.error('Error placing order:', error);
    console.error('Error details:', error.response?.data);

    const errorMessage = error.response?.data?.message || error.response?.data?.errMessage || error.message || 'There was an error placing your order. Please try again.';
    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'confirm-error-placing-order'
      }
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleOrderClose = () => {
    setTimeout(() => {
      Swal.fire({
        title: 'Success!',
        text: 'Order has been placed successfully!',
        icon: 'success',
        confirmButtonText: 'Close',
        customClass: {
          confirmButton: 'custom-confirm-button'
        }
      }).then(() => {
        setShowOrderForm(false);
        setSelectedFarmer(null);
      });
    }, 1500);
  }

  const handleCancel = () => {
    setShowOrderForm(false);
    setSelectedFarmer(null);
  }

  // Access crops directly from selectedFarmer
  const crops = selectedFarmer?.crops || selectedFarmer?.CROPS || [];
  const farmerName = selectedFarmer?.name || selectedFarmer?.NAME || 'No farmer selected';

  return (
    <div className="orders-container">
      <div className="orders-wrapper">
        <div className={`orders-title ${theme}`}>
          <h1>Place Order</h1>
        </div>
        <div className={`orders-nav-container ${theme}`}>
          <div className={`orders-title-container ${theme}`}>
            <p className={`Orders-nav-title ${theme}`}>Order</p>
          </div>
        </div>
        <div className={`order-selectors ${theme}`}>

          <div className="orders-s-farmer-container">
            <p className="order-s-farmer-title">Farmer</p>
            <div className="orders-s-farmer-btn">
              <p>{farmerName}</p>
              <FontAwesomeIcon icon={faAngleUp} className="orders-arrowIcon" />
            </div>
          </div>

          <div className={`orders-s-crop-type-container ${theme}`}>
            <p className={`order-s-crops-title ${theme}`}>Crops</p>
            <div className={`orders-s-crop-type-btn ${theme}`}>
              <select
                value={selectedCrop}
                onChange={handleCropChange}
                className={`crop-type-sel ${theme}`}
                disabled={!selectedFarmer}
              >
                <option value="">Select a crop</option>
                {crops.map(crop => {
                  const cropName = crop.CROP_NAME || crop.cropName;
                  const cropId = crop.ID || crop.id || crop._id;
                  return (
                    <option key={cropId} value={cropName}>
                      {cropName} {crop.PRODUCE_YIELD ? `(${crop.PRODUCE_YIELD} kg available)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            {!selectedFarmer && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Please select a farmer first
              </p>
            )}
            {selectedFarmer && crops.length === 0 && (
              <p style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '5px' }}>
                No crops available for this farmer
              </p>
            )}
          </div>

          <div className={`orders-s-quantity-container ${theme}`}>
            <p className={`order-s-quantity-title ${theme}`}>Quantity</p>
            <div className={`orders-s-quantity-btn ${theme}`}>
              <input
                type="number"
                className={`orders-s-quantity-input-btn ${theme}`}
                placeholder="0"
                required
                value={quantity}
                onChange={handleQuantityChange}
                disabled={!selectedCrop}
                min="1"
              />
            </div>
            {selectedCrop && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Enter quantity in kilograms
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        {selectedFarmer && selectedCrop && quantity && (
          <div className={`order-summary ${theme}`} style={{
            margin: '20px 0',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: theme === 'dark' ? '#2d3748' : '#f8f9fa'
          }}>
            <h3 style={{ marginBottom: '10px' }}>Order Summary</h3>
            <div style={{ fontSize: '14px' }}>
              <p><strong>Farmer:</strong> {farmerName}</p>
              <p><strong>Crop:</strong> {selectedCrop}</p>
              <p><strong>Quantity:</strong> {quantity} kg</p>
            </div>
          </div>
        )}

        <div className="place-order-btn-container">
          {selectedFarmer && selectedCrop && quantity && parseInt(quantity) > 0 ? (
            <div
              className={`add-order-container add-order-btn-container ${isLoading ? 'loading' : ''}`}
              onClick={handleOrder}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <p>Placing Order...</p>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCirclePlus} className="add-orderIcon" />
                  <p>Place Order</p>
                </>
              )}
            </div>
          ) : (
            <div className="add-order-container add-order-btn-container disabled">
              <FontAwesomeIcon icon={faCirclePlus} className="add-orderIcon" />
              <p>Place Order</p>
            </div>
          )}
          <div className="cancel-order-container" onClick={handleCancel}>
            <p>Cancel</p>
          </div>
        </div>
        <div className="order-form-container">
          <div className="order-output-container">
          </div>
        </div>
      </div>
    </div>
  )
}