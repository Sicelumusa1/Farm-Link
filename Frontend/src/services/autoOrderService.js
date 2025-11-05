import axiosInstance from '../axiosConfig';

export const autoOrder = async (orderData) => {
    try {
      const response = await axiosInstance.post('api/v1/auto-orders/create', orderData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const getAvailableCrops = async () => {
  try {
    const response = await axiosInstance.get('api/v1/auto-orders/available-crops');
    return response.data;
  } catch (error) {
    console.error('Error fetching available crops:', error);
    throw error.response?.data || { 
      message: 'Failed to fetch available crops' 
    };
  }
};

export const getCropAvailabilityReport = async () => {
  try {
    const response = await axiosInstance.get('api/v1/auto-orders/availability-report');
    return response.data;
  } catch (error) {
    console.error('Error fetching crop availability report:', error);
    throw error.response?.data || { 
      message: 'Failed to fetch crop availability report' 
    };
  }
};

export const getCropAvailabilityDetails = async (cropName) => {
  try {
    const response = await axiosInstance.get(`api/v1/auto-orders/availability-details/${cropName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching availability details for ${cropName}:`, error);
    throw error.response?.data || { 
      message: `Failed to fetch availability details for ${cropName}` 
    };
  }
};