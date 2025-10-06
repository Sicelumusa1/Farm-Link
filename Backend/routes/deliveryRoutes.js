const express = require('express');
const {
  createDelivery,
  getDelivery,
  getDeliveries,
  getAllDeliveries,
  getDeliveriesByCrop,
  updateDelivery,
  deleteDelivery
} = require('../controllers/deliveryController');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// User routes
router.post('/deliveries', cookieJwtAuth, createDelivery);
router.get('/deliveries', cookieJwtAuth, getDeliveries);
router.get('/deliveries/:id', cookieJwtAuth, getDelivery);
router.put('/deliveries/:id', cookieJwtAuth, updateDelivery);
router.delete('/deliveries/:id', cookieJwtAuth, deleteDelivery);

// Admin routes
router.get('/admin/deliveries', cookieJwtAuth, authorizedRoles, getAllDeliveries);

// Crop-related deliveries
router.get('/crops/:cropId/deliveries', cookieJwtAuth, getDeliveriesByCrop);

module.exports = router;