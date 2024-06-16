import axiosInstance from '../axiosConfig';

export const fetchRoute = async (farmNames) => {
    try {
      const response = await axiosInstance.post('/api/v1/plan', {farmNames});
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};