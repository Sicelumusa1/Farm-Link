const express = require('express');
const {
  createCrop,
  getUserCrops,
  getCrop,
  updateCrop,
  deleteCrop,
  updateCropGrowthStage,
  getAllCrops,
  uploadCropImage
} = require('../controllers/cropController');
const upload = require('../middleware/uploadMiddleware');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

router.post('/crops', cookieJwtAuth, createCrop);
router.get('/crops', cookieJwtAuth, getUserCrops);
router.get('/crops/all', cookieJwtAuth, authorizedRoles, getAllCrops); // Admin only
router.get('/crops/:id', cookieJwtAuth, getCrop);
router.put('/crops/:id', cookieJwtAuth, updateCrop);
router.delete('/crops/:id', cookieJwtAuth, deleteCrop);
router.patch('/crops/:id/growth-stage', cookieJwtAuth, updateCropGrowthStage);
router.post('/crops/:id/image', cookieJwtAuth, upload.single('image'), uploadCropImage);

module.exports = router;