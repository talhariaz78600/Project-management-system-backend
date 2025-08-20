const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const requireAuth = require('../middlewares/requireAuth');
router.use(requireAuth);
router.post('/',  taskController.createTask);
router.get('/assigned',  taskController.getTasksbyAssignedUser);
router.get('/developer/stats',  taskController.getDeveloperTaskStats);
router.get('/project/:projectId',  taskController.getTasks);
router.get('/:id',  taskController.getTask);
router.patch('/:id',  taskController.updateTask);
router.delete('/:id',  taskController.deleteTask);

module.exports = router;