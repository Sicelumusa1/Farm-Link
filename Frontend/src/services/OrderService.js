import axiosInstance from '../axiosConfig';

// CREATE (Admin)
export const placeOrder = async (orderData) => {
  const response = await axiosInstance.post('/api/v1/orders', orderData);
  return response.data;
};

// GET (Admin)
export const getOrders = async () => {
  const response = await axiosInstance.get('api/v1/orders/admin');
  return response.data;
};

// GET (Farmer)
export const getFarmerOrders = async (status = null) => {
  const params = status ? { status } : {};
  const response = await axiosInstance.get('api/v1/orders', { params });
  return response.data;
};

// UPDATE STATUS (Farmer/Admin)
export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.patch(`api/v1/orders/${orderId}/status`, { status });
  return response.data;
};

// ACKNOWLEDGE ORDER (Farmer)
export const acknowledgeOrder = async (orderId) => {
  const response = await axiosInstance.patch(`api/v1/orders/${orderId}/acknowledge`);
  return response.data;
};

export const getFarmersWithCrops = async () => {
  //gets all farmers with their crops and farms for admin order placement
  try {
    const response = await axiosInstance.get('api/v1/users/farmers-with-crops');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateOrder = async (orderId, orderData) => {
  //update order details (admin only)
  try {
    const response = await axiosInstance.put(`api/v1/orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteOrder = async (orderId) => {
  //delete an order (admin only)
  try {
    const response = await axiosInstance.delete(`api/v1/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getOrderStatistics = async () => {
  //get order statistics for dashboard
  try {
    const response = await axiosInstance.get('api/v1/orders/statistics');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getOrdersByStatus = async (status) => {
  //get orders filtered by specific status
  try {
    const response = await axiosInstance.get(`api/v1/orders/status/${status}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRecentOrders = async (limit = 10) => {
  //get recent orders for dashboard
  try {
    const response = await axiosInstance.get(`api/v1/orders/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};