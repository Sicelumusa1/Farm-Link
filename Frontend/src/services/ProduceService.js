import axiosInstance from '../axiosConfig';

// export const addCrop = async (userData) => {
//   //handles adding crops to the database
//     try {
//       const response = await axiosInstance.post('api/v1/profile/farm/crops', userData);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
// };

export const addCrop = async (formData) => {
  try {
    const response = await axiosInstance.post('api/v1/profile/farm/crops', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const fetchCrops = async () => {
  //handles updating crops on the database
    try {
      const response = await axiosInstance.get('api/v1/profile/farm/crops');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const updateCrops = async (cropId, updatedData) => {
  //handles fetching crops from the database
    try {
      const response = await axiosInstance.put(`api/v1/profile/farm/crops/${cropId}`, updatedData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};