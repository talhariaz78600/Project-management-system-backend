const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');
const {
  updateProjectStatus,
  getManagerProjects,
  getProjectAnalytics,
  deleteProject,
  assignTasks,
  getProject,
  getAllProjects,
  updateProject,
  createProject,
  getClientProjects,
  addMembersToProject
} = require('../controllers/projectController');

const { roles } = require('../utils/types');

const router = express.Router();

router.use(requireAuth);

router.post('/', restrictTo([roles.ADMIN, roles.SUBADMIN]), createProject);

router.patch('/:id', restrictTo([roles.ADMIN, roles.SUBADMIN]), updateProject);

router.delete('/:id', restrictTo([roles.ADMIN, roles.SUBADMIN]), deleteProject);

router.patch('/task/:id/assign-tasks', restrictTo([roles.ADMIN, roles.SUBADMIN]), assignTasks);

router.patch('/:id/status', restrictTo([roles.ADMIN, roles.SUBADMIN]), updateProjectStatus);

router.get('/', restrictTo([roles.ADMIN, roles.SUBADMIN]), getAllProjects);

router.get('/:id', restrictTo([roles.ADMIN, roles.SUBADMIN]), getProject);

router.get('/analytics/data', restrictTo([roles.ADMIN, roles.SUBADMIN]), getProjectAnalytics);

router.get('/manager/my-projects', restrictTo([roles.PROJECT_MANAGER, roles.SUBADMIN]), getManagerProjects);

router.get('/client/my-projects', restrictTo([roles.CLIENT, roles.SUBADMIN]), getClientProjects);

router.patch('/:id/add-members', restrictTo([roles.ADMIN, roles.SUBADMIN]), addMembersToProject);

module.exports = router;
