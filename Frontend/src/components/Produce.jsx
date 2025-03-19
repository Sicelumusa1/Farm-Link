import React, { useContext, useState } from 'react'
import '../styles/Order.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import ProduceItem from './ProduceItem'
import Calender from './Calender'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Calender.css'
import { ThemeContext } from '../contexts/ThemeContext'

export default function Produce() {
  const [selectedCrop, setSelectedCrop] = useState('--None--');
  const [dropDown, setDropDown] = useState(false);
  const [unitsPlanted, setUnitsPlanted] = useState('0');
  const [add, setAdd] = useState(false);
  const [produce, setProduce] = useState([]);
  const [dropDownPlantDate, setDropDownPlantDate] = useState(false);
  const [selectedPlantDate, setSelectedPlantDate] = useState(null);
  const [selectedHarvestDate, setSelectedHarvestDate] = useState(null);
  const [plot, setPLot] = useState();
  const [type, setType] = useState('direct sow');
  const [image, setImage] = useState(null);
  const { theme } = useContext(ThemeContext);

  const handleSelect = (crop) => {
    //stores selected crop to state
    setSelectedCrop(crop);
    setDropDown(false);
  }


  const handleAdd = async () => {
    if (selectedCrop !== '--None--' && quantity > 0 && selectedPlantDate && type && image) {
      // const newProduce = { selectedCrop, quantity, selectedPlantDate, selectedHarvestDate, plot };
      // setProduce([...produce, newProduce]);
      // setadd(true);
      const formData = new FormData();
      formData.append('cropName', selectedCrop);
      formData.append('plantDate', selectedPlantDate);
      formData.append('type', type);
      formData.append('unitsPlanted', unitsPlanted);
      formData.append('image', image);

      try {
        const response = await fetch('profile/farm/crops', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          setProduce([...produce, data.data]);
          setAdd(true);
        }
      } catch (err) {
        console.error(err);
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
                <p onClick={() => handleSelect("--None--")}>--None--</p>
                <p onClick={() => handleSelect("Tomatoes")}>Tomatoes</p>
                <p onClick={() => handleSelect("Mushrooms")}>Mushrooms</p>
                <p onClick={() => handleSelect("Potatoes")}>Potatoes</p>
                <p onClick={() => handleSelect("Onions")}>Onions</p>
                <p onClick={() => handleSelect("Sprouts")}>Sprouts</p>
                <p onClick={() => handleSelect("Pumpkins")}>Pumpkins</p>
                <p onClick={() => handleSelect("Beans")}>Beans</p>
                <p onClick={() => handleSelect("Spinach")}>Spinach</p>
                <p onClick={() => handleSelect("Peppers")}>Peppers</p>
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
                onChange={(e) => setUnitsPlanted(e.target.value)}
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
          </div>
        </div>
        <div className={`add-produce-container ${theme}`} onClick={handleAdd}>
          <FontAwesomeIcon icon={faCirclePlus} className={`add-produceIcon ${theme}`} />
          <p>Add</p>
        </div>
      </div>
    </div>
  );
}
