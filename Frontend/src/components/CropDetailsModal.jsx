import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight, faUpload, faCalendar, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { uploadCropImage, updateCrop } from '../services/ProduceService';
import '../styles/CropDetailsModal.css';

const CropDetailsModal = ({ crop, onClose, onUpdate, growthStages, theme = 'light' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedGrowthStage, setSelectedGrowthStage] = useState(crop.GROWTH_STAGE || 'planting');
  const [qtyAvailable, setQtyAvailable] = useState(crop.PRODUCE_YIELD || 0);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock growth history with images - replace with actual data from API
  const [growthHistory, setGrowthHistory] = useState([
    {
      date: crop.PLANT_DATE,
      stage: 'planting',
      image: '/images/planting-stage.jpg',
      description: 'Initial planting - seeds sown in prepared soil'
    },
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      stage: 'germination',
      image: '/images/germination-stage.jpg',
      description: 'First signs of sprouting observed'
    }
  ]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setNewImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const loadCropImages = async () => {
      try {
        const response = await getCropImages(crop.ID);
        if (response.success) {
          const growthHistory = response.data.map(img => ({
            id: img.ID,
            date: img.CREATED_AT,
            stage: img.GROWTH_STAGE,
            image_url: img.IMAGE_URL,
            description: img.DESCRIPTION
          }));

          // If no images, add at least the current crop info
          if (growthHistory.length === 0 && crop.PLANT_DATE) {
            growthHistory.push({
              id: 0,
              date: crop.PLANT_DATE,
              stage: crop.GROWTH_STAGE || 'planting',
              image_url: crop.IMAGE_URL || '/images/default-crop.jpg',
              description: 'Initial planting'
            });
          }

          setGrowthHistory(growthHistory);
        }
      } catch (error) {
        console.error('Error loading crop images:', error);
        // Fallback to basic crop info
        if (crop.PLANT_DATE) {
          setGrowthHistory([{
            id: 0,
            date: crop.PLANT_DATE,
            stage: crop.GROWTH_STAGE || 'planting',
            image_url: crop.IMAGE_URL || '/images/default-crop.jpg',
            description: 'Initial planting'
          }]);
        }
      }
    };

    if (crop?.ID) {
      loadCropImages();
    }
  }, [crop]);

  const handleUpdate = async () => {
    if (!newImage) {
      alert('Please upload an image for the growth stage update');
      return;
    }

    if (!selectedGrowthStage) {
      alert('Please select a growth stage');
      return;
    }

    setIsUpdating(true);

    try {
      // Upload image with growth stage info
      const uploadResponse = await uploadCropImage(
        crop.ID,
        newImage,
        `Growth stage update: ${getStageLabel(selectedGrowthStage)} - ${new Date().toLocaleDateString()}`,
        selectedGrowthStage
      );

      if (uploadResponse.success) {
        // Update crop growth stage and yield
        const updateResponse = await updateCrop(crop.ID, {
          growth_stage: selectedGrowthStage,
          produce_yield: qtyAvailable
        });

        if (updateResponse.success) {
          alert('Crop updated successfully!');
          onUpdate(updateResponse.data);
          onClose();
        }
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert(error.message || 'Failed to update crop. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === growthHistory.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? growthHistory.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStageLabel = (stageValue) => {
    return growthStages.find(stage => stage.value === stageValue)?.label || stageValue;
  };

  const getStageDescription = (stageValue) => {
    return growthStages.find(stage => stage.value === stageValue)?.description || '';
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`crop-details-modal ${theme} ${isUpdating ? 'loading' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* === Header === */}
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faSeedling} style={{ marginRight: '0.5rem' }} />
            {crop.CROP_NAME} - Growth Details
          </h2>
          <button className="close-btn" onClick={onClose} disabled={isUpdating}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* === Body === */}
        <div className="modal-body">
          {/* --- Basic Info --- */}
          <div className="crop-basic-info">
            <div className="info-row">
              <span className="info-label">Crop Type:</span>
              <span className="info-value">{crop.TYPE}</span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
                Planted Date:
              </span>
              <span className="info-value">{formatDate(crop.PLANT_DATE)}</span>
            </div>

            {/* Dynamic units */}
            <div className="info-row">
              <span className="info-label">Units Planted:</span>
              <span className="info-value">
                {crop.UNITS_PLANTED.toLocaleString()} {crop.UNIT_TYPE || ''}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Current Stage:</span>
              <span className="info-value">{getStageLabel(crop.GROWTH_STAGE)}</span>
            </div>
          </div>

          {/* --- Image Carousel --- */}
          <div className="image-carousel-section">
            <h3>Growth History Timeline</h3>
            <div className="carousel-container">
              <button
                className="carousel-btn prev"
                onClick={prevImage}
                disabled={growthHistory.length <= 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <div className="carousel-image">
                {/* Real image from Oracle bucket */}
                <img
                  src={growthHistory[currentImageIndex]?.image_url || crop.IMAGE_URL || '/images/default-crop.jpg'}
                  alt={`Growth stage: ${growthHistory[currentImageIndex]?.stage || 'Unknown'}`}
                  onError={(e) => {
                    e.target.src = '/images/default-crop.jpg';
                  }}
                />

                <div className="image-info">
                  <p><strong>Date:</strong> {formatDate(growthHistory[currentImageIndex]?.date)}</p>
                  <p><strong>Stage:</strong> {getStageLabel(growthHistory[currentImageIndex]?.stage)}</p>
                  <p><strong>Notes:</strong> {growthHistory[currentImageIndex]?.description || 'No notes provided.'}</p>
                </div>
              </div>

              <button
                className="carousel-btn next"
                onClick={nextImage}
                disabled={growthHistory.length <= 1}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>

            {growthHistory.length > 1 && (
              <div className="carousel-indicators">
                {growthHistory.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* --- Update Section --- */}
          <div className="update-section">
            <h3>Update Current Growth Stage</h3>

            <div className="update-form">
              <div className="form-group">
                <label>Select Growth Stage:</label>
                <select
                  value={selectedGrowthStage}
                  onChange={(e) => setSelectedGrowthStage(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Choose a stage...</option>
                  {growthStages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
                <small>{getStageDescription(selectedGrowthStage)}</small>
              </div>

              {/* Dynamic label for available units */}
              <div className="form-group">
                <label>
                  Current Yield Available ({crop.UNIT_TYPE || 'units'}):
                </label>
                <input
                  type="number"
                  value={qtyAvailable}
                  onChange={(e) => setQtyAvailable(Number(e.target.value))}
                  min="0"
                  step="0.1"
                  disabled={isUpdating}
                  placeholder={`Enter available ${crop.UNIT_TYPE || 'quantity'}`}
                />
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label>Upload Current Stage Photo:</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="growth-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-upload-input"
                    disabled={isUpdating}
                  />
                  <label htmlFor="growth-image" className="image-upload-btn">
                    <FontAwesomeIcon icon={faUpload} />
                    {newImage ? 'Change Image' : 'Choose Image'}
                  </label>

                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <small>Preview - {newImage?.name}</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="update-info">
                <p><strong>Update will be recorded on:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* === Footer === */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleUpdate}
            disabled={isUpdating || !selectedGrowthStage}
          >
            {isUpdating ? 'Updating...' : 'Update Growth Stage'}
          </button>
        </div>
      </div>
    </div>
  );

};

export default CropDetailsModal;