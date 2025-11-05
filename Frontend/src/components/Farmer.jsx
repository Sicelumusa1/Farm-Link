import { useContext, useState, useEffect } from 'react';
import { farmerDelete } from '../services/farmerService';
import '../styles/Farmer.css';
import { ThemeContext } from '../contexts/ThemeContext';
import { useSelectedFarmer } from '../contexts/SelectedFarmerContext';
import Swal from 'sweetalert2';
import '../styles/AlertStyles.css'

export default function Farmer({ onOrderClick }) {
    const { theme } = useContext(ThemeContext);
    const { selectedFarmer, setSelectedFarmer } = useSelectedFarmer(); 
    const [filteredCrops, setFilteredCrops] = useState([]);
    const [growthStageFilter, setGrowthStageFilter] = useState('all');
    const [currentCropIndex, setCurrentCropIndex] = useState(0);
    const [cropImages, setCropImages] = useState({});


    // Filter crops based on growth stage and exclude "harvested"
    useEffect(() => {
        // Access crops from farm object
        const crops = selectedFarmer?.crops || selectedFarmer?.CROPS || [];
        
        let filtered = crops.filter(crop => {
            // Use lowercase property names
            const growthStage = crop.growthStage || crop.GROWTH_STAGE;
            const isNotHarvested = growthStage?.toLowerCase() !== 'harvested';
            return isNotHarvested;
        });

        // Apply growth stage filter
        if (growthStageFilter !== 'all') {
            filtered = filtered.filter(crop => {
                const growthStage = crop.growthStage || crop.GROWTH_STAGE;
                return growthStage?.toLowerCase() === growthStageFilter.toLowerCase();
            });
        }

        setFilteredCrops(filtered);
        setCurrentCropIndex(0);
    }, [selectedFarmer, growthStageFilter]);

    // Fetch images for the current crop when it changes
    useEffect(() => {
        const fetchCurrentCropImages = async () => {
            if (filteredCrops.length > 0 && currentCropIndex >= 0) {
                const currentCrop = filteredCrops[currentCropIndex];
                if (currentCrop && (currentCrop.id || currentCrop._id || currentCrop.ID)) {
                    await fetchCropImages(currentCrop);
                }
            }
        };

        fetchCurrentCropImages();
    }, [currentCropIndex, filteredCrops]);

    // Function to fetch images for a specific crop
    const fetchCropImages = async (crop) => {
        try {
            
            // Mock data - replace with actual API call
            const mockImages = [
                {
                    id: 1,
                    url: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Crop+Progress',
                    growth_stage: 'Vegetative',
                    created_at: '2024-01-15T10:00:00Z'
                },
                {
                    id: 2, 
                    url: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Growth+Update',
                    growth_stage: 'Flowering',
                    created_at: '2024-01-20T10:00:00Z'
                }
            ];

            // Get crop growth stage
            const cropGrowthStage = crop.growthStage || crop.GROWTH_STAGE;
            
            // Sort by creation date to get the latest image
            const latestImage = mockImages
                .filter(img => img.growth_stage === cropGrowthStage)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            const cropId = crop.id || crop._id || crop.ID;
            setCropImages(prev => ({
                ...prev,
                [cropId]: latestImage
            }));

        } catch (error) {
            console.error('Error fetching crop images:', error);
            const cropId = crop.id || crop._id || crop.ID;
            setCropImages(prev => ({
                ...prev,
                [cropId]: null
            }));
        }
    };

    // Auto-rotate carousel
    useEffect(() => {
        if (filteredCrops.length > 1) {
            const interval = setInterval(() => {
                setCurrentCropIndex((prevIndex) => 
                    prevIndex === filteredCrops.length - 1 ? 0 : prevIndex + 1
                );
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [filteredCrops.length]);

    const handleDeregister = async () => {
        try {
            if (selectedFarmer && (selectedFarmer.id || selectedFarmer._id)) {
                const result = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'Do you really want to de-register this farmer?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, de-register',
                    cancelButtonText: 'No, keep farmer',
                    customClass: {
                        confirmButton: 'confirm-deregister',
                        cancelButton: 'cancel-deregister'
                    }
                });

                if (result.isConfirmed) {
                    const farmerId = selectedFarmer.id || selectedFarmer._id;
                    await farmerDelete(farmerId);
                    setSelectedFarmer(null);

                    await Swal.fire({
                        title: 'Success!',
                        text: 'Farmer de-registered successfully',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'acknowledge-deregister-button'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error de-registering farmer:', error);
            Swal.fire({
                title: 'Error!',
                text: 'There was an error de-registering the farmer. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'confirm-deregister-error'
                }
            });
        }
    };

    const handleCropNavigation = (direction) => {
        if (filteredCrops.length === 0) return;
        
        if (direction === 'next') {
            setCurrentCropIndex(prev => 
                prev === filteredCrops.length - 1 ? 0 : prev + 1
            );
        } else {
            setCurrentCropIndex(prev => 
                prev === 0 ? filteredCrops.length - 1 : prev - 1
            );
        }
    };

    const getGrowthStageOptions = () => {
        const crops = selectedFarmer?.farm?.crops || selectedFarmer?.CROPS || [];
        if (!crops.length) return [];
        
        const stages = new Set();
        crops.forEach(crop => {
            const growthStage = crop.growthStage || crop.GROWTH_STAGE;
            if (growthStage && growthStage.toLowerCase() !== 'harvested') {
                stages.add(growthStage);
            }
        });
        
        return ['all', ...Array.from(stages)];
    };

    const currentCrop = filteredCrops[currentCropIndex];
    const cropId = currentCrop ? (currentCrop.id || currentCrop._id || currentCrop.ID) : null;
    const currentCropImage = cropId ? cropImages[cropId] : null;

    // Check if crops section should render
    const crops = selectedFarmer?.farm?.crops || selectedFarmer?.CROPS || [];
    const shouldShowCropsSection = crops.length > 0;

    // Helper function to get crop property safely
    const getCropProperty = (crop, property) => {
        // Try lowercase first, then uppercase
        return crop[property.toLowerCase()] || crop[property] || 'N/A';
    };

    // Helper function to get farm property safely
    const getFarmProperty = (property) => {
        const farm = selectedFarmer?.farm || selectedFarmer?.FARM;
        if (!farm) return 'N/A';
        return farm[property.toLowerCase()] || farm[property] || 'N/A';
    };

    return (
        <div className="indiv-farmer-container">
            <div className={`indiv-farmer-wrapper ${theme}`}>
                <div className={`indiv-farmer-title ${theme}`}>
                    <h1>Farmer Details</h1>
                    <div className={`farmer-back-container ${theme}`} onClick={() => setSelectedFarmer(null)}>X</div>
                </div>
                
                <div className="farmer-info-wrapper">
                    {selectedFarmer && (
                        <div className={`farmer-details-grid ${theme}`}>
                            {/* Farmer Personal Information */}
                            <div className={`farmer-personal-info ${theme}`}>
                                <h3>Personal Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{selectedFarmer.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{selectedFarmer.email || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">{selectedFarmer.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Member Since:</span>
                                        <span className="info-value">
                                            {selectedFarmer.createdAt ? new Date(selectedFarmer.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Farm Information */}
                            {(selectedFarmer.farm || selectedFarmer.FARM) && (
                                <div className={`farm-info ${theme}`}>
                                    <h3>Farm Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Farm Name:</span>
                                            <span className="info-value">{getFarmProperty('NAME')}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Farm Size:</span>
                                            <span className="info-value">{getFarmProperty('FARM_SIZE')} {getFarmProperty('FARM_SIZE') !== 'N/A' ? 'ha' : ''}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">City:</span>
                                            <span className="info-value">{getFarmProperty('CITY')}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Ward:</span>
                                            <span className="info-value">
                                                {getFarmProperty('WARD') !== 'N/A' ? `Ward ${getFarmProperty('WARD')}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Municipality:</span>
                                            <span className="info-value">{getFarmProperty('MUNICIPALITY')}</span>
                                        </div>
                                        {getFarmProperty('LATITUDE') !== 'N/A' && getFarmProperty('LONGITUDE') !== 'N/A' && (
                                            <div className="info-item">
                                                <span className="info-label">Coordinates:</span>
                                                <span className="info-value">
                                                    {parseFloat(getFarmProperty('LATITUDE')).toFixed(6)}, {parseFloat(getFarmProperty('LONGITUDE')).toFixed(6)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="contact-delect-container">
                        <button className={`farmer-order-btn ${theme}`} onClick={() => onOrderClick(selectedFarmer)}>
                            Place Order
                        </button>
                        {selectedFarmer && selectedFarmer.email ? (
                            <a href={`mailto:${selectedFarmer.email}`}>
                                <button className={`farmer-contact-btn ${theme}`}>Contact Farmer</button>
                            </a>
                        ) : (
                            <button className={`farmer-contact-btn ${theme}`} disabled>Contact</button>
                        )}
                        <button className={`farmer-deregister ${theme}`} onClick={handleDeregister}>
                            Deregister Farmer
                        </button>
                    </div>

                    {/* Crops Carousel Section */}
                    {shouldShowCropsSection && (
                        <div className={`crops-section ${theme}`}>
                            <div className="crops-header">
                                <h3>Active Crops</h3>
                                
                                {/* Growth Stage Filter */}
                                {getGrowthStageOptions().length > 1 && (
                                    <div className="growth-stage-filter">
                                        <label htmlFor="growthStageFilter">Filter by Growth Stage:</label>
                                        <select 
                                            id="growthStageFilter"
                                            value={growthStageFilter}
                                            onChange={(e) => setGrowthStageFilter(e.target.value)}
                                            className={`filter-select ${theme}`}
                                        >
                                            <option value="all">All Stages</option>
                                            {getGrowthStageOptions()
                                                .filter(stage => stage !== 'all')
                                                .map(stage => (
                                                    <option key={stage} value={stage}>
                                                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                            </div>

                            {filteredCrops.length > 0 ? (
                                <div className="crops-carousel-container">
                                    {/* Carousel Navigation */}
                                    {filteredCrops.length > 1 && (
                                        <div className="carousel-navigation">
                                            <button 
                                                className={`nav-btn prev ${theme}`}
                                                onClick={() => handleCropNavigation('prev')}
                                            >
                                                ‹
                                            </button>
                                            <span className="carousel-counter">
                                                {currentCropIndex + 1} / {filteredCrops.length}
                                            </span>
                                            <button 
                                                className={`nav-btn next ${theme}`}
                                                onClick={() => handleCropNavigation('next')}
                                            >
                                                ›
                                            </button>
                                        </div>
                                    )}

                                    {/* Current Crop Display */}
                                    <div className="current-crop-display">
                                        {currentCrop && (
                                            <div className={`crop-card ${theme}`}>
                                                <div className="crop-header">
                                                    <h4>{getCropProperty(currentCrop, 'CROP_NAME')}</h4>
                                                    {getCropProperty(currentCrop, 'GROWTH_STAGE') !== 'N/A' && (
                                                        <span className={`growth-stage-badge ${getCropProperty(currentCrop, 'GROWTH_STAGE')?.toLowerCase().replace(' ', '-')}`}>
                                                            {getCropProperty(currentCrop, 'GROWTH_STAGE')}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Crop Image Display */}
                                                <div className="crop-image-section">
                                                    {currentCropImage ? (
                                                        <div className="crop-image-container">
                                                            <img 
                                                                src={currentCropImage.url} 
                                                                alt={`${getCropProperty(currentCrop, 'CROP_NAME')} - ${getCropProperty(currentCrop, 'GROWTH_STAGE')}`}
                                                                className="crop-image"
                                                            />
                                                            <div className="image-caption">
                                                                Latest {getCropProperty(currentCrop, 'GROWTH_STAGE')} stage image
                                                                {currentCropImage.created_at && (
                                                                    <span className="image-date">
                                                                        {new Date(currentCropImage.created_at).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="no-image-placeholder">
                                                            <div className="placeholder-icon">🌱</div>
                                                            <p>No image available for current growth stage</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="crop-details">
                                                    <div className="crop-detail-item">
                                                        <span className="detail-label">Availability:</span>
                                                        <span className="detail-value">{getCropProperty(currentCrop, 'PRODUCE_YIELD')} kg</span>
                                                    </div>
                                                    {getCropProperty(currentCrop, 'PLANT_DATE') !== 'N/A' && (
                                                        <div className="crop-detail-item">
                                                            <span className="detail-label">Planted:</span>
                                                            <span className="detail-value">
                                                                {new Date(getCropProperty(currentCrop, 'PLANT_DATE')).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {getCropProperty(currentCrop, 'TYPE') !== 'N/A' && (
                                                        <div className="crop-detail-item">
                                                            <span className="detail-label">Planting Type:</span>
                                                            <span className="detail-value">{getCropProperty(currentCrop, 'TYPE')}</span>
                                                        </div>
                                                    )}
                                                    {getCropProperty(currentCrop, 'UNITS_PLANTED') !== 'N/A' && (
                                                        <div className="crop-detail-item">
                                                            <span className="detail-label">Units Planted:</span>
                                                            <span className="detail-value">{getCropProperty(currentCrop, 'UNITS_PLANTED')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Crop Dots Indicator */}
                                    {filteredCrops.length > 1 && (
                                        <div className="carousel-dots">
                                            {filteredCrops.map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`dot ${index === currentCropIndex ? 'active' : ''} ${theme}`}
                                                    onClick={() => setCurrentCropIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="no-crops-message">
                                    <p>No active crops found{growthStageFilter !== 'all' ? ` with growth stage "${growthStageFilter}"` : ''}.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show message if no crops at all */}
                    {selectedFarmer && crops.length === 0 && (
                        <div className={`crops-section ${theme}`}>
                            <div className="no-crops-message">
                                <p>No crop data available for this farm.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}