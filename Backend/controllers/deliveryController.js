

const Delivery = require('../models/deliveryModel');
const Crop = require('../models/cropModel');
const Farm = require('../models/farmModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create a new delivery
const createDelivery = catchAsyncErrors(async (req, res, next) => {
  const { name, crop_id, address, date } = req.body;
  const user_id = req.user.id;

  // Validate required fields
  if (!name || !crop_id || !address || !date) {
    return next(new ErrorHandler('Please fill in all the required fields', 400));
  }

  // Check if crop exists
  const crop = await Crop.findById(parseInt(crop_id));
  if (!crop) {
    return next(new ErrorHandler('Crop not found!', 404));
  }

  const farm = await Farm.findByUserId(user_id);
  if (!farm || farm.ID !== crop.FARM_ID) {
    // return next(new ErrorHandler('Access denied to this crop', 403));
  }

  // Create the delivery
  const deliveryId = await Delivery.create({
    user_id: user_id,
    name,
    crop_id: parseInt(crop_id),
    address,
    date
  });

  // Get the created delivery details
  const delivery = await Delivery.findById(deliveryId);

  res.status(201).json({
    success: true,
    data: delivery,
    message: 'Delivery created successfully'
  });
});

// GET single delivery details
const getDelivery = catchAsyncErrors(async (req, res, next) => {
  const deliveryId = req.params.id;
  const userId = req.user.id;

  const delivery = await Delivery.findById(parseInt(deliveryId));
  if (!delivery) {
    return next(new ErrorHandler('Delivery not found!', 404));
  }

  // Authorization check - user must be either the delivery creator or an admin
  const user = await User.findById(userId);
  if (user.ROLE !== 'admin' && delivery.USER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this delivery', 403));
  }

  res.status(200).json({
    success: true,
    data: delivery
  });
});

// GET all deliveries for the logged in user
const getDeliveries = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const deliveries = await Delivery.findByUserId(userId);

  res.status(200).json({
    success: true,
    data: deliveries,
    count: deliveries.length
  });
});

// GET all deliveries (for admin)
const getAllDeliveries = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is admin
  const user = await User.findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  const deliveries = await Delivery.getAllDeliveries();

  res.status(200).json({
    success: true,
    data: deliveries,
    count: deliveries.length
  });
});

// GET deliveries by crop ID
const getDeliveriesByCrop = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.cropId;
  const userId = req.user.id;

  // Check if crop exists and user has access
  const crop = await Crop.findById(parseInt(cropId));
  if (!crop) {
    return next(new ErrorHandler('Crop not found!', 404));
  }

  // Verify user has access to this crop (farm owner or admin)
  const user = await User.findById(userId);
  const farm = await Farm.findByUserId(userId);
  
  if (user.ROLE !== 'admin' && (!farm || farm.ID !== crop.FARM_ID)) {
    return next(new ErrorHandler('Access denied to this crop', 403));
  }

  const deliveries = await Delivery.findByCropId(parseInt(cropId));

  res.status(200).json({
    success: true,
    data: deliveries,
    count: deliveries.length
  });
});

// Update a delivery
const updateDelivery = catchAsyncErrors(async (req, res, next) => {
  const deliveryId = req.params.id;
  const userId = req.user.id;
  const { name, crop_id, address, date } = req.body;

  // Check if delivery exists
  const existingDelivery = await Delivery.findById(parseInt(deliveryId));
  if (!existingDelivery) {
    return next(new ErrorHandler('Delivery not found!', 404));
  }

  // Authorization check - user must be the delivery creator or an admin
  const user = await User.findById(userId);
  if (user.ROLE !== 'admin' && existingDelivery.USER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this delivery', 403));
  }

  // If crop_id is being updated, verify the new crop exists
  if (crop_id) {
    const crop = await Crop.findById(parseInt(crop_id));
    if (!crop) {
      return next(new ErrorHandler('Crop not found!', 404));
    }
  }

  // Update the delivery
  await Delivery.update(parseInt(deliveryId), {
    name,
    crop_id: crop_id ? parseInt(crop_id) : undefined,
    address,
    date
  });

  // Get updated delivery details
  const updatedDelivery = await Delivery.findById(parseInt(deliveryId));

  res.status(200).json({
    success: true,
    data: updatedDelivery,
    message: 'Delivery updated successfully'
  });
});

// Delete a delivery
const deleteDelivery = catchAsyncErrors(async (req, res, next) => {
  const deliveryId = req.params.id;
  const userId = req.user.id;

  // Check if delivery exists
  const existingDelivery = await Delivery.findById(parseInt(deliveryId));
  if (!existingDelivery) {
    return next(new ErrorHandler('Delivery not found!', 404));
  }

  // Authorization check - user must be the delivery creator or an admin
  const user = await User.findById(userId);
  if (user.ROLE !== 'admin' && existingDelivery.USER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this delivery', 403));
  }

  await Delivery.delete(parseInt(deliveryId));

  res.status(200).json({
    success: true,
    message: 'Delivery successfully deleted.'
  });
});

module.exports = {
  createDelivery,
  getDelivery,
  getDeliveries,
  getAllDeliveries,
  getDeliveriesByCrop,
  updateDelivery,
  deleteDelivery
};