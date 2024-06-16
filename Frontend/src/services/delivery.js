import axiosInstance from '../axiosConfig';


export const planDelivery = async (userData) => {
  //posts delivery data to the backend
    try {
      const response = await axiosInstance.post('/api/v1/', userData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const getDelivery = async () => {
  //pulls delivery data for the backend
    try {
      const response = await axiosInstance.get('/api/v1/');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};