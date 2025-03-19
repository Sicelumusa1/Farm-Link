// Defines the user schema and related data methods
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { reset } = require('nodemon');
const validator = require('validator');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
  },
  password: {
    type: String,
    require: true,
    select: false
  },
  phone: {
    type: String,
    require: true,
    validator: [validator.isMobilePhone, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  },
  hasProvidedFarmDetails: {
    type: Boolean,
    default: false,
  },
  lastVisited: {
    type: Date
  },
  deliveries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  }]
});

// Encrypting passwords before saving them
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// Function that returns a JSON WEB TOKEN
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id : this._id }, process.env.JWT_SECRET, {
    expiresIn : process.env.JWT_EXPIRY_TIME
  });
}

// Compare the entered password with the password stored in database
userSchema.methods.comparePassword = async function(enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
}

// Create a password reset token
userSchema.methods.getResetPasswordToken = function() {
  // generate the token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiry time
  this.resetPasswordExpire = Date.now() + 30*60*1000;

  return resetToken;
}

module.exports = mongoose.model('User', userSchema);