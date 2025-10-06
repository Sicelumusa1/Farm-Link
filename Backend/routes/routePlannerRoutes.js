const express = require('express');
const {
  getPlan,
  getUserFarmsRoute,
  getFarmsWithPendingOrdersRoute
} = require('../controllers/routePlannerController');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Basic route planning (accessible to authenticated users)
router.post('/routes/plan', cookieJwtAuth, getPlan);

// Admin-only route planning features
router.route('/admin/routes/user-farms').post(cookieJwtAuth, authorizedRoles, getUserFarmsRoute);
router.route('/admin/routes/pending-orders').get(cookieJwtAuth, authorizedRoles, getFarmsWithPendingOrdersRoute);

module.exports = router;