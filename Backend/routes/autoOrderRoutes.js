const express = require('express');
const {
  createAutoOrder,
  getCropAvailabilityReport,
  getCropAvailabilityDetails,
  getAvailableCrops
} = require('../controllers/autoOrderController');
const { cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Admin routes for auto ordering
router.route('/create').post(cookieJwtAuth, authorizedRoles('admin'), createAutoOrder);
router.route('/availability-report').get(cookieJwtAuth, authorizedRoles('admin'), getCropAvailabilityReport);
router.route('/availability-details/:cropName').get(cookieJwtAuth, authorizedRoles('admin'), getCropAvailabilityDetails); // Fixed parameter order
router.route('/available-crops').get(cookieJwtAuth, authorizedRoles('admin'), getAvailableCrops);

module.exports = router;