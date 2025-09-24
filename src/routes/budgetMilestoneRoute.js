const express = require('express');
const budgetMilestoneController = require('../controllers/budgetMilestoneController');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');
const { roles } = require('../utils/types');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Routes for budget milestones
router
  .route('/')
  .get(budgetMilestoneController.getAllBudgetMilestones)
  .post(
    restrictTo([roles.ADMIN, roles.SUBADMIN]),
    budgetMilestoneController.createBudgetMilestone
  );

router
  .route('/:id')
  .get(budgetMilestoneController.getBudgetMilestone)
  .patch(
    restrictTo([roles.ADMIN, roles.SUBADMIN]),
    budgetMilestoneController.updateBudgetMilestone
  )
  .delete(
    restrictTo([roles.ADMIN]),
    budgetMilestoneController.deleteBudgetMilestone
  );

// Route to update milestone status
router.patch(
  '/:id/status',
  restrictTo([roles.ADMIN, roles.SUBADMIN]),
  budgetMilestoneController.updateMilestoneStatus
);

// Routes for project-specific milestones
router.get(
  '/project/:projectId',
  budgetMilestoneController.getMilestonesByProject
);

// Route to get budget summary by project
router.get(
  '/project/:projectId/summary',
  budgetMilestoneController.getBudgetSummaryByProject
);

// Route to get milestones by project and status
router.get(
  '/project/:projectId/status/:status',
  budgetMilestoneController.getMilestonesByStatus
);

module.exports = router;
