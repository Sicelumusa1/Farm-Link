const express = require('express');
const {
  createCrop,
  getUserCrops,
  getCrop,
  updateCrop,
  deleteCrop,
  updateCropGrowthStage,
  getAllCrops,
  uploadCropImage,
  getCropImages,
  deleteCropImage,
  getRecommendedUnits,
  getUnitConversions,
  convertCropUnit,
  getAvailableCrops,
  getCropsByFarm,
  searchCrops
} = require('../controllers/cropController');
const upload = require('../middleware/uploadMiddleware');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// Basic CRUD operations
router.route('/crops').post(cookieJwtAuth, createCrop);
router.route('/crops').get(cookieJwtAuth, getUserCrops);
router.route('/crops/all').get(cookieJwtAuth, authorizedRoles, getAllCrops); // Admin only
router.route('/crops/:id').get(cookieJwtAuth, getCrop);
router.route('/crops/:id').put(cookieJwtAuth, updateCrop);
router.route('/crops/:id').delete(cookieJwtAuth, deleteCrop);

// Growth stage operations
router.route('/crops/:id/growth-stage').patch(cookieJwtAuth, updateCropGrowthStage);

// Image operations
router.route('/crops/:id/images').post(cookieJwtAuth, upload.single('image'), uploadCropImage);
router.route('/crops/:id/images').get(cookieJwtAuth, getCropImages);
router.route('/crops/:id/images/:imageId').delete(cookieJwtAuth, deleteCropImage);

// Unit operations
router.route('/crops/units/recommended').get(cookieJwtAuth, getRecommendedUnits);
router.route('/crops/units/conversions').get(cookieJwtAuth, getUnitConversions);
router.route('/crops/:id/convert-unit').post(cookieJwtAuth, convertCropUnit);

// Query operations
router.route('/crops/available').get(cookieJwtAuth, getAvailableCrops);
router.route('/crops/farm/:farmId').get(cookieJwtAuth, getCropsByFarm);
router.route('/crops/search').get(cookieJwtAuth, searchCrops);

module.exports = router;