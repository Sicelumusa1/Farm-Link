// Map URL endpoints to controller functions
const express = require('express');
const router = express.Router();
const { cookieJwtAuth } = require('../middleware/crackCookie');
const upload = require('../middleware/uploadMiddleware');
// // Import crop controller methods
const { addCrop, updateCrop, getCrops } = require('../controllers/cropController');

router.use(cookieJwtAuth);

router.route('/profile/farm/crops').post(addCrop);
router.route('/profile/farm/crops').get(getCrops);
router.route('/profile/farm/crops/:cropId').put(updateCrop);

module.exports = router;