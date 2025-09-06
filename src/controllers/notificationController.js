const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get all notifications for the authenticated user
const getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments({ recipient: userId })
  ]);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: notifications
  });
});

// Get notification count
const getNotificationCount = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  const count = await Notification.countDocuments({ recipient: userId });
  
  res.status(200).json({
    status: 'success',
    data: { count }
  });
});

// Mark notification as read (delete it)
const markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid notification ID', 400));
  }

  // Find and verify the notification belongs to the user
  const notification = await Notification.findOne({ 
    _id: id, 
    recipient: userId 
  });

  if (!notification) {
    return next(new AppError('Notification not found or access denied', 404));
  }

  // Delete the notification (mark as read = delete)
  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read and deleted'
  });
});

// Mark all notifications as read (delete all)
const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const result = await Notification.deleteMany({ recipient: userId });

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read and deleted',
    deletedCount: result.deletedCount
  });
});

module.exports = {
  getNotifications,
  getNotificationCount,
  markAsRead,
  markAllAsRead
};
