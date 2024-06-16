import axiosInstance from '../axiosConfig';

export const placeOrder = async (orderData) => {
  //posts orders into the database
    try {
      const response = await axiosInstance.post('/api/v1/order', orderData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const getOrder = async () => {
  //gets all the orders for a particular user
    try {
      const response = await axiosInstance.get('/api/v1/profile/farm');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.put(`api/v1/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getOrders = async () => {
  //pull all orders from the database
    try {
      const response = await axiosInstance.get('api/v1/orders');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};