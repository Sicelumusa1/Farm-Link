import axiosInstance from '../axiosConfig';

export const profile = async () => {
  //Gets the information for the current user
    try {
      const response = await axiosInstance.get('/api/v1/profile');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};