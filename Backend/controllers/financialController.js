const FinancialTransaction = require('../models/financialModel');
const Crop = require('../models/cropModel');
const Farm = require('../models/farmModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

/**
 * Record a new financial transaction
 */
const recordTransaction = catchAsyncErrors(async (req, res, next) => {
  const { type, crop_id, category, amount, description, transaction_date } = req.body;
  const user_id = req.user.id;
  const created_by = user_id;

  // Validate required fields
  if (!type || !category || !amount || !description || !transaction_date) {
    return next(new ErrorHandler('Missing required fields: type, category, amount, description, transaction_date', 400));
  }

  if (!['income', 'expense'].includes(type)) {
    return next(new ErrorHandler('Type must be either "income" or "expense"', 400));
  }

  // Verify farm ownership via user_id
  const farm = await Farm.findByUserId(user_id);
  if (!farm) {
    return next(new ErrorHandler('Farm not found for this user', 404));
  }
  const farm_id = farm.ID;

  // If crop_id provided, ensure crop belongs to the user’s farm
  if (crop_id) {
    const crop = await Crop.findByIdWithUser(crop_id, user_id); // uses join to verify ownership
    if (!crop) {
      return next(new ErrorHandler('Crop not found or does not belong to your farm', 403));
    }
  }

  // Create transaction
  const transactionId = await FinancialTransaction.create({
    farm_id,
    type,
    crop_id,
    category,
    amount: parseFloat(amount),
    description,
    transaction_date,
    created_by,
  });

  const transaction = await FinancialTransaction.findById(transactionId);

  res.status(201).json({
    success: true,
    message: 'Transaction recorded successfully',
    data: transaction,
  });
});

/**
 * Get a specific transaction
 */
const getTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const transaction = await FinancialTransaction.findByIdWithUser(id, user_id);

  if (!transaction) {
    return next(new ErrorHandler('Transaction not found or does not belong to your farm', 403));
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

/**
 * Get all transactions for user's farm
 */
const getTransactions = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const filters = req.query;

  const farm = await Farm.findByUserId(user_id);
  if (!farm) {
    return next(new ErrorHandler('Farm not found', 404));
  }

  const transactions = await FinancialTransaction.findByFarmId(farm.ID, filters);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      count: transactions.length,
    },
  });
});

/**
 * Update transaction
 */
const updateTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  const user_id = req.user.id;

  const farm = await Farm.findByUserId(user_id);
  if (!farm) {
    return next(new ErrorHandler('Farm not found', 404));
  }

  // Verify transaction belongs to user
  const existingTransaction = await FinancialTransaction.findByIdWithUser(id, user_id);
  if (!existingTransaction) {
    return next(new ErrorHandler('Transaction not found or does not belong to your farm', 403));
  }

  // If updating crop_id, verify crop belongs to farm
  if (updateData.crop_id) {
    const crop = await Crop.findByIdWithUser(updateData.crop_id, user_id);
    if (!crop) {
      return next(new ErrorHandler('Crop not found or does not belong to your farm', 403));
    }
  }

  const updated = await FinancialTransaction.update(id, farm.ID, updateData);
  if (!updated) {
    return next(new ErrorHandler('Failed to update transaction', 500));
  }

  const transaction = await FinancialTransaction.findById(id);

  res.status(200).json({
    success: true,
    message: 'Transaction updated successfully',
    data: transaction,
  });
});

/**
 * Delete a transaction
 */
const deleteTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const transaction = await FinancialTransaction.findByIdWithUser(id, user_id);
  if (!transaction) {
    return next(new ErrorHandler('Transaction not found or does not belong to your farm', 403));
  }

  const deleted = await FinancialTransaction.delete(id, transaction.FARM_ID);

  if (!deleted) {
    return next(new ErrorHandler('Failed to delete transaction', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});

/**
 * Get financial summary for user's farm
 */
const getFinancialSummary = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { timeframe, cropId } = req.query;

  const farm = await Farm.findByUserId(user_id);
  if (!farm) return next(new ErrorHandler('Farm not found', 404));

  const summaryRows = await FinancialTransaction.getFinancialSummary(farm.ID, timeframe);

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
  };

  summaryRows.forEach(row => {
    if (row.TYPE === 'income') {
      summary.totalIncome = row.TOTAL || 0;
      summary.incomeCount = row.COUNT || 0;
    } else if (row.TYPE === 'expense') {
      summary.totalExpenses = row.TOTAL || 0;
      summary.expenseCount = row.COUNT || 0;
    }
    summary.transactionCount += row.COUNT || 0;
  });

  summary.netProfit = summary.totalIncome - summary.totalExpenses;
  summary.cropBreakdown = await FinancialTransaction.getCropProfitability(farm.ID, cropId);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * Get crop profitability
 */
const getCropProfitability = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { cropId } = req.query;

  const farm = await Farm.findByUserId(user_id);
  if (!farm) return next(new ErrorHandler('Farm not found', 404));

  const cropProfits = await FinancialTransaction.getCropProfitability(farm.ID, cropId);

  res.status(200).json({
    success: true,
    data: {
      cropProfits,
      count: cropProfits.length,
    },
  });
});

/**
 * Get expense breakdown
 */
const getExpenseBreakdown = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { timeframe } = req.query;

  const farm = await Farm.findByUserId(user_id);
  if (!farm) return next(new ErrorHandler('Farm not found', 404));

  const expenseBreakdown = await FinancialTransaction.getExpenseBreakdown(farm.ID, timeframe);

  res.status(200).json({
    success: true,
    data: {
      expenseBreakdown,
      count: expenseBreakdown.length,
    },
  });
});

/**
 * Get monthly trends
 */
const getMonthlyTrends = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { year } = req.query;

  const farm = await Farm.findByUserId(user_id);
  if (!farm) return next(new ErrorHandler('Farm not found', 404));

  const monthlyTrends = await FinancialTransaction.getMonthlyTrends(
    farm.ID,
    year || new Date().getFullYear()
  );

  res.status(200).json({
    success: true,
    data: {
      monthlyTrends,
      year: year || new Date().getFullYear(),
    },
  });
});

/**
 * Get transaction categories
 */
const getTransactionCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = FinancialTransaction.getTransactionCategories();
  res.status(200).json({
    success: true,
    data: categories,
  });
});

module.exports = {
  recordTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getCropProfitability,
  getExpenseBreakdown,
  getMonthlyTrends,
  getTransactionCategories,
};
