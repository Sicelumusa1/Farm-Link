const express = require('express');
const {
  createOrder,
  getOrder,
  getOrders,
  getFarmerOrders,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  acknowledgeOrder
} = require('../controllers/orderController');
const { cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Admin routes
router.route('/orders').post(cookieJwtAuth, authorizedRoles('admin'), createOrder);
router.route('/orders/admin').get(cookieJwtAuth, authorizedRoles('admin'), getOrders);
router.route('/orders/:id').put(cookieJwtAuth, authorizedRoles('admin'), updateOrder);
router.route('/orders/:id').delete(cookieJwtAuth, authorizedRoles('admin'), deleteOrder);

// Farmer order management routes
router.route('/orders').get(cookieJwtAuth, getFarmerOrders);
router.route('/orders/:id').get(cookieJwtAuth, getOrder);
router.route('/orders/:orderId/status').patch(cookieJwtAuth, updateOrderStatus);
router.route('/orders/:orderId/acknowledge').patch(cookieJwtAuth, acknowledgeOrder);

module.exports = router;