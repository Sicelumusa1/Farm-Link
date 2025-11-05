const User = require('../models/userModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');


const setAdminMunicipality = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { municipality, city } = req.body;

  console.log('=== SETTING ADMIN LOCATION ===');
  console.log('Admin user ID:', userId);
  console.log('Location data:', { municipality, city });

  if (!municipality || !city) {
    return next(new ErrorHandler('Municipality and city are required', 400));
  }

  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    // First, check current state
    const beforeCheck = await connection.execute(
      `SELECT admin_municipality, admin_city FROM users WHERE id = :id`,
      { id: userId },
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('BEFORE update - admin_municipality:', beforeCheck.rows[0]?.ADMIN_MUNICIPALITY);
    console.log('BEFORE update - admin_city:', beforeCheck.rows[0]?.ADMIN_CITY);

    // Update the admin location
    const result = await connection.execute(
      `UPDATE users SET admin_municipality = :municipality, admin_city = :city WHERE id = :id`,
      {
        municipality: municipality,
        city: city,
        id: userId
      }
    );
    
    await connection.commit();

    console.log('Update result - rows affected:', result.rowsAffected);

    // Verify the update
    const afterCheck = await connection.execute(
      `SELECT admin_municipality, admin_city FROM users WHERE id = :id`,
      { id: userId },
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('AFTER update - admin_municipality:', afterCheck.rows[0]?.ADMIN_MUNICIPALITY);
    console.log('AFTER update - admin_city:', afterCheck.rows[0]?.ADMIN_CITY);

    res.status(200).json({
      success: true,
      message: 'Admin location set successfully',
      data: { 
        municipality, 
        city,
        before: {
          admin_municipality: beforeCheck.rows[0]?.ADMIN_MUNICIPALITY,
          admin_city: beforeCheck.rows[0]?.ADMIN_CITY
        },
        after: {
          admin_municipality: afterCheck.rows[0]?.ADMIN_MUNICIPALITY,
          admin_city: afterCheck.rows[0]?.ADMIN_CITY
        }
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error setting admin location:', error);
    return next(new ErrorHandler('Failed to set admin location: ' + error.message, 500));
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

// Check if admin has set location
const checkAdminLocation = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const hasLocation = !!(user.admin_municipality && user.admin_city);

  res.status(200).json({
    success: true,
    hasLocation,
    location: hasLocation ? {
      municipality: user.admin_municipality,
      city: user.admin_city
    } : null
  });
});

// Get admin location
const getAdminLocation = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (!user.admin_municipality || !user.admin_city) {
    return next(new ErrorHandler('Admin location not set', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      municipality: user.admin_municipality,
      city: user.admin_city
    }
  });
});

module.exports = {
  setAdminMunicipality,
  checkAdminLocation,
  getAdminLocation
};