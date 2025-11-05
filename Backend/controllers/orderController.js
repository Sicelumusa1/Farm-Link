const Order = require('../models/orderModel');
const Crop = require('../models/cropModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

/**
 * CREATE ORDER (Admin creates an order for a farmer/user)
 */
const createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cropId, quantity, userId } = req.body;
  const adminId = req.user.id;

  if (!cropId || !quantity || !userId) {
    return next(new ErrorHandler('Crop ID, quantity, and farmer ID are required', 400));
  }

  if (quantity <= 0) {
    return next(new ErrorHandler('Quantity must be greater than 0', 400));
  }

  const crop = await Crop.findById(parseInt(cropId));
  if (!crop) return next(new ErrorHandler('Crop not found!', 404));

  const availableQuantity = crop.PRODUCE_YIELD || 0;
  if (availableQuantity < quantity) {
    return next(
      new ErrorHandler(
        `Insufficient quantity. Available: ${availableQuantity}kg, Requested: ${quantity}kg`,
        400
      )
    );
  }

  const farmer = await User.findById(parseInt(userId));
  if (!farmer || farmer.role !== 'user') {
    return next(new ErrorHandler('Farmer not found or invalid role!', 404));
  }

  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    return next(new ErrorHandler('Only admins can create orders', 403));
  }

  const orderId = await Order.create({
    admin_id: adminId,
    crop_id: parseInt(cropId),
    user_id: parseInt(userId),
    quantity: parseInt(quantity),
    status: 'pending'
  });

  const order = await Order.findByIdWithDetails(parseInt(orderId));
  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully (status: pending)'
  });
});

/**
 * UPDATE ORDER STATUS (Role-based workflow)
 */
const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const { id: userId, role: userRole } = req.user;

  const order = await Order.findById(parseInt(orderId));
  if (!order) return next(new ErrorHandler('Order not found!', 404));

  // Access: Farmers can only update their own orders
  if (userRole === 'user' && order.user_id !== userId) {
    return next(new ErrorHandler('Access denied to this order', 403));
  }

  const currentStatus = order.status || order.status;
  const transitions = {
    user: {
      pending: ['acknowledged'],
      acknowledged: ['dispatched']
    },
    admin: {
      dispatched: ['delivered']
    }
  };

  const allowedNext = transitions[userRole]?.[currentStatus] || [];
  if (!allowedNext.includes(status)) {
    return next(
      new ErrorHandler(
        `Invalid status change: ${currentStatus} → ${status} not allowed for ${userRole}`,
        400
      )
    );
  }

  await Order.updateStatus(parseInt(orderId), status);
  const updatedOrder = await Order.findByIdWithDetails(parseInt(orderId));

  res.status(200).json({
    success: true,
    data: updatedOrder,
    message: `Order status updated to '${status}' successfully`
  });
});

/**
 * ACKNOWLEDGE ORDER (Shortcut route for farmers)
 */
const acknowledgeOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user.id;

  const order = await Order.findById(parseInt(orderId));
  if (!order) return next(new ErrorHandler('Order not found!', 404));

  if (order.user_id !== userId) {
    return next(new ErrorHandler('Access denied to this order', 403));
  }

  if (order.status !== 'pending') {
    return next(new ErrorHandler('Only pending orders can be acknowledged', 400));
  }

  await Order.updateStatus(parseInt(orderId), 'acknowledged');
  const updatedOrder = await Order.findByIdWithDetails(parseInt(orderId));

  res.status(200).json({
    success: true,
    data: updatedOrder,
    message: 'Order acknowledged successfully'
  });
});


/**
 * GET single order
 */
const getOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findByIdWithDetails(parseInt(orderId));
  if (!order) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  const userId = req.user.id;
  const user = await User.findById(userId);

  if (user.role !== 'admin' && order.USER_ID !== userId) {
    return next(new ErrorHandler('Access denied to this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * GET all orders (Admin only)
 */

const getOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user || user.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  const orders = await Order.getAllOrdersWithDetails();

  res.status(200).json({
    success: true,
    data: orders, 
    count: orders.length
  });
});



/**
 * GET orders for a farmer/user
 */
const getFarmerOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { status } = req.query;

  const orders = await Order.findByUserIdWithDetails(userId, status);

  res.status(200).json({
    success: true,
    data: orders,
    count: orders.length
  });
});


/**
 * UPDATE order (Admin only)
 */

/**
 * UPDATE order (Admin or Farmer)
 * Admin → can update quantity & status (only if still pending)
 * Farmer → can only update status, with valid transitions
 */
const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;
  const { quantity, status } = req.body;
  const userId = req.user.id;

  // Fetch order
  const existingOrder = await Order.findById(parseInt(orderId));
  if (!existingOrder) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  // Fetch user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const updates = {};

  // If ADMIN
  if (user.role === 'admin') {
    // Admin can only edit/cancel pending orders
    if (existingOrder.status !== 'pending') {
      return next(
        new ErrorHandler(
          'Admin can only edit or cancel pending orders',
          403
        )
      );
    }

    // Quantity validation
    if (quantity !== undefined) {
      const parsedQty = Number(quantity);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        return next(
          new ErrorHandler('Quantity must be a valid positive number', 400)
        );
      }
      updates.quantity = parsedQty;
    }

    // Status validation
    if (status) {
      if (
        !['pending', 'acknowledged', 'dispatched', 'received', 'cancelled'].includes(
          status
        )
      ) {
        return next(new ErrorHandler('Invalid status', 400));
      }
      updates.status = status;
    }
  }

  // If FARMER
  else if (user.role === 'user') {
    if (!status) {
      return next(new ErrorHandler('Farmers can only update order status', 400));
    }

    // Allowed transitions
    const allowedTransitions = {
      pending: ['acknowledged', 'cancelled'],
      acknowledged: ['dispatched', 'cancelled'],
      dispatched: ['received'],
      received: [],
      cancelled: [],
    };

    const current = existingOrder.status;
    const allowedNext = allowedTransitions[current] || [];

    if (!allowedNext.includes(status)) {
      return next(
        new ErrorHandler(
          `Invalid status transition: ${current} → ${status}`,
          400
        )
      );
    }

    updates.status = status;
  }

  // Unauthorized roles
  else {
    return next(new ErrorHandler('Unauthorized role', 403));
  }

  // Perform update
  try {
    await Order.update(parseInt(orderId), updates);
    const updatedOrder = await Order.findByIdWithDetails(parseInt(orderId));

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


/**
 * DELETE order (Admin only)
 */
const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  const existingOrder = await Order.findById(parseInt(orderId));
  if (!existingOrder) {
    return next(new ErrorHandler('Order not found!', 404));
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') {
    return next(new ErrorHandler('Only admins can delete orders', 403));
  }

  try {
    await Order.delete(parseInt(orderId));

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully!'
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * GET order statistics (Admin)
 */
const getOrderStatistics = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  const statistics = await Order.getStatistics();

  res.status(200).json({
    success: true,
    data: statistics
  });
});

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  getFarmerOrders,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  acknowledgeOrder,
  getOrderStatistics
};
