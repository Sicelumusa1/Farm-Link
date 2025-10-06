const Crop = require('../models/cropModel');
const Farm = require('../models/farmModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { uploadToOracleBucket, getPublicURL } = require('../utils/oracleStorage');
const upload = require('../middleware/uploadMiddleware');


// Create new crop
const createCrop = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { farm_id, crop_name, plant_date, type, units_planted, produce_yield } = req.body;

  // Validate required fields
  if (!farm_id || !crop_name || !plant_date || !type || !units_planted) {
    return next(new ErrorHandler('Please fill in all the required fields', 400));
  }

  // Validate type
  if (!['direct sow', 'transplant'].includes(type)) {
    return next(new ErrorHandler('Type must be either "direct sow" or "transplant"', 400));
  }

  // Verify that the farm belongs to the user
  const farm = await Farm.findByUserId(userId);
  if (!farm || farm.ID !== parseInt(farm_id)) {
    return next(new ErrorHandler('Farm not found or access denied', 404));
  }

  // Create the crop
  const cropId = await Crop.create({
    farm_id: parseInt(farm_id),
    crop_name,
    plant_date: new Date(plant_date),
    type,
    units_planted: parseInt(units_planted),
    produce_yield: produce_yield || 0
  });

  // Get the created crop details
  const crop = await Crop.findById(cropId);

  res.status(201).json({
    success: true,
    data: crop,
    message: 'Crop created successfully'
  });
});

// Get all crops for user's farm
const getUserCrops = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Get user's farm first
  const farm = await Farm.findByUserId(userId);
  if (!farm) {
    return next(new ErrorHandler('Farm not found', 404));
  }

  const crops = await Crop.findByFarmId(farm.ID);

  res.status(200).json({
    success: true,
    data: crops,
    count: crops.length
  });
});

// Get single crop with orders and deliveries
const getCrop = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;

  const crop = await Crop.getCropWithOrdersAndDeliveries(parseInt(cropId));
  if (!crop) {
    return next(new ErrorHandler('Crop not found', 404));
  }

  // Verify that the crop belongs to the user's farm
  if (crop.USER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this crop', 403));
  }

  res.status(200).json({
    success: true,
    data: crop
  });
});

// Update crop details
const updateCrop = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;
  const { crop_name, plant_date, type, units_planted, produce_yield, growth_stage } = req.body;

  // Verify crop exists and belongs to user
  const existingCrop = await Crop.findById(parseInt(cropId));
  if (!existingCrop) {
    return next(new ErrorHandler('Crop not found', 404));
  }

  // Verify that the crop belongs to the user's farm
  const farm = await Farm.findByUserId(userId);
  if (!farm || farm.ID !== existingCrop.FARM_ID) {
    return next(new ErrorHandler('Access denied to this crop', 403));
  }

  // Validate type if provided
  if (type && !['direct sow', 'transplant'].includes(type)) {
    return next(new ErrorHandler('Type must be either "direct sow" or "transplant"', 400));
  }

  // Update the crop
  await Crop.update(parseInt(cropId), {
    crop_name,
    plant_date: plant_date ? new Date(plant_date) : undefined,
    type,
    units_planted: units_planted ? parseInt(units_planted) : undefined,
    produce_yield,
    growth_stage
  });

  // Get updated crop details
  const updatedCrop = await Crop.findById(parseInt(cropId));

  res.status(200).json({
    success: true,
    data: updatedCrop,
    message: 'Crop updated successfully'
  });
});

// Delete crop
const deleteCrop = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;

  // Verify crop exists and belongs to user
  const existingCrop = await Crop.findById(parseInt(cropId));
  if (!existingCrop) {
    return next(new ErrorHandler('Crop not found', 404));
  }

  // Verify that the crop belongs to the user's farm
  const farm = await Farm.findByUserId(userId);
  if (!farm || farm.ID !== existingCrop.FARM_ID) {
    return next(new ErrorHandler('Access denied to this crop', 403));
  }

  await Crop.delete(parseInt(cropId));

  res.status(200).json({
    success: true,
    message: 'Crop deleted successfully'
  });
});

// Update crop growth stage
const updateCropGrowthStage = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;
  const { growth_stage } = req.body;

  if (!growth_stage) {
    return next(new ErrorHandler('Growth stage is required', 400));
  }

  // Verify crop exists and belongs to user
  const existingCrop = await Crop.findById(parseInt(cropId));
  if (!existingCrop) {
    return next(new ErrorHandler('Crop not found', 404));
  }

  // Verify that the crop belongs to the user's farm
  const farm = await Farm.findByUserId(userId);
  if (!farm || farm.ID !== existingCrop.FARM_ID) {
    return next(new ErrorHandler('Access denied to this crop', 403));
  }

  await Crop.updateGrowthStage(parseInt(cropId), growth_stage);

  // Get updated crop details
  const updatedCrop = await Crop.findById(parseInt(cropId));

  res.status(200).json({
    success: true,
    data: updatedCrop,
    message: 'Growth stage updated successfully'
  });
});

// Get all crops for admin (all users' crops)
const getAllCrops = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is admin
  const user = await User.findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  // For now, return crops for the current user
  const crops = await Crop.findByUserId(userId);

  res.status(200).json({
    success: true,
    data: crops,
    count: crops.length
  });
});

// Upload crop image
const uploadCropImage = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;

  // Validate file
  if (!req.file) {
    return next(new ErrorHandler('Please upload an image', 400));
  }

  const existingCrop = await Crop.findById(parseInt(cropId));
  if (!existingCrop) {
    return next(new ErrorHandler('Crop not found', 404));
  }

  const farm = await Farm.findByUserId(userId);
  if (!farm || farm.ID !== existingCrop.FARM_ID) {
    return next(new ErrorHandler('Access denied to this crop', 403));
  }

  const ns = process.env.OCI_NAMESPACE;
  const bucketName = process.env.OCI_BUCKET;
  const objectName = `crops/${cropId}/${Date.now()}-${req.file.originalname}`;

  const uploadedObjectName = await uploadToOracleBucket(bucketName, req.file.path, objectName);

  const namespace = await (await import('../utils/oracleStorage.js')).getNamespace?.() || ns;
  const imageUrl = getPublicURL(namespace, bucketName, uploadedObjectName);

  // Store image URL in your crops table
  const connection = await require('../config/db').oracledb.getConnection();
  await connection.execute(
    `UPDATE crop_images SET url = :url WHERE id = :id`,
    { url: imageUrl, id: cropId }
  );
  await connection.commit();
  await connection.close();

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl
  });
});

module.exports = {
  createCrop,
  getUserCrops,
  getCrop,
  updateCrop,
  deleteCrop,
  updateCropGrowthStage,
  getAllCrops,
  uploadCropImage
};