const Order = require('../models/orderModel');
const Crop = require('../models/cropModel');
const Farm = require('../models/farmModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Update the last date a farmer was visited
const updateLastVisited = async (userId) => {
  try {
    await User.updateLastVisited(userId, new Date());
  } catch (error) {
    console.error('Error updating last visited:', error);
  }
};

// Create a new order
const createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cropId, quantity } = req.body;
  const adminId = req.user.id;

  // Validate required fields
  if (!cropId || !quantity) {
    return next(new ErrorHandler('Crop ID and quantity are required', 400));
  }

  // Check if crop exists
  const crop = await Crop.findById(parseInt(cropId));
  if (!crop) {
    return next(new ErrorHandler('Crop not found!', 404));
  }

  // Verify user is admin (you'll need to implement this check)
  const user = await User.findById(adminId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Only admins can create orders', 403));
  }

  // Create the order
  const orderId = await Order.create({
    admin_id: adminId,
    crop_id: parseInt(cropId),
    quantity: parseInt(quantity)
  });

  // Get the created order details
  const order = await Order.findById(orderId);

  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully'
  });
});

// Update order status
const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'dispatched', 'received'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Invalid status. Must be: pending, dispatched, or received', 400));
  }

  // Check if order exists and get detailed information
  const order = await Order.findById(parseInt(orderId));
  if (!order) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  // Update the order status
  await Order.updateStatus(parseInt(orderId), status);

  // Update last visited date for the farmer if status is dispatched
  if (status === 'dispatched') {
    await updateLastVisited(order.FARMER_ID);
  }

  // Get updated order details
  const updatedOrder = await Order.findById(parseInt(orderId));

  res.status(200).json({
    success: true,
    data: updatedOrder,
    message: 'Order status updated successfully'
  });
});

// GET single order details
const getOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findById(parseInt(orderId));
  if (!order) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  // Authorization check - user must be either the admin who created the order or the farmer who owns the crop
  const userId = req.user.id;
  const user = await User.findById(userId);
  
  if (user.ROLE !== 'admin' && order.FARMER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// GET all orders for the admin side
const getOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is admin
  const user = await User.findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  const orders = await Order.getAllOrders();

  res.status(200).json({
    success: true,
    data: orders,
    count: orders.length
  });
});

// GET orders for current user (farmer)
const getFarmerOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await Order.findByFarmerId(userId);

  res.status(200).json({
    success: true,
    data: orders,
    count: orders.length
  });
});

// Update an order
const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;
  const { quantity, status } = req.body;
  const userId = req.user.id;

  // Check if order exists
  const existingOrder = await Order.findById(parseInt(orderId));
  if (!existingOrder) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  // Verify user is admin
  const user = await User.findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Only admins can update orders', 403));
  }

  // Validate status if provided
  if (status && !['pending', 'dispatched', 'received'].includes(status)) {
    return next(new ErrorHandler('Invalid status. Must be: pending, dispatched, or received', 400));
  }

  // Update the order
  await Order.update(parseInt(orderId), {
    quantity: quantity ? parseInt(quantity) : undefined,
    status
  });

  // If status is being updated to dispatched, update last visited
  if (status === 'dispatched') {
    await updateLastVisited(existingOrder.FARMER_ID);
  }

  // Get updated order details
  const updatedOrder = await Order.findById(parseInt(orderId));

  res.status(200).json({
    success: true,
    data: updatedOrder,
    message: 'Order updated successfully'
  });
});

// Delete an order
const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  // Check if order exists
  const existingOrder = await Order.findById(parseInt(orderId));
  if (!existingOrder) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  // Verify user is admin
  const user = await User.findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Only admins can delete orders', 403));
  }

  await Order.delete(parseInt(orderId));

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully!'
  });
});

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  getFarmerOrders,
  updateOrder,
  deleteOrder,
  updateOrderStatus
};