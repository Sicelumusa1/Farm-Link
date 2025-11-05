import axiosInstance from '../axiosConfig';

export const recordTransaction = async (transactionData) => {
  try {    
    const response = await axiosInstance.post('/api/v1/transactions', transactionData, {
      timeout: 10000, // 10-second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Transaction service error:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    throw error.response?.data || error;
  }
};

export const getTransaction = async (transactionId) => {
  //gets a specific transaction by ID
  try {
    const response = await axiosInstance.get(`api/v1/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTransactions = async (filters = {}) => {
  //pull transactions with optional filtering
  try {
    const response = await axiosInstance.get('api/v1/transactions', { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTransaction = async (transactionId, transactionData) => {
  //update transaction details
  try {
    const response = await axiosInstance.put(
      `api/v1/transactions/${transactionId}`, 
      transactionData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating transaction ${transactionId}:`, error);
    throw error.response?.data || error;
  }
};

export const deleteTransaction = async (transactionId) => {
  //delete a transaction
  try {
    const response = await axiosInstance.delete(`api/v1/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getFinancialSummary = async (timeframe = 'this-month', cropId = null) => {
  //get financial summary for dashboard
  try {
    const params = { timeframe };
    if (cropId) params.cropId = cropId;
    
    const response = await axiosInstance.get('api/v1/financial/summary', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error.response?.data || { 
      message: error.message || 'Failed to fetch financial summary' 
    };
  }
};

export const getCropProfitability = async (cropId = null) => {
  //get profitability analysis per crop
  try {
    const params = cropId ? { cropId } : {};
    const response = await axiosInstance.get('api/v1/financial/crop-profitability', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching crop profitability:', error);
    throw error.response?.data || error;
  }
};

export const getLaborExpenses = async (cropId = null, period = 'this-month') => {
  //get labor expenses breakdown
  try {
    const params = { period };
    if (cropId) params.cropId = cropId;
    
    const response = await axiosInstance.get('api/v1/financial/labor-expenses', { params });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getMonthlyTrends = async (year = new Date().getFullYear()) => {
  //get monthly income/expense trends
  try {
    const response = await axiosInstance.get(`api/v1/financial/monthly-trends?year=${year}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTransactionCategories = async () => {
  //get available transaction categories
  try {
    const response = await axiosInstance.get('api/v1/financial/categories');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const exportFinancialData = async (format = 'csv', filters = {}) => {
  //export financial data
  try {
    const response = await axiosInstance.get('api/v1/financial/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const bulkRecordTransactions = async (transactions) => {
  //bulk record multiple transactions
  try {
    const response = await axiosInstance.post('/api/v1/transactions/bulk', { transactions });
    return response.data;
  } catch (error) {
    console.error('Bulk transaction service error:', error);
    throw error.response?.data || error;
  }
};

export const getYearlySummary = async (year = new Date().getFullYear()) => {
  //get yearly financial summary
  try {
    const response = await axiosInstance.get(`api/v1/financial/yearly-summary?year=${year}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getExpenseBreakdown = async (timeframe = 'this-month') => {
  //get expense breakdown by category
  try {
    const response = await axiosInstance.get('api/v1/financial/expense-breakdown', {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getIncomeSources = async (timeframe = 'this-month') => {
  //get income breakdown by source
  try {
    const response = await axiosInstance.get('api/v1/financial/income-sources', {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};