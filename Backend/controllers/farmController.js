// Logic for farm-related operations
const Farm = require('../models/farmModel')
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create farm instance
const createFarm = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    const { name, location, streetName, houseNumber, city, farmSize, coordinates } = req.body;
  
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler('User not found!', 404));
    }
  
    if (user.farm) {
      return next(new ErrorHandler('User already has a farm!', 400));
    }
  
    const farm = new Farm({user: user._id, name, location, streetName, houseNumber, city, farmSize, coordinates});
    await farm.save();
  
    user.farm = farm._id;
    await user.save();
  
    res.status(200).json({
      success: true,
      data: farm
    });
  });
  
// Update farm details
const updateFarm = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    const { name, location, streetName, houseNumber, city, farmSize, coordinates } = req.body;
  
    // find the user and populate the farm fields
    const user = await User.findById(userId).populate('farm');
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
  
    if (!user.farm) {
        return next(new ErrorHandler('User does not have a farm', 400));
    }
  
    // Update the farm document
    const farm = await Farm.findOneAndUpdate(
      { user: userId },
      { location, streetName, houseNumber, city, farmSize, coordinates },
      { new: true }
    );
  
    // Update user's hasProvidedFarmDetails field
    await User.findByIdAndUpdate(userId, { hasProvidedFarmDetails: true });
  
  
    res.status(200).json({
      success: true,
      data: farm,
      message: 'Farm details updated successfully'
    });
  });

const getUserFarmAndCrops = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).populate({
      path: 'farm',
      populate: {
      path: 'crops',
      populate: {
          path: 'orders'
      }
      }
  });

  if (!user || !user.farm) {
      return next(new ErrorHandler('Farm not found', 404));
  }

  res.status(200).json({
      success: true,
      data: user.farm,
});

});

module.exports = {
    createFarm,
    updateFarm,
    getUserFarmAndCrops,
};