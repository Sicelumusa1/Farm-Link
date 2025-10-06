const Order = require('../models/orderModel');
const Crop = require('../models/cropModel');
const User = require('../models/userModel');
const Farm = require('../models/farmModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Calculating the total availability of a specific crop among all farmers
const calculateTotalAvailability = async (cropName) => {
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT SUM(c.produce_yield) as total_availability
       FROM crops c
       JOIN farms f ON c.farm_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE c.crop_name = :crop_name 
         AND u.role = 'user'
         AND c.produce_yield > 0`,
      { crop_name: cropName },
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );
    
    return result.rows[0]?.TOTAL_AVAILABILITY || 0;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Get farmers with specific crop, sorted by last visited date
const getFarmersWithCrop = async (cropName) => {
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT 
          u.id as user_id,
          u.name as user_name,
          u.last_visited,
          f.id as farm_id,
          f.name as farm_name,
          c.id as crop_id,
          c.crop_name,
          c.produce_yield as availability
       FROM users u
       JOIN farms f ON u.id = f.user_id
       JOIN crops c ON f.id = c.farm_id
       WHERE c.crop_name = :crop_name 
         AND u.role = 'user'
         AND c.produce_yield > 0
       ORDER BY u.last_visited ASC NULLS FIRST`,
      { crop_name: cropName },
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );
    
    return result.rows;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Update crop availability
const updateCropAvailability = async (cropId, newAvailability) => {
  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    await connection.execute(
      `UPDATE crops SET produce_yield = :availability WHERE id = :crop_id`,
      { availability: newAvailability, crop_id: cropId }
    );
    
    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Update user last visited date - USING YOUR VERSION
const updateUserLastVisited = async (userId) => {
  try {
    await User.updateLastVisited(userId, new Date());
    return true;
  } catch (error) {
    console.error('Error updating last visited:', error);
    return false;
  }
};

const createAutoOrder = catchAsyncErrors(async (req, res, next) => {
  const adminId = req.user.id;
  const { crops } = req.body;

  // Validate input
  if (!crops || !Array.isArray(crops) || crops.length === 0) {
    return next(new ErrorHandler('Please provide an array of crops with quantities', 400));
  }

  // Check if user is admin
  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.ROLE !== 'admin') {
    return next(new ErrorHandler('Only admins can create auto orders', 403));
  }

  let orders = [];
  let unfulfilled = [];

  // Process each crop in the request
  for (const { crop: cropName, quantity } of crops) {
    if (!cropName || !quantity || quantity <= 0) {
      unfulfilled.push({ 
        crop: cropName, 
        shortfall: quantity,
        reason: 'Invalid crop name or quantity' 
      });
      continue;
    }

    // Calculate total availability for this crop
    const totalAvailability = await calculateTotalAvailability(cropName);
    
    if (totalAvailability < quantity) {
      unfulfilled.push({ 
        crop: cropName, 
        shortfall: quantity - totalAvailability,
        total_available: totalAvailability
      });
      continue;
    }

    // Get farmers with this crop, sorted by last visited (least recently visited first)
    const farmersWithCrop = await getFarmersWithCrop(cropName);
    
    let remainingQuantity = quantity;
    const cropOrders = [];

    // Distribute the order quantity among farmers
    for (let farmer of farmersWithCrop) {
      if (remainingQuantity <= 0) break;

      const availableQuantity = farmer.AVAILABILITY;
      if (availableQuantity <= 0) continue;

      const assignedQuantity = Math.min(remainingQuantity, availableQuantity);
      const newAvailability = availableQuantity - assignedQuantity;
      remainingQuantity -= assignedQuantity;

      try {
        // Update crop availability
        await updateCropAvailability(farmer.CROP_ID, newAvailability);

        // Update user's last visited date - USING YOUR VERSION
        await updateUserLastVisited(farmer.USER_ID);

        // Create the order
        const orderId = await Order.create({
          admin_id: adminId,
          crop_id: farmer.CROP_ID,
          quantity: assignedQuantity,
          status: 'pending'
        });

        // Get the full order details
        const newOrder = await Order.findById(orderId);
        cropOrders.push(newOrder);

      } catch (error) {
        console.error(`Error processing order for farmer ${farmer.USER_ID}:`, error);
        // If there's an error with one farmer, add the quantity back to unfulfilled
        remainingQuantity += assignedQuantity;
        continue;
      }

      if (remainingQuantity <= 0) break;
    }

    // If we still have remaining quantity due to errors, add to unfulfilled
    if (remainingQuantity > 0) {
      unfulfilled.push({ 
        crop: cropName, 
        shortfall: remainingQuantity,
        reason: 'Distribution error' 
      });
    }

    orders = orders.concat(cropOrders);
  }

  res.status(201).json({
    success: true,
    message: 'Auto order processing completed',
    data: {
      orders_created: orders.length,
      orders: orders,
      unfulfilled_requests: unfulfilled.length > 0 ? unfulfilled : null
    }
  });
});

// Get crop availability report
const getCropAvailabilityReport = catchAsyncErrors(async (req, res, next) => {
  const adminId = req.user.id;

  // Check if user is admin
  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.ROLE !== 'admin') {
    return next(new ErrorHandler('Only admins can view crop availability reports', 403));
  }

  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT 
          c.crop_name,
          SUM(c.produce_yield) as total_availability,
          COUNT(DISTINCT f.id) as number_of_farms,
          COUNT(DISTINCT u.id) as number_of_farmers,
          MIN(u.last_visited) as oldest_visit,
          MAX(u.last_visited) as newest_visit
       FROM crops c
       JOIN farms f ON c.farm_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE u.role = 'user'
         AND c.produce_yield > 0
       GROUP BY c.crop_name
       ORDER BY total_availability DESC`,
      {},
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: {
        report_date: new Date(),
        total_crops: result.rows.length,
        crops: result.rows
      }
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

// Get detailed availability for a specific crop
const getCropAvailabilityDetails = catchAsyncErrors(async (req, res, next) => {
  const adminId = req.user.id;
  const cropName = req.params.cropName;

  // Check if user is admin
  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.ROLE !== 'admin') {
    return next(new ErrorHandler('Only admins can view crop availability details', 403));
  }

  const farmersWithCrop = await getFarmersWithCrop(cropName);
  const totalAvailability = await calculateTotalAvailability(cropName);

  res.status(200).json({
    success: true,
    data: {
      crop_name: cropName,
      total_availability: totalAvailability,
      number_of_farmers: farmersWithCrop.length,
      farmers: farmersWithCrop.map(farmer => ({
        farmer_id: farmer.USER_ID,
        farmer_name: farmer.USER_NAME,
        farm_name: farmer.FARM_NAME,
        availability: farmer.AVAILABILITY,
        last_visited: farmer.LAST_VISITED
      }))
    }
  });
});

module.exports = {
  createAutoOrder,
  getCropAvailabilityReport,
  getCropAvailabilityDetails
};