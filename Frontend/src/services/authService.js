import axiosInstance from '../axiosConfig';

export const registerUser = async (userData) => {
  //handles the user registration
  try {
    const response = await axiosInstance.post('api/v1/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (userData) => {
  //handles the user login
  try {
    const response = await axiosInstance.post('api/v1/login', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const forgotPassword = async (userData) => {
  //handles sending a password reset link
  try {
    const response = await axiosInstance.post('api/v1/forgot/password', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// export const ResetPassword = async (userData) => {
//   //resets the password
//   try {
//     const response = await axiosInstance.post('api/v1/password/reset/:token', userData);
//     return response.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };

export const ResetPassword = async (token, userData) => {
  try {
    const response = await axiosInstance.put(`api/v1/password/reset/${token}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const Logout = async () => {
  //logout
  try {
    const response = await axiosInstance.get('api/v1/logout');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};