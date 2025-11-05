import axiosInstance from '../axiosConfig';

// Basic Crop Operations
export const addCrop = async (cropData) => {
  try {
    const response = await axiosInstance.post('/api/v1/crops', cropData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getCrops = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/crops');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const updateCrop = async (cropId, updateData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/crops/${cropId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getCropDetails = async (cropId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/${cropId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const deleteCrop = async (cropId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/crops/${cropId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Image Operations with OCI Bucket
export const uploadCropImage = async (cropId, file, description = '', growthStage = '') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (description) formData.append('description', description);
    if (growthStage) formData.append('growth_stage', growthStage);

    const response = await axiosInstance.post(`/api/v1/crops/${cropId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Image upload failed' };
  }
};

export const getCropImages = async (cropId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/${cropId}/images`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch crop images' };
  }
};

export const deleteCropImage = async (cropId, imageId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/crops/${cropId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete image' };
  }
};

// Growth Stage Operations
export const updateCropGrowthStage = async (cropId, growthStage) => {
  try {
    const response = await axiosInstance.patch(`/api/v1/crops/${cropId}/growth-stage`, {
      growth_stage: growthStage
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update growth stage' };
  }
};

// Unit Conversion Operations
export const convertCropUnit = async (cropId, newUnit) => {
  try {
    const response = await axiosInstance.post(`/api/v1/crops/${cropId}/convert-unit`, {
      new_unit: newUnit
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to convert unit' };
  }
};

export const getRecommendedUnits = async (cropName) => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/units/recommended?crop=${encodeURIComponent(cropName)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get recommended units' };
  }
};

export const getUnitConversions = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/crops/units/conversions');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get unit conversions' };
  }
};

// Crop Analytics and Reports
export const getCropAnalytics = async (farmId, period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/analytics?farm_id=${farmId}&period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get crop analytics' };
  }
};

export const getCropsByFarm = async (farmId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/farm/${farmId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get farm crops' };
  }
};

// Available Crops for Marketplace
export const getAvailableCrops = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/crops/available');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get available crops' };
  }
};

// Crop with orders and deliveries
export const getCropWithOrdersAndDeliveries = async (cropId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/${cropId}/full-details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get crop details' };
  }
};

// Batch Operations
export const updateMultipleCrops = async (updates) => {
  try {
    const response = await axiosInstance.patch('/api/v1/crops/batch-update', { updates });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update crops' };
  }
};

// Crop Search and Filter
export const searchCrops = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await axiosInstance.get(`/api/v1/crops/search?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search crops' };
  }
};