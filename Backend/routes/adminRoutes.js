const express = require('express');
const {
  setAdminMunicipality,
  checkAdminLocation,
  getAdminLocation
} = require('../controllers/adminController');
const { cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Admin location routes
router.route('/admin/location')
  .post(cookieJwtAuth, authorizedRoles('admin'), setAdminMunicipality)
  .get(cookieJwtAuth, authorizedRoles('admin'), getAdminLocation);

router.route('/admin/check-location')
  .get(cookieJwtAuth, authorizedRoles('admin'), checkAdminLocation);

module.exports = router;