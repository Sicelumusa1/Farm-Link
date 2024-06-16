export const getUserOrders = async () => {
    //pull all orders from the database
      try {
        const response = await axiosInstance.get('/api/v1/users');
        return response.data;
      } catch (error) {
        throw error.response.data;
      }
};