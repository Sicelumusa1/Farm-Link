const express = require('express');
const {
  recordTransaction,
  getFinancialSummary,
  getTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getCropProfitability,
  getExpenseBreakdown,
  getMonthlyTrends,
  getTransactionCategories
} = require('../controllers/financialController');
const { cookieJwtAuth } = require('../middleware/crackCookie');

const router = express.Router();

  // Transaction routes
  router.route('/transactions').post(cookieJwtAuth, recordTransaction);
  router.route('/transactions').get(cookieJwtAuth, getTransactions);
  router.route('/transactions/:id').get(cookieJwtAuth, getTransaction);
  router.route('/transactions/:id').put(cookieJwtAuth, updateTransaction);
  router.route('/transactions/:id').delete(cookieJwtAuth, deleteTransaction);

  // Financial summary and analytics routes
  router.route('/financial/summary').get(cookieJwtAuth, getFinancialSummary);
  router.route('/financial/crop-profitability').get(cookieJwtAuth, getCropProfitability);
  router.route('/financial/expense-breakdown').get(cookieJwtAuth, getExpenseBreakdown);
  router.route('/financial/monthly-trends').get(cookieJwtAuth, getMonthlyTrends);
  router.route('/financial/categories').get(cookieJwtAuth, getTransactionCategories);

module.exports = router;