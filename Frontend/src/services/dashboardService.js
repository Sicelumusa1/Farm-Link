import axiosInstance from '../axiosConfig';

export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get dashboard stats' };
  }
};

export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin/dashboard/activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get recent activity' };
  }
};

export const getYieldTrends = async (period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin/dashboard/yield-trends?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get yield trends' };
  }
};