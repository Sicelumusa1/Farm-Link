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
  const { description, growth_stage } = req.body;

  // Validate file
  if (!req.file) {
    return next(new ErrorHandler('Please upload an image', 400));
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

  try {
    // Generate unique object name for OCI
    const fileExtension = path.extname(req.file.originalname);
    const objectName = `crops/${cropId}/${Date.now()}${fileExtension}`;

    // Upload to OCI bucket
    const uploadResult = await oracleStorage.uploadImage(req.file.path, objectName);
    
    // Get public URL
    const imageUrl = await oracleStorage.getImageUrl(objectName);

    // Store image metadata in database
    const imageId = await Crop.addCropImage(
      parseInt(cropId), 
      imageUrl, 
      description, 
      growth_stage
    );

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId,
        imageUrl,
        objectName: uploadResult.objectName
      }
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorHandler('Failed to upload image: ' + error.message, 500));
  }
});

// Get crop images
const getCropImages = catchAsyncErrors(async (req, res, next) => {
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

  const images = await Crop.getCropImages(parseInt(cropId));

  res.status(200).json({
    success: true,
    data: images,
    count: images.length
  });
});

// Delete crop image
const deleteCropImage = catchAsyncErrors(async (req, res, next) => {
  const { id: cropId, imageId } = req.params;
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

  await Crop.deleteCropImage(parseInt(cropId), parseInt(imageId));

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
});

// Get recommended units for a crop
const getRecommendedUnits = catchAsyncErrors(async (req, res, next) => {
  const { crop } = req.query;

  if (!crop) {
    return next(new ErrorHandler('Crop name is required', 400));
  }

  const recommendedUnits = Crop.getRecommendedUnits(crop);

  res.status(200).json({
    success: true,
    data: recommendedUnits,
    crop: crop
  });
});

// Get unit conversions
const getUnitConversions = catchAsyncErrors(async (req, res, next) => {
  const conversions = Crop.getUnitConversions();

  res.status(200).json({
    success: true,
    data: conversions
  });
});

// Convert crop unit
const convertCropUnit = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;
  const { new_unit } = req.body;

  if (!new_unit) {
    return next(new ErrorHandler('New unit is required', 400));
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

  const result = await Crop.convertCropQuantity(parseInt(cropId), new_unit);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Unit converted successfully'
  });
});

// Get available crops for marketplace
const getAvailableCrops = catchAsyncErrors(async (req, res, next) => {
  const crops = await Crop.getAvailableCrops();

  res.status(200).json({
    success: true,
    data: crops,
    count: crops.length
  });
});

// Get crops by farm ID
const getCropsByFarm = catchAsyncErrors(async (req, res, next) => {
  const farmId = req.params.farmId;
  const userId = req.user.id;

  // Verify farm belongs to user
  const farm = await Farm.findById(parseInt(farmId));
  if (!farm || farm.USER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this farm', 403));
  }

  const crops = await Crop.findByFarmId(parseInt(farmId));

  res.status(200).json({
    success: true,
    data: crops,
    count: crops.length
  });
});

// Search crops with filters
const searchCrops = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { crop_name, growth_stage, start_date, end_date, farm_id } = req.query;

  let connection;
  try {
    connection = await oracledb.getConnection("default");
    
    let query = `
      SELECT c.*, f.name as farm_name 
      FROM crops c 
      JOIN farms f ON c.farm_id = f.id 
      WHERE f.user_id = :user_id
    `;
    const binds = { user_id: userId };

    if (crop_name) {
      query += ` AND UPPER(c.crop_name) LIKE UPPER(:crop_name)`;
      binds.crop_name = `%${crop_name}%`;
    }

    if (growth_stage) {
      query += ` AND c.growth_stage = :growth_stage`;
      binds.growth_stage = growth_stage;
    }

    if (start_date) {
      query += ` AND c.plant_date >= :start_date`;
      binds.start_date = new Date(start_date);
    }

    if (end_date) {
      query += ` AND c.plant_date <= :end_date`;
      binds.end_date = new Date(end_date);
    }

    if (farm_id) {
      query += ` AND c.farm_id = :farm_id`;
      binds.farm_id = parseInt(farm_id);
    }

    query += ` ORDER BY c.plant_date DESC`;

    const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = {
  createCrop,
  getUserCrops,
  getCrop,
  updateCrop,
  deleteCrop,
  updateCropGrowthStage,
  getAllCrops,
  uploadCropImage,
  getCropImages,
  deleteCropImage,
  getRecommendedUnits,
  getUnitConversions,
  convertCropUnit,
  getAvailableCrops,
  getCropsByFarm,
  searchCrops
};