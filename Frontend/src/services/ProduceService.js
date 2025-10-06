import axiosInstance from '../axiosConfig';


export const addCrop = async (cropData) => {
  try {
    const response = await axiosInstance.post('/api/v1/crops', cropData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getCrops = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/crops');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const updateCrop = async (cropId, updateData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/crops/${cropId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getCropDetails = async (cropId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/crops/${cropId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const deleteCrop = async (cropId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/crops/${cropId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const uploadCropImage = async (cropId, file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post(`/api/v1/crops/${cropId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Image upload failed' };
  }
};