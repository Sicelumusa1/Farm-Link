const express = require('express');
const {
  createOrder,
  getOrder,
  getOrders,
  getFarmerOrders,
  updateOrder,
  deleteOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Admin routes
router.post('/orders', cookieJwtAuth, authorizedRoles, createOrder);
router.get('/orders/admin', cookieJwtAuth, authorizedRoles, getOrders);
router.put('/orders/:id', cookieJwtAuth, authorizedRoles, updateOrder);
router.delete('/orders/:id', cookieJwtAuth, authorizedRoles, deleteOrder);
router.patch('/orders/:orderId/status', cookieJwtAuth, authorizedRoles, updateOrderStatus);

// Farmer routes
router.get('/orders', cookieJwtAuth, getFarmerOrders);
router.get('/orders/:id', cookieJwtAuth, getOrder);

module.exports = router;