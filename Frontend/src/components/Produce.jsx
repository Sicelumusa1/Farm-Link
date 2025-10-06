import React, { useContext, useState, useEffect } from 'react';
import '../styles/Produce.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faCirclePlus, faInfoCircle, faImages } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ThemeContext } from '../contexts/ThemeContext';
import { addCrop, getCrops, updateCrop } from '../services/ProduceService';
import { allFarmerDatails } from '../services/farmerService';
import CropGuidelinesPopup from './CropGuidelinesPopup';
import CropDetailsModal from './CropDetailsModal';

// Growth stages with corresponding image requirements
const GROWTH_STAGES = [
  { value: 'planting', label: 'Planting', description: 'Initial planting stage' },
  { value: 'germination', label: 'Germination', description: 'Seeds sprouting' },
  { value: 'seedling', label: 'Seedling', description: 'Young plants developing' },
  { value: 'vegetative', label: 'Vegetative Growth', description: 'Leaf and stem development' },
  { value: 'flowering', label: 'Flowering', description: 'Flower formation' },
  { value: 'fruiting', label: 'Fruiting', description: 'Fruit development' },
  { value: 'harvest', label: 'Ready for Harvest', description: 'Ready to harvest' },
  { value: 'harvested', label: 'Harvested', description: 'Crop harvested' }
];

