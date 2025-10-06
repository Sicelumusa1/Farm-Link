const User = require('../models/userModel');
const Farm = require('../models/farmModel');
const Crop = require('../models/cropModel');
const Order = require('../models/orderModel');
const Delivery = require('../models/deliveryModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// Get details of the currently logged in user: /api/v1/profile
const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Update user password: /api/v1/password/update
const updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler('Please provide current and new password', 400));
  }

  const user = await User.findByIdWithPassword(req.user.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Check old user password 
  const isMatched = await User.comparePassword(currentPassword, user.password);
  if (!isMatched) {
    return next(new ErrorHandler('Current password is incorrect', 401));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    await connection.execute(
      `UPDATE users SET password = :password WHERE id = :id`,
      { password: hashedPassword, id: user.id }
    );
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    return next(new ErrorHandler('Password update failed', 500));
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Generate new token
  const token = User.generateJwtToken(user.id);
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    token
  });
});

// Update user data: /api/v1/profile/update
const updateUserData = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (name === undefined && email === undefined && phone === undefined) {
    return next(new ErrorHandler('Please provide data to update', 400));
  }

  const userId = req.user.id;
  
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    const fields = [];
    const binds = { id: userId };
    
    if (name !== undefined) {
      fields.push('name = :name');
      binds.name = name;
    }
    if (email !== undefined) {
      // Check if email already exists (excluding current user)
      const emailCheck = await connection.execute(
        `SELECT id FROM users WHERE email = :email AND id != :id`,
        { email, id: userId },
        { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (emailCheck.rows.length > 0) {
        return next(new ErrorHandler('Email already exists', 400));
      }
      
      fields.push('email = :email');
      binds.email = email;
    }
    if (phone !== undefined) {
      fields.push('phone = :phone');
      binds.phone = phone;
    }

    if (fields.length === 0) {
      return next(new ErrorHandler('No valid fields to update', 400));
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = :id`;
    
    await connection.execute(query, binds);
    await connection.commit();
    
    // Get updated user data
    const updatedUser = await User.findById(userId);
    
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    return next(new ErrorHandler('Profile update failed', 500));
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Delete current user: /api/v1/profile/delete
const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // First, check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Delete user's farm and related data if exists
  const farm = await Farm.findByUserId(userId);
  if (farm) {
    // Delete crops associated with the farm
    let connection;
    try {
      connection = await require('../config/db').oracledb.getConnection();
      
      // Delete deliveries for crops in this farm
      await connection.execute(
        `DELETE FROM deliveries WHERE crop_id IN (SELECT id FROM crops WHERE farm_id = :farm_id)`,
        { farm_id: farm.ID }
      );
      
      // Delete orders for crops in this farm
      await connection.execute(
        `DELETE FROM orders WHERE crop_id IN (SELECT id FROM crops WHERE farm_id = :farm_id)`,
        { farm_id: farm.ID }
      );
      
      // Delete crops
      await connection.execute(
        `DELETE FROM crops WHERE farm_id = :farm_id`,
        { farm_id: farm.ID }
      );
      
      // Delete farm
      await connection.execute(
        `DELETE FROM farms WHERE id = :farm_id`,
        { farm_id: farm.ID }
      );
      
      await connection.commit();
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error deleting farm data:', error);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // Delete user
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    await connection.execute(
      `DELETE FROM users WHERE id = :id`,
      { id: userId }
    );
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    return next(new ErrorHandler('User deletion failed', 500));
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Clear cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// Admin only methods

// Show all users : /api/v1/users
const getUsers = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is admin
  const currentUser = await User.findById(userId);
  if (!currentUser || currentUser.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  // Basic filtering and pagination (simplified version)
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    // Get total count
    const countResult = await connection.execute(
      `SELECT COUNT(*) as total FROM users WHERE role != 'admin'`,
      {},
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );
    
    const total = countResult.rows[0].TOTAL;

    // Get users with farm info
    const usersResult = await connection.execute(
      `SELECT u.*, 
              f.name as farm_name,
              f.id as farm_id,
              (SELECT COUNT(*) FROM crops c WHERE c.farm_id = f.id) as crop_count
       FROM users u
       LEFT JOIN farms f ON u.id = f.user_id
       WHERE u.role != 'admin'
       ORDER BY u.created_at DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset: parseInt(offset), limit: parseInt(limit) },
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );

    const users = usersResult.rows;

    res.status(200).json({
      success: true,
      results: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Show details of the selected user
const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;

  // Check if current user is admin
  const currentUser = await User.findById(currentUserId);
  if (!currentUser || currentUser.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  // Find the user by ID
  const user = await User.findById(parseInt(userId));
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Get user's farm details
  const farm = await Farm.findByUserId(parseInt(userId));
  
  // Get user's crops if they have a farm
  let crops = [];
  if (farm) {
    crops = await Crop.findByFarmId(farm.ID);
  }

  // Get user's orders
  const orders = await Order.findByFarmerId(parseInt(userId));

  // Get user's deliveries
  const deliveries = await Delivery.findByUserId(parseInt(userId));

  const userDetails = {
    ...user,
    FARM: farm || null,
    CROPS: crops,
    ORDERS: orders,
    DELIVERIES: deliveries
  };

  res.status(200).json({
    success: true,
    data: userDetails
  });
});

// Deletes user, farm and associated crops
const adminDeleteUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;
  const adminId = req.user.id;

  // Check if current user is admin
  const currentUser = await User.findById(adminId);
  if (!currentUser || currentUser.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  // Prevent admin from deleting themselves
  if (parseInt(userId) === adminId) {
    return next(new ErrorHandler('Cannot delete your own account', 400));
  }

  const user = await User.findById(parseInt(userId));
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Delete user's farm and related data if exists
  const farm = await Farm.findByUserId(parseInt(userId));
  if (farm) {
    let connection;
    try {
      connection = await require('../config/db').oracledb.getConnection();
      
      // Delete deliveries for crops in this farm
      await connection.execute(
        `DELETE FROM deliveries WHERE crop_id IN (SELECT id FROM crops WHERE farm_id = :farm_id)`,
        { farm_id: farm.ID }
      );
      
      // Delete orders for crops in this farm
      await connection.execute(
        `DELETE FROM orders WHERE crop_id IN (SELECT id FROM crops WHERE farm_id = :farm_id)`,
        { farm_id: farm.ID }
      );
      
      // Delete crops
      await connection.execute(
        `DELETE FROM crops WHERE farm_id = :farm_id`,
        { farm_id: farm.ID }
      );
      
      // Delete farm
      await connection.execute(
        `DELETE FROM farms WHERE id = :farm_id`,
        { farm_id: farm.ID }
      );
      
      await connection.commit();
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error deleting farm data:', error);
      return next(new ErrorHandler('Error deleting farm data', 500));
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // Delete user
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    await connection.execute(
      `DELETE FROM users WHERE id = :id`,
      { id: parseInt(userId) }
    );
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    return next(new ErrorHandler('User deletion failed', 500));
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'User, farm, and crops were successfully deleted'
  });
});

module.exports = {
  getUserProfile,
  updateUserPassword,
  updateUserData,
  deleteUser,
  getUsers,
  getUserDetails,
  adminDeleteUser
};