import axiosInstance from '../axiosConfig';


export const getYieldTrends = async (period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/v1/analytics/yield-trends?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get yield trends' };
  }
};

export const getCropDistribution = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/analytics/crop-distribution');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get crop distribution' };
  }
};

export const getGrowthStageAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/analytics/growth-stages');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get growth stage analytics' };
  }
};

export const getRevenueAnalytics = async (period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/v1/analytics/revenue?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get revenue analytics' };
  }
};

export const getFarmerPerformance = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/analytics/farmer-performance');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get farmer performance data' };
  }
};

export const generateReport = async (reportType, parameters = {}) => {
  try {
    const response = await axiosInstance.post('/api/v1/analytics/generate-report', {
      reportType,
      parameters
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate report' };
  }
};

export const exportData = async (format = 'csv', filters = {}) => {
  try {
    const response = await axiosInstance.post('/api/v1/analytics/export', {
      format,
      filters
    }, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to export data' };
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