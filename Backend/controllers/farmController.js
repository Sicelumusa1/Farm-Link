const Farm = require('../models/farmModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

const createFarm = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { 
    name, 
    municipality, 
    ward, 
    latitude, 
    longitude, 
    city, 
    farm_size 
  } = req.body;

  // Validate required fields
  if (!name || !name.trim()) {
    return next(new ErrorHandler('Farm name is required', 400));
  }
  
  if (!municipality || !municipality.trim()) {
    return next(new ErrorHandler('Municipality is required', 400));
  }
  
  if (!ward || !ward.trim()) {
    return next(new ErrorHandler('Ward is required', 400));
  }
  
  if (!city || !city.trim()) {
    return next(new ErrorHandler('City is required', 400));
  }
  
  if (!farm_size || parseFloat(farm_size) <= 0) {
    return next(new ErrorHandler('Valid farm size is required', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler('User not found!', 404));
  }

  // Check if user already has a farm
  const hasFarm = await Farm.userHasFarm(userId);
  if (hasFarm) {
    return next(new ErrorHandler('User already has a farm!', 400));
  }

  // Create the farm
  const farmId = await Farm.create({
    user_id: userId,
    name: name.trim(),
    municipality: municipality.trim(),
    ward: ward.trim(),
    latitude,
    longitude,
    city: city.trim(),
    farm_size: parseFloat(farm_size)
  });

  // Update user's farm details status
  await User.updateHasProvidedFarmDetails(userId, true);

  // Get the created farm details
  const farm = await Farm.findByUserId(userId);

  res.status(201).json({
    success: true,
    data: farm,
    message: 'Farm created successfully'
  });
});

// Update farm details
const updateFarm = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { 
    name, 
    municipality, 
    ward, 
    latitude, 
    longitude, 
    city, 
    farm_size 
  } = req.body;

  // Find user's farm
  const farm = await Farm.findByUserId(userId);
  if (!farm) {
    return next(new ErrorHandler('Farm not found', 404));
  }

  // Update farm details
  await Farm.update(farm.ID, {
    name,
    municipality,
    ward,
    latitude,
    longitude,
    city,
    farm_size
  });

  // Update user's farm details status
  await User.updateHasProvidedFarmDetails(userId, true);

  // Get updated farm details
  const updatedFarm = await Farm.findByUserId(userId);

  res.status(200).json({
    success: true,
    data: updatedFarm,
    message: 'Farm details updated successfully'
  });
});

// Get user's farm with crops and orders
const getUserFarmAndCrops = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const farmWithCrops = await Farm.getFarmWithCropsAndOrders(userId);
  if (!farmWithCrops) {
    return next(new ErrorHandler('Farm not found', 404));
  }

  res.status(200).json({
    success: true,
    data: farmWithCrops
  });
});

module.exports = {
  createFarm,
  updateFarm,
  getUserFarmAndCrops,
};