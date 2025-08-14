const express = require('express');
const {
  createRole,
  getRole,
  getAllRoles,
  updateRole,
  deleteRole,
  getRoleNames
} = require('../controllers/roleController');
const  requireAuth  = require('../middlewares/requireAuth');
const  restrictTo  = require('../middlewares/restrictTo');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get role names (accessible to all authenticated users)
router.get('/names', getRoleNames);

// Admin only routes
router.use(restrictTo(['admin']));

// CRUD operations for roles
router.route('/')
  .get(getAllRoles)
  .post(createRole);

router.route('/:id')
  .get(getRole)
  .patch(updateRole)
  .delete(deleteRole);

module.exports = router;
