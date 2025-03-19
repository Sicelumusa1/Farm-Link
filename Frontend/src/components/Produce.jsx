import React, { useContext, useState } from 'react';
import '../styles/Order.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faCirclePlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ThemeContext } from '../contexts/ThemeContext';
import { addCrop } from '../services/ProduceService';
import CropGuidelinesPopup from './CropGuidelinesPopup';

export default function Produce() {
  const [selectedCrop, setSelectedCrop] = useState('--None--');
  const [dropDown, setDropDown] = useState(false);
  const [unitsPlanted, setUnitsPlanted] = useState(0);
  const [add, setAdd] = useState(false);
  const [produce, setProduce] = useState([]);
  const [selectedPlantDate, setSelectedPlantDate] = useState(null);
  const [type, setType] = useState('direct sow');
  const [image, setImage] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const { theme } = useContext(ThemeContext);

  const handleSelect = (crop) => {
    setSelectedCrop(crop);
    setDropDown(false);
  };

  const handleAdd = async () => {
    if (selectedCrop !== '--None--' && unitsPlanted > 0 && selectedPlantDate && type && image) {
      const formData = new FormData();
      formData.append('cropName', selectedCrop);
      formData.append('plantDate', selectedPlantDate);
      formData.append('type', type);
      formData.append('unitsPlanted', unitsPlanted);
      formData.append('image', image);

      try {
        const response = await addCrop(formData); // Use the addCrop service
        if (response.success) {
          setProduce([...produce, response.data]); // Add the new crop to the list
          setAdd(true);
          alert('Crop added successfully!');
        }
      } catch (error) {
        console.error('Error adding crop:', error);
        alert('Failed to add crop. Please try again.');
      }
    } else {
      alert('Please fill all fields correctly.');
    }
  };

  return (
    <div className={`orders-container ${theme}`}>
      <div className={`orders-wrapper ${theme}`}>
        <div className={`orders-title ${theme}`}>
          <h1>Available Produce</h1>
        </div>
        <div className={`order-selectors ${theme}`}>
          <div className="orders-s-crop-type-container">
            <p className="order-s-crops-title">Crops</p>
            <div className={`orders-s-crop-type-btn ${theme}`} onClick={() => setDropDown((prev) => !prev)}>
              <p>{selectedCrop}</p>
              <FontAwesomeIcon icon={faAngleUp} className="orders-arrowIcon" />
            </div>
            {dropDown && (
              <div className={`crop-type-dropDown ${theme}`}>
                <p onClick={() => handleSelect('--None--')}>--None--</p>
                <p onClick={() => handleSelect('Tomatoes')}>Tomatoes</p>
                <p onClick={() => handleSelect('Cabbage')}>Cabbage</p>
                <p onClick={() => handleSelect('Potatoes')}>Potatoes</p>
                <p onClick={() => handleSelect('Onions')}>Onions</p>
                <p onClick={() => handleSelect('Sprouts')}>Sprouts</p>
                <p onClick={() => handleSelect('Pumpkins')}>Pumpkins</p>
                <p onClick={() => handleSelect('Beans')}>Beans</p>
                <p onClick={() => handleSelect('Spinach')}>Spinach</p>
                <p onClick={() => handleSelect('Peppers')}>Peppers</p>
              </div>
            )}
          </div>
          <div className={`orders-s-quantity-container ${theme}`}>
            <p className="order-s-quantity-title">Units Planted</p>
            <div className={`orders-s-quantity-btn produce-s-quantity-btn ${theme}`}>
              <input
                type="number"
                className={`produce-s-quantity-btn-input ${theme}`}
                value={unitsPlanted}
                onChange={(e) => setUnitsPlanted(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="orders-s-plantDate-container">
            <p className="order-s-plantDate-title">Planted</p>
            <div className="orders-s-plantDate-btn">
              <DatePicker
                selected={selectedPlantDate}
                onChange={(date) => setSelectedPlantDate(date)}
                placeholderText="Select a date"
                dateFormat="MM/dd/yyyy"
                className="form-control"
              />
            </div>
          </div>
          <div className="orders-s-type-container">
            <p className="order-s-type-title">Type</p>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="direct sow">Direct Sow</option>
              <option value="transplant">Transplant</option>
            </select>
          </div>
          <div className="orders-s-image-container">
            <p className="order-s-image-title">Image</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <p>Upload Image</p>
          </div>
          <div className="guidelines-btn-container">
            {selectedCrop !== '--None--' && (
              <div className={`guidelines-btn ${theme}`} onClick={() => setShowGuidelines(true)}>
                <FontAwesomeIcon icon=
                {faInfoCircle} className='guidelines-icon' />
                <p>Guidelines</p>
              </div>
            )}
          </div>
        </div>
        <div className={`add-produce-container ${theme}`} onClick={handleAdd}>
          <FontAwesomeIcon icon={faCirclePlus} className={`add-produceIcon ${theme}`} />
          <p>Add</p>
        </div>
      </div>
      <div className="produce-form-container">
        <div className="produce-title-container">
          <p className="produce-title-produce">Produce</p>
          <div className="product-title-produce-container">
            <p className="produce-title-quantity">Quantity</p>
          </div>
        </div>
        <div className="order-output-container">
          {add &&
            produce.map((item, index) => (
              <ProduceItem
                key={index}
                crop={item.cropName}
                quantityL={item.unitsPlanted}
                selectedPlantDate={item.plantDate}
                type={item.type}
                image={item.images[0]?.url} // Pass the image URL
              />
            ))}
        </div>
      </div>
      {showGuidelines && (
        <CropGuidelinesPopup 
          crop={selectedCrop}
          onClose={() => setShowGuidelines(false)}
        />
      )}
    </div>
  );
}
