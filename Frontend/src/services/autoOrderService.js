import axiosInstance from '../axiosConfig';

export const autoOrder = async (orderData) => {
    try {
      const response = await axiosInstance.post('/api/v1/orders/auto', orderData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};