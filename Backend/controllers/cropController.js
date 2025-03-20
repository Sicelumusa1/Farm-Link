// Logic for crop-related operations
const Crop = require('../models/cropModel');
const User = require('../models/userModel');
const Farm = require('../models/farmModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Allow user to add a new crop
const addCrop = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { cropName, plantDate, type, unitsPlanted } = req.body;
  
  const user = await User.findById(userId).populate('farm');
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (!user.farm) {
    return next(new ErrorHandler('User does not have a farm', 400));
  }

  const farm = await Farm.findById(user.farm);
  if (!farm) {
    return next(new ErrorHandler('Farm not found', 404));
  }

  // Check if all required fields are provided
  if (!cropName || !plantDate || !type || !unitsPlanted) {
    return next(new ErrorHandler('Please fill in all the required fields', 400));
  }

  // Create a new crop document
  const crop = await Crop.create({
    farm: farm._id,
    cropName,
    plantDate,
    type,
    unitsPlanted,
  });

  // Add the crop's ObjectId to the farm's crop array
  farm.crops.push(crop._id);
  await farm.save();

  // Send response with the new crop details
  res.status(201).json({
    success: true,
    data: crop,
    message: 'Crop was successfully added!'
  });
});

// Retrieve crops of the currently logged in user
const getCrops = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
  
    const user = await User.findById(userId).populate({
      path: 'farm',
      populate: {
        path: 'crops'
      }
    });
  
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
  
    if (!user.farm) {
      return next(new ErrorHandler('User does not have a farm', 400));
    }
  
    const crops = user.farm.crops;
  
    res.status(200).json({
      success: true,
      data: crops
    });
  
  });

//  Update crop details in the current user's farm
const updateCrop = catchAsyncErrors(async (req, res, next) => {
  const cropId = req.params.cropId;
  const { cropName, plantDate, type, unitsPlanted, produceYield, plotSize, growthStage } = req.body;

  const user = await User.findById(req.user.id).populate({
      path: 'farm',
      populate: {
          path: 'crops'
      }
  });

  if (!user) {
      return next(new ErrorHandler('User not found', 404));
  }

  if (!user.farm) {
      return next(new ErrorHandler('User does not have a farm', 400));
  }

  // Check if the crop exists
  const crop = user.farm.crops.find(crop => crop._id.toString() === cropId);
  if (!crop) {
      return next(new ErrorHandler('Crop not found', 404));
  }

  // Handle image upload for new growth stage
  if (req.file && growthStage) {
      const imageUrl = req.file.path;
      crop.images.push({ url: imageUrl, growthStage });
  }

  // Update crop details
  crop.cropName = cropName || crop.cropName;
  crop.plantDate = plantDate || crop.plantDate;
  crop.type = type || crop.type;
  crop.unitsPlanted = unitsPlanted || crop.unitsPlanted;
  crop.produceYield = produceYield || crop.produceYield;
  crop.plotSize = plotSize || crop.plotSize;

  await crop.save();

  // Send response with the updated crop details
  res.status(200).json({
      success: true,
      data: crop,
      message: 'Crop was successfully updated!'
  });
});

module.exports = { 
    addCrop,
    updateCrop,
    getCrops
};