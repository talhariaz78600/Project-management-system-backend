const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const requireAuth = require('../middlewares/requireAuth');

// All routes require authentication
router.use(requireAuth);

// Get all notifications for the authenticated user
router.get('/', notificationController.getNotifications);

// Get notification count
router.get('/count', notificationController.getNotificationCount);

// Mark specific notification as read (delete it)
router.delete('/:id', notificationController.markAsRead);

// Mark all notifications as read (delete all)
router.delete('/', notificationController.markAllAsRead);

module.exports = router;
