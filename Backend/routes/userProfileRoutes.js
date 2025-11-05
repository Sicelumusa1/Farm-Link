const express = require('express');
const {
  getUserProfile,
  updateUserPassword,
  updateUserData,
  deleteUser,
  getUsers,
  getUserDetails,
  adminDeleteUser
} = require('../controllers/userProfileController');
const {cookieJwtAuth, authorizedRoles } = require('../middleware/crackCookie');

const router = express.Router();

// User routes
router.route('/profile').get(cookieJwtAuth, getUserProfile);
router.route('/password/update').put(cookieJwtAuth, updateUserPassword);
router.route('/profile/update').put(cookieJwtAuth, updateUserData);
router.route('/profile/delete').delete(cookieJwtAuth, deleteUser);

// Admin routes
router.route('/admin/users').get(cookieJwtAuth, authorizedRoles('admin'), getUsers);
router.route('/admin/users/:userId').get(cookieJwtAuth, authorizedRoles('admin'), getUserDetails);
router.route('/admin/users/:userId').delete(cookieJwtAuth, authorizedRoles('admin'), adminDeleteUser);

module.exports = router;