const express = require('express');
const {
  createAutoOrder,
  getCropAvailabilityReport,
  getCropAvailabilityDetails
} = require('../controllers/autoOrderController');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Admin routes for auto ordering
router.post('/auto-orders', cookieJwtAuth, authorizedRoles, createAutoOrder);
router.get('/crops/availability-report', cookieJwtAuth, authorizedRoles, getCropAvailabilityReport);
router.get('/crops/:cropName/availability-details', cookieJwtAuth, authorizedRoles, getCropAvailabilityDetails);

module.exports = router;