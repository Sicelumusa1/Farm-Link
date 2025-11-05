import axiosInstance from '../axiosConfig';

export const setAdminMunicipality = async (locationData) => {
  try {
    const response = await axiosInstance.post('/api/v1/admin/location', locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getAdminMunicipality = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/admin/location');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const checkAdminLocation = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/admin/check-location');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};