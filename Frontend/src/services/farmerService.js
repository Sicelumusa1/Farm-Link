import axiosInstance from '../axiosConfig';

export const usersData = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/api/v1/admin/users?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const farmerDatails = async (userId) => {
  //pulls farmer's details by ID
  try {
    const response = await axiosInstance.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const farmerDelete = async (userId) => {
  //deletes a farmer from the system
  try {
    const response = await axiosInstance.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const allFarmerDatails = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/profile/farm');
    // console.log('Farm API Response:', response.data);
    return response.data;
  } catch (error) {
    // console.error('Farm API Error:', error);
    // Safe error handling
    const errorData = error.response?.data || { message: error.message || 'Network error' };
    throw errorData;
  }
}

export const updateFarmerDatails = async (farmData) => {
  try {
    const response = await axiosInstance.put('/api/v1/profile/farm', farmData);
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || { message: error.message || 'Network error' };
    throw errorData;
  }
}

export const addFarmerDatails = async (farmData) => {
  try {
    const response = await axiosInstance.post('/api/v1/profile/farm', farmData);
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || { message: error.message || 'Network error' };
    throw errorData;
  }
}