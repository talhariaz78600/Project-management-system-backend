const BudgetMilestone = require('../models/BudgetMilestone');
const Project = require('../models/Project');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const mongoose = require('mongoose');

// Create a new budget milestone
const createBudgetMilestone = catchAsync(async (req, res, next) => {
  const { milestoneName, status, price, projectId, description } = req.body;

  // Basic validation
  if (!milestoneName) {
    return next(new AppError('Milestone name is required', 400));
  }
  if (!price && price !== 0) {
    return next(new AppError('Price is required', 400));
  }
  if (price < 0) {
    return next(new AppError('Price cannot be negative', 400));
  }
  if (!projectId) {
    return next(new AppError('Project ID is required', 400));
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new AppError('Invalid project ID', 400));
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Create the milestone
  const milestone = await BudgetMilestone.create({
    milestoneName: milestoneName.trim(),
    status: status || 'Pending',
    price,
    projectId,
    description: description ? description.trim() : undefined
  });

  // Populate project details
  await milestone.populate('projectId', 'title description');

  res.status(201).json({
    status: 'success',
    data: {
      milestone
    }
  });
});

// Get all budget milestones with filtering and pagination
const getAllBudgetMilestones = catchAsync(async (req, res, next) => {
  // Build query
  const features = new APIFeatures(
    BudgetMilestone.find()
      .populate('projectId', 'title description status'),
    req.query,
    BudgetMilestone
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const milestones = await features.query;

  res.status(200).json({
    status: 'success',
    results: milestones.length,
    data: {
      milestones
    }
  });
});

// Get budget milestone by ID
const getBudgetMilestone = catchAsync(async (req, res, next) => {
  const milestone = await BudgetMilestone.findById(req.params.id)
    .populate('projectId', 'title description status budget');

  if (!milestone) {
    return next(new AppError('Budget milestone not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      milestone
    }
  });
});

// Update budget milestone
const updateBudgetMilestone = catchAsync(async (req, res, next) => {
  const { milestoneName, status, price, description } = req.body;

  // Basic validation for fields being updated
  if (price !== undefined && price < 0) {
    return next(new AppError('Price cannot be negative', 400));
  }
  
  if (status && !['Pending', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
    return next(new AppError('Invalid status. Must be one of: Pending, In Progress, Completed, Cancelled', 400));
  }

  // Prepare update object
  const updateData = {};
  if (milestoneName) updateData.milestoneName = milestoneName.trim();
  if (status) updateData.status = status;
  if (price !== undefined) updateData.price = price;
  if (description !== undefined) updateData.description = description.trim();

  const milestone = await BudgetMilestone.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('projectId', 'title description');

  if (!milestone) {
    return next(new AppError('Budget milestone not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      milestone
    }
  });
});

// Delete budget milestone
const deleteBudgetMilestone = catchAsync(async (req, res, next) => {
  const milestone = await BudgetMilestone.findByIdAndDelete(req.params.id);

  if (!milestone) {
    return next(new AppError('Budget milestone not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get milestones by project ID
const getMilestonesByProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new AppError('Invalid project ID', 400));
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const features = new APIFeatures(
    BudgetMilestone.find({ projectId }),
    req.query,
    BudgetMilestone
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const milestones = await features.query;

  res.status(200).json({
    status: 'success',
    results: milestones.length,
    data: {
      milestones
    }
  });
});

// Get budget summary by project
const getBudgetSummaryByProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new AppError('Invalid project ID', 400));
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  console.log('Fetching budget summary for project:', projectId);

  const summary = await BudgetMilestone.getTotalBudgetByProject(projectId);

  if (!summary.length) {
    return res.status(200).json({
      status: 'success',
      data: {
        projectId,
        totalBudget: 0,
        completedBudget: 0,
        pendingBudget: 0,
        milestoneCount: 0
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      projectId,
      ...summary[0]
    }
  });
});

// Get milestones by status
const getMilestonesByStatus = catchAsync(async (req, res, next) => {
  const { projectId, status } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new AppError('Invalid project ID', 400));
  }

  // Validate status
  if (!['Pending', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
    return next(new AppError('Invalid status. Must be one of: Pending, In Progress, Completed, Cancelled', 400));
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const milestones = await BudgetMilestone.getMilestonesByStatus(projectId, status);

  res.status(200).json({
    status: 'success',
    results: milestones.length,
    data: {
      milestones
    }
  });
});

// Update milestone status
const updateMilestoneStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  if (!['Pending', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
    return next(new AppError('Invalid status. Must be one of: Pending, In Progress, Completed, Cancelled', 400));
  }

  const milestone = await BudgetMilestone.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  )
    .populate('projectId', 'title description');

  if (!milestone) {
    return next(new AppError('Budget milestone not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      milestone
    }
  });
});

module.exports = {
  createBudgetMilestone,
  getAllBudgetMilestones,
  getBudgetMilestone,
  updateBudgetMilestone,
  deleteBudgetMilestone,
  getMilestonesByProject,
  getBudgetSummaryByProject,
  getMilestonesByStatus,
  updateMilestoneStatus
};