export default function Produce() {
  const [selectedCrop, setSelectedCrop] = useState('--None--');
  const [dropDown, setDropDown] = useState(false);
  const [unitsPlanted, setUnitsPlanted] = useState(0);
  const [produce, setProduce] = useState([]);
  const [selectedPlantDate, setSelectedPlantDate] = useState(null);
  const [type, setType] = useState('direct sow');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [selectedCropDetails, setSelectedCropDetails] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [farm, setFarm] = useState(null);
  const { theme } = useContext(ThemeContext);

  // Load farm and crops on component mount
  useEffect(() => {
    fetchFarmAndCrops();
  }, []);

  const fetchFarmAndCrops = async () => {
    try {
      // Get farm details first
      const farmResponse = await allFarmerDatails();
      if (farmResponse.success && farmResponse.data) {
        setFarm(farmResponse.data);

        // Then get crops for this farm
        await fetchCrops();
      }
    } catch (error) {
      console.error('Error fetching farm details:', error);
    }
  };

  const fetchCrops = async () => {
    try {
      const response = await getCrops();
      if (response.success) {
        setProduce(response.data);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const handleSelect = (crop) => {
    setSelectedCrop(crop);
    setDropDown(false);
  };

  const handleAdd = async () => {
    if (!farm) {
      alert('Please set up your farm first before adding crops.');
      return;
    }

    if (selectedCrop !== '--None--' && unitsPlanted > 0 && selectedPlantDate) {
      const cropData = {
        farm_id: farm.ID, // Use farm ID from farm details
        crop_name: selectedCrop,
        plant_date: selectedPlantDate.toISOString(),
        type: type,
        units_planted: unitsPlanted,
        produce_yield: 0 // Start with 0 yield
      };

      try {
        const response = await addCrop(cropData);
        if (response.success) {
          setProduce([...produce, response.data]);
          alert('Crop added successfully!');

          // Reset form fields
          setSelectedCrop('--None--');
          setUnitsPlanted(0);
          setSelectedPlantDate(null);
          setType('direct sow');
        }
      } catch (error) {
        console.error('Error adding crop:', error);
        alert(error.message || 'Failed to add crop. Please try again.');
      }
    } else {
      alert('Please fill all fields correctly.');
    }
  };

  const handleCropRowClick = (crop) => {
    setSelectedCropDetails(crop);
    setShowCropModal(true);
  };

  const handleGrowthStageUpdate = async (updatedCrop) => {
    try {
      const updateData = {
        growth_stage: updatedCrop.growthStage,
        produce_yield: updatedCrop.qtyAvailable
      };

      const response = await updateCrop(updatedCrop.ID, updateData);

      if (response.success) {
        // Update local state
        setProduce(produce.map(crop =>
          crop.ID === updatedCrop.ID ? response.data : crop
        ));
        setShowCropModal(false);
        alert('Growth stage updated successfully!');
      }
    } catch (error) {
      console.error('Error updating growth stage:', error);
      alert(error.message || 'Failed to update growth stage. Please try again.');
    }
  };

  const getGrowthStageImage = (stage) => {
    // Placeholder images 
    const stageImages = {
      'planting': '/images/planting-stage.jpg',
      'germination': '/images/germination-stage.jpg',
      'seedling': '/images/seedling-stage.jpg',
      'vegetative': '/images/vegetative-stage.jpg',
      'flowering': '/images/flowering-stage.jpg',
      'fruiting': '/images/fruiting-stage.jpg',
      'harvest': '/images/harvest-stage.jpg',
      'harvested': '/images/harvested-stage.jpg'
    };
    return stageImages[stage] || '/images/default-crop.jpg';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCurrentGrowthStage = (crop) => {
    return GROWTH_STAGES.find(stage => stage.value === crop.GROWTH_STAGE)?.label || crop.GROWTH_STAGE || 'Not set';
  };

  return (
    <div className={`produce-container ${theme}`}>
      <div className={`produce-wrapper ${theme}`}>
        <div className={`produce-title ${theme}`}>
          <h1>Available Produce</h1>
          <button
            className="produce-guidelines-btn"
            onClick={() => setShowGuidelines(true)}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            Crop Guidelines
          </button>
        </div>

        {/* Add Crop Form */}
        <div className={`produce-selectors ${theme}`}>
          <div className="produce-crop-type-container">
            <p className="produce-crops-title">Crops</p>
            <div className={`produce-crop-type-btn ${theme}`} onClick={() => setDropDown((prev) => !prev)}>
              <p>{selectedCrop}</p>
              <FontAwesomeIcon icon={faAngleUp} className="produce-arrowIcon" />
            </div>
            {dropDown && (
              <div className={`produce-crop-dropdown ${theme}`}>
                <p onClick={() => handleSelect('--None--')}>--None--</p>
                <p onClick={() => handleSelect('Tomatoes')}>Tomatoes</p>
                <p onClick={() => handleSelect('Cabbage')}>Cabbage</p>
                <p onClick={() => handleSelect('Potatoes')}>Potatoes</p>
                <p onClick={() => handleSelect('Onions')}>Onions</p>
                <p onClick={() => handleSelect('Pumpkins')}>Pumpkins</p>
                <p onClick={() => handleSelect('Beans')}>Beans</p>
                <p onClick={() => handleSelect('Spinach')}>Spinach</p>
                <p onClick={() => handleSelect('Peppers')}>Peppers</p>
              </div>
            )}
          </div>

          <div className={`produce-quantity-container ${theme}`}>
            <p className="produce-quantity-title">Units Planted</p>
            <div className={`produce-quantity-btn ${theme}`}>
              <input
                type="number"
                className={`produce-quantity-input ${theme}`}
                value={unitsPlanted}
                onChange={(e) => setUnitsPlanted(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div className="produce-plantDate-container">
            <p className="produce-plantDate-title">Planted</p>
            <div className="produce-plantDate-btn">
              <DatePicker
                selected={selectedPlantDate}
                onChange={(date) => setSelectedPlantDate(date)}
                placeholderText="Select a date"
                dateFormat="MM/dd/yyyy"
                className="produce-date-input"
                maxDate={new Date()}
              />
            </div>
          </div>

          <div className="produce-type-container">
            <p className="produce-type-title">Type</p>
            <div className="produce-type-btn">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="produce-type-select"
              >
                <option value="direct sow">Direct Sow</option>
                <option value="transplant">Transplant</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`produce-add-btn ${theme}`} onClick={handleAdd}>
          <FontAwesomeIcon icon={faCirclePlus} className={`produce-add-icon ${theme}`} />
          <p>Add Crop</p>
        </div>
      </div>

      {/* Crops Table */}
      <div className={`produce-table-container ${theme}`}>
        <table className="produce-table">
          <thead>
            <tr className="produce-table-header">
              <th>Crop</th>
              <th>Units Planted</th>
              <th>Date</th>
              <th>Growth Stage</th>
              <th>QTY Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {produce.map((crop, index) => (
              <tr
                key={crop.ID || index}
                className="produce-table-row"
                onClick={() => handleCropRowClick(crop)}
              >
                <td className="produce-table-cell crop-name" data-label="Crop">
                  {crop.CROP_NAME}
                </td>
                <td className="produce-table-cell" data-label="Units Planted">
                  {crop.UNITS_PLANTED}
                </td>
                <td className="produce-table-cell" data-label="Date">
                  {formatDate(crop.PLANT_DATE)}
                </td>
                <td className="produce-table-cell growth-stage" data-label="Growth Stage">
                  <img
                    src={getGrowthStageImage(crop.GROWTH_STAGE)}
                    alt={crop.GROWTH_STAGE}
                    className="growth-stage-image"
                  />
                  <span>{getCurrentGrowthStage(crop)}</span>
                </td>
                <td className="produce-table-cell" data-label="QTY Available">
                  {crop.PRODUCE_YIELD || 0} kg
                </td>
                <td className="produce-table-cell actions" data-label="Actions">
                  <button
                    className="produce-view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCropRowClick(crop);
                    }}
                  >
                    <FontAwesomeIcon icon={faImages} />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {produce.length === 0 && (
          <div className="produce-no-crops">
            <p>No crops added yet. Add your first crop to get started!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showGuidelines && (
        <CropGuidelinesPopup onClose={() => setShowGuidelines(false)} />
      )}

      {showCropModal && selectedCropDetails && (
        <CropDetailsModal
          crop={selectedCropDetails}
          onClose={() => setShowCropModal(false)}
          onUpdate={handleGrowthStageUpdate}
          growthStages={GROWTH_STAGES}
          theme={theme}
        />
      )}
    </div>
  );
}