const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');

exports.cookieJwtAuth = catchAsyncErrors(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new ErrorHandler('Unauthorized: Token missing', 401));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  
    
    const user = await User.findById(decodedToken.id);
    
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    console.error('JWT Auth error:', error);
    return next(new ErrorHandler('Forbidden: Invalid token', 403));
  }
});

// Deals with permissions to resources
exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role ${req.user?.role} is not allowed to access this resource`, 403));
    }
    next();
  };
};