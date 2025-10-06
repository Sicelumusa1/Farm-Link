
const express = require('express');
const router = express.Router();
const { cookieJwtAuth } = require('../middleware/crackCookie');

// // Import farm controller methods
const { createFarm, updateFarm, getUserFarmAndCrops } = require('../controllers/farmController');

router.use(cookieJwtAuth);

router.route('/profile/farm')
    .post(createFarm)
    .put(updateFarm)
    .get(getUserFarmAndCrops);

module.exports = router;