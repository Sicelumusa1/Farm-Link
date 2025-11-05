const Order = require('../models/orderModel');
const Crop = require('../models/cropModel');
const User = require('../models/userModel');
const Farm = require('../models/farmModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { oracledb } = require('../config/db');

// Calculating the total availability of a specific crop among all farmers
const calculateTotalAvailability = async (cropName) => {
  let connection;
  try {
    connection = await oracledb.getConnection("default");

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
    connection = await oracledb.getConnection("default");

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
    connection = await oracledb.getConnection("default");

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

// Update user last visited date
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

  if (!crops || !Array.isArray(crops) || crops.length === 0) {
    return next(new ErrorHandler('Please provide a list of crops with quantities', 400));
  }

  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.role !== 'admin') {
    return next(new ErrorHandler('Only admins can create auto orders', 403));
  }

  let connection;
  let orders = [];
  let unfulfilled = [];

  try {
    connection = await oracledb.getConnection('default');
    await connection.execute('BEGIN NULL; END;'); // ensure session valid
    await connection.execute('SAVEPOINT batch_start');

    for (const cropOrder of crops) {
      const { crop: cropName, quantity, unit = 'kg' } = cropOrder;
      const unitDisplay = Crop.getUnitDisplayName(unit);
      const quantityInKg = Crop.convertToKg(quantity, unit);

      const farmers = await connection.execute(
        `
        SELECT u.id as USER_ID, u.name as USER_NAME, c.id as CROP_ID, c.produce_yield as AVAILABILITY
        FROM crops c
        JOIN farms f ON c.farm_id = f.id
        JOIN users u ON f.user_id = u.id
        WHERE c.crop_name = :crop_name AND u.role = 'user' AND c.produce_yield > 0
        ORDER BY u.last_visited ASC NULLS FIRST
      `,
        { crop_name: cropName },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const farmerList = farmers.rows;
      if (farmerList.length === 0) {
        unfulfilled.push({ crop: cropName, reason: 'No farmers found' });
        continue;
      }

      let remaining = quantityInKg;

      for (const farmer of farmerList) {
        if (remaining <= 0) break;

        const assignable = Math.min(farmer.AVAILABILITY, remaining);
        const newAvailability = farmer.AVAILABILITY - assignable;

        await connection.execute(
          `UPDATE crops SET produce_yield = :newAvail WHERE id = :cropId`,
          { newAvail: newAvailability, cropId: farmer.CROP_ID },
          { autoCommit: false }
        );

        const newOrder = await Order.create(
          {
            admin_id: adminId,
            crop_id: farmer.CROP_ID,
            user_id: farmer.USER_ID,
            quantity: assignable,
            original_quantity: Crop.convertFromKg(assignable, unit),
            original_unit: unit,
            original_unit_display: unitDisplay,
            status: 'pending',
          },
          connection
        );

        orders.push(newOrder);
        remaining -= assignable;
      }

      if (remaining > 0) {
        unfulfilled.push({
          crop: cropName,
          shortfall: Crop.convertFromKg(remaining, unit),
          unit_display: unitDisplay,
          reason: 'Partial fulfillment',
        });
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Auto order batch processed successfully',
      data: {
        orders_created: orders.length,
        unfulfilled_requests: unfulfilled.length > 0 ? unfulfilled : null,
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('AutoOrder transaction failed:', error);
    return next(new ErrorHandler(`Transaction failed: ${error.message}`, 500));
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// Get crop availability report
const getCropAvailabilityReport = catchAsyncErrors(async (req, res, next) => {
  const adminId = req.user.id;

  // Check if user is admin
  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.role !== 'admin') {
    return next(new ErrorHandler('Only admins can view crop availability reports', 403));
  }

  let connection;
  try {
    connection = await oracledb.getConnection("default");

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
  if (!adminUser || adminUser.role !== 'admin') {
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

// Get available crops with their units and quantities
const getAvailableCrops = catchAsyncErrors(async (req, res, next) => {
  const adminId = req.user.id;

  // Check if user is admin
  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.role !== 'admin') {
    return next(new ErrorHandler('Only admins can view available crops', 403));
  }

  let connection;
  try {
    connection = await oracledb.getConnection("default");

    const result = await connection.execute(
      `SELECT DISTINCT 
              c.crop_name,
              c.unit_of_measure,
              c.unit_conversion_factor,
              SUM(c.produce_yield) as total_availability,
              COUNT(DISTINCT f.id) as farm_count,
              COUNT(DISTINCT u.id) as farmer_count
       FROM crops c
       JOIN farms f ON c.farm_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE u.role = 'user'
         AND c.produce_yield > 0
       GROUP BY c.crop_name, c.unit_of_measure, c.unit_conversion_factor
       ORDER BY c.crop_name`,
      {},
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );

    // Format the response with unit information
    const availableCrops = result.rows.map(row => ({
      crop_name: row.CROP_NAME,
      unit_of_measure: row.UNIT_OF_MEASURE || 'kg',
      unit_conversion_factor: row.UNIT_CONVERSION_FACTOR || 1,
      total_availability: row.TOTAL_AVAILABILITY,
      farm_count: row.FARM_COUNT,
      farmer_count: row.FARMER_COUNT,
      available_units: Crop.getRecommendedUnits(row.CROP_NAME)
    }));

    res.status(200).json({
      success: true,
      data: {
        available_crops: availableCrops,
        total_crops: availableCrops.length
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

module.exports = {
  createAutoOrder,
  getCropAvailabilityReport,
  getCropAvailabilityDetails,
  getAvailableCrops
};