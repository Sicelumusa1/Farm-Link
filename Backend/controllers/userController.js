const User = require('../models/userModel');
const { oracledb } = require('../config/db');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Register user
const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return next(new ErrorHandler('Please fill in all the required fields', 400));
  }

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new ErrorHandler('User already exists with this email', 400));
  }

  const userId = await User.create({ name, email, password, phone });
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    userId
  });
});

// Login user
const userLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please enter email and password', 400));
  }

  const user = await User.findByEmail(email);
  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  const isMatch = await User.comparePassword(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  sendToken(user, 200, res);
});

// Forgot Password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByEmail(req.body.email);
  if (!user) {
    return next(new ErrorHandler('No user found with this email', 404));
  }

  const resetToken = await User.setResetPasswordToken(user.id);
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'LEDPlug Password Recovery',
      message: `Use the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.`
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`
    });
  } catch (err) {
    // Reset the token if email fails
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      await connection.execute(
        `UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = :id`,
        { id: user.id }
      );
      await connection.commit();
    } catch (dbErr) {
      console.error('Error resetting token:', dbErr);
    } finally {
      if (connection) await connection.close();
    }

    return next(new ErrorHandler('Email could not be sent', 500));
  }
});


const passwordReset = catchAsyncErrors(async (req, res, next) => {
  const resetToken = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  let connection;
  try {
    connection = await oracledb.getConnection("default");

    // Find user by hashed reset token
    const result = await connection.execute(
      `SELECT id FROM users WHERE reset_password_token = :token AND reset_password_expire > CURRENT_TIMESTAMP`,
      { token: hashedToken },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return next(new ErrorHandler('Password reset token is invalid or expired', 400));
    }

    const userId = result.rows[0].ID;

    // Fetch full user object including password using your User model
    const dbUser = await User.findByIdWithPassword(userId);
    if (!dbUser) return next(new ErrorHandler('User not found', 404));

    if (!req.body.password) {
      return next(new ErrorHandler('Please provide a new password', 400));
    }

    // Hash the new password
    const newHashedPassword = crypto.createHash('sha256').update(req.body.password).digest('hex');

    // Update password and reset token fields
    await connection.execute(
      `UPDATE users 
       SET password = :password, reset_password_token = NULL, reset_password_expire = NULL 
       WHERE id = :id`,
      { password: newHashedPassword, id: dbUser.id }
    );
    await connection.commit();

    // Add getJwtToken method to user object for sendToken
    dbUser.getJwtToken = function () {
      return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY_TIME || '7d'
      });
    };

    sendToken(dbUser, 200, res);

  } catch (error) {
    console.error('Password reset error details:', error);
    if (connection) await connection.rollback();
    return next(new ErrorHandler(error.message || 'Password reset failed', 500));
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


// Logout user
const userLogout = catchAsyncErrors(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = { registerUser, userLogin, forgotPassword, passwordReset, userLogout };