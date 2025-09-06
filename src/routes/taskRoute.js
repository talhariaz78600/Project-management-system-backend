const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');
router.use(requireAuth);
router.post('/',  taskController.createTask);
router.get('/assigned',  taskController.getTasksbyAssignedUser);
router.get('/developer/stats',  taskController.getDeveloperTaskStats);
router.get('/project/:projectId',  taskController.getTasks);
router.get('/:id',  taskController.getTask);
router.patch('/:id',  taskController.updateTask);
router.patch('/:id/status-update', restrictTo('associateUser'), taskController.updateTaskStatus);
router.get('/completed/payments', restrictTo('associateUser'), taskController.getTaskCompletedByManagerForAUser);
router.delete('/:id',  taskController.deleteTask);
router.patch('/:id/status', restrictTo('admin', 'subAdmin'), taskController.approvedByManager);
router.patch('/:id/payment', restrictTo('admin', 'subAdmin'), taskController.updatePaymentStatus);

// Associate User Dashboard Analytics
router.get('/dashboard/analytics', restrictTo('associateUser'), taskController.getAssociateUserAnalytics);


module.exports = router;