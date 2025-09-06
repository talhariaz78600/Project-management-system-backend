      const mongoose = require('mongoose');
      const Task = require('../models/Task');
      const Project = require('../models/Project');
      const User = require('../models/users/User');
      const Notification = require('../models/Notification');
      const AppError = require('../utils/appError');
      const catchAsync = require('../utils/catchAsync');
      const { taskSchemaValidation } = require('../utils/joi/taskValidation');
      const joiError = require('../utils/joiError');
      const Email = require('../utils/email');
      const { getIO } = require('../utils/socket');

      // Create a new task (Manager only)
      const createTask = catchAsync(async (req, res, next) => {
        const { title, description, status, priority, projectId, assignedTo, deadline, budget, attachments } = req.body;
        const { error } = taskSchemaValidation.fork(['title', 'description', 'status', 'priority', 'projectId', 'assignedTo', 'deadline', 'budget'], schema => schema.required()).validate(req.body,{
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: true
        });

        if (error) {
          const errorFields = joiError(error);
          return next(new AppError("Invalid task data", 400, { fieldErrors: errorFields }));
        }

        // Validate project and user existence
        if (!mongoose.Types.ObjectId.isValid(projectId)) return next(new AppError('Invalid project ID', 400));
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) return next(new AppError('Invalid user ID', 400));

        const project = await Project.findById(projectId);
        if (!project) return next(new AppError('Project not found', 404));

        const user = await User.findById(assignedTo);
        if (!user) return next(new AppError('Assigned user not found', 404));

        const task = await Task.create({
          title,
          description,
          status,
          priority,
          projectId,
          assignedTo,
          deadline,
          attachments,
          budget
        });

        // Send notification to assigned user
        try {
          // Create notification in database
          await Notification.create({
            recipient: assignedTo,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${title}"`,
            link: `/tasks/${task._id}`
          });

          // Send socket notification
          const io = getIO();
          if (io) {
            io.to(assignedTo.toString()).emit('notification', {
              title: 'New Task Assigned',
              message: `You have been assigned a new task: "${title}"`,
              link: `/tasks/${task._id}`,
              createdAt: new Date()
            });
          }

          // Send email notification
          const emailInstance = new Email(user.email, user.firstName, `/tasks/${task._id}`);
          await emailInstance.sendTextEmail(
            'New Task Assigned', 
            `Hello ${user.firstName},\n\nYou have been assigned a new task: "${title}"\n\nDeadline: ${deadline ? new Date(deadline).toDateString() : 'Not specified'}\n\nPlease check your dashboard for more details.`, 
            {}
          );
        } catch (notificationError) {
          console.error('Error sending task assignment notification:', notificationError);
          // Don't fail the entire request if notification fails
  }

  res.status(201).json({ status: 'success', data: task });
});

// Get all tasks (Manager: filter by project, assignedTo, status, search, pagination)
const getTasks = catchAsync(async (req, res, next) => {
  const {  assignedTo, status, search = '' } = req.query;
    const { projectId } = req.params;
 
  const filter = { projectId };

  if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) filter.assignedTo = assignedTo;
  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate('assignedTo', 'profilePicture firstName lastName email')
  ]);

  res.status(200).json({
    status: 'success',
    total,
    results: tasks.length,
    data: tasks
  });
});
const getTasksbyAssignedUser = catchAsync(async (req, res, next) => {
  const {   status, search = '', page = 1, limit = 100 } = req.query;
    const id=req.user._id;
  const skip = (page - 1) * limit;
  const filter = { assignedTo: id };

  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate('projectId', 'title')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
  ]);

  res.status(200).json({
    status: 'success',
    total,
    results: tasks.length,
    data: tasks
  });
});

// Get single task
const getTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid task ID', 400));

  const task = await Task.findById(id)
    .populate('assignedTo', 'firstName lastName email')
    .populate('projectId', 'name');
  if (!task) return next(new AppError('Task not found', 404));

  res.status(200).json({ status: 'success', data: task });
});

// Update task status by assigned user (Associate User)
const updateTaskStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid task ID', 400));
  if (!status) return next(new AppError('Status is required', 400));

  // Find the task and verify it's assigned to the current user
  const currentTask = await Task.findOne({ _id: id, assignedTo: userId })
    .populate('projectId')
    .populate('assignedTo');
    
  if (!currentTask) return next(new AppError('Task not found or not assigned to you', 404));

  // Update the task status
  const task = await Task.findByIdAndUpdate(
    id, 
    { status, updatedAt: new Date() }, 
    { new: true, runValidators: true }
  ).populate('projectId').populate('assignedTo');

  // If status changed to completed, send notifications
    try {
      // Find admin and project manager to notify
      const [admin] = await Promise.all([
        User.findOne({ role: 'admin' })
      ]);

      const recipients = [];
      if (admin) recipients.push(admin);
      // if (project?.manager && project.manager._id.toString() !== admin?._id.toString()) {
      //   recipients.push(project.manager);
      // }

      // Send notifications to admin and manager
      for (const recipient of recipients) {
        if (!recipient) continue;

        // Create notification in database
        await Notification.create({
          recipient: recipient._id,
          title: `Task ${status}`,
          message: `Task "${task.title}" has been marked as ${status.toLowerCase()} by ${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
          link: `/tasks/${task._id}`
        });

        // Send socket notification
        const io = getIO();
        if (io) {
          io.to(recipient._id.toString()).emit('notification', {
            title: `Task ${status}`,
            message: `Task "${task.title}" has been marked as ${status.toLowerCase()} by ${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            link: `/tasks/${task._id}`,
            createdAt: new Date()
          });
        }

        // Send email notification
        const emailInstance = new Email(recipient.email, recipient.firstName, `/tasks/${task._id}`);
        await emailInstance.sendTextEmail(
          `Task ${status}`, 
          `Hello ${recipient.firstName},\n\nTask "${task.title}" has been marked as ${status.toLowerCase()} by ${task.assignedTo.firstName} ${task.assignedTo.lastName}.\n\nProject: ${task.projectId.title}\n\nPlease review the task for approval.`, 
          {}
        );
      }
    } catch (notificationError) {
      console.error('Error sending task completion notification:', notificationError);
      // Don't fail the entire request if notification fails
    }
  

  res.status(200).json({ 
    status: 'success', 
    data: task,
    message: 'Task status updated successfully'
  });
});

// Update task (Manager only)
const updateTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid task ID', 400));

  // Get the current task to compare status changes
  const currentTask = await Task.findById(id).populate('projectId').populate('assignedTo');
  if (!currentTask) return next(new AppError('Task not found', 404));

  const update = { ...req.body, updatedAt: new Date() };
  const task = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate('projectId')
    .populate('assignedTo');

  // Check if status was changed to completed
  const wasCompleted = currentTask.status === 'Completed';
  const isNowCompleted = update.status === 'Completed';
  
  if (!wasCompleted && isNowCompleted) {
    try {
      // Find admin and project manager to notify
      const [admin, project] = await Promise.all([
        User.findOne({ role: 'admin' }),
        Project.findById(task.projectId._id).populate('manager')
      ]);

      const recipients = [];
      if (admin) recipients.push(admin);
      if (project?.manager && project.manager._id.toString() !== admin?._id.toString()) {
        recipients.push(project.manager);
      }

      // Send notifications to admin and manager
      for (const recipient of recipients) {
        if (!recipient) continue;

        // Create notification in database
        await Notification.create({
          recipient: recipient._id,
          title: 'Task Completed',
          message: `Task "${task.title}" has been marked as completed by ${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
          link: `/tasks/${task._id}`
        });

        // Send socket notification
        const io = getIO();
        if (io) {
          io.to(recipient._id.toString()).emit('notification', {
            title: 'Task Completed',
            message: `Task "${task.title}" has been marked as completed by ${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            link: `/tasks/${task._id}`,
            createdAt: new Date()
          });
        }

        // Send email notification
        const emailInstance = new Email(recipient.email, recipient.firstName, `/tasks/${task._id}`);
        await emailInstance.sendTextEmail(
          'Task Completed', 
          `Hello ${recipient.firstName},\n\nTask "${task.title}" has been marked as completed by ${task.assignedTo.firstName} ${task.assignedTo.lastName}.\n\nProject: ${task.projectId.name}\n\nPlease review the task for approval.`, 
          {}
        );
      }
    } catch (notificationError) {
      console.error('Error sending task completion notification:', notificationError);
      // Don't fail the entire request if notification fails
    }
  }

  res.status(200).json({ status: 'success', data: task });
});

const getDeveloperTaskStats = catchAsync(async (req, res, next) => {
  const developerId = req.user._id;

  const [total, pending, inProgress, completed, onHold] = await Promise.all([
    Task.countDocuments({ assignedTo: developerId }),
    Task.countDocuments({ assignedTo: developerId, status: 'Pending' }),
    Task.countDocuments({ assignedTo: developerId, status: 'In Progress' }),
    Task.countDocuments({ assignedTo: developerId, status: 'Completed' }),
    Task.countDocuments({ assignedTo: developerId, status: 'On Hold' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalTasks: total,
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed,
      onHoldTasks: onHold,
    }
  });
});

// Delete task (Manager only)
const   deleteTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid task ID', 400));

  const task = await Task.findByIdAndDelete(id);
  if (!task) return next(new AppError('Task not found', 404));

  res.status(200).json({ status: 'success', data: null });
});

const approvedByManager = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { approvedByManager } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid task ID', 400));

  const task = await Task.findByIdAndUpdate(id, { approvedByManager }, { new: true });
  // Send notification to assigned user about approval status change
  try {
    const assignedUser = await User.findById(task.assignedTo);
    if (assignedUser) {
      const approvalMessage = approvedByManager 
        ? `Your task "${task.title}" has been approved by the manager`
        : `Your task "${task.title}" approval has been revoked by the manager`;

      // Create notification in database
      await Notification.create({
        recipient: task.assignedTo,
        title: 'Task Approval Update',
        message: approvalMessage,
        link: `/tasks/${task._id}`
      });

      // Send socket notification
      const io = getIO();
      if (io) {
        io.to(task.assignedTo.toString()).emit('notification', {
          title: 'Task Approval Update',
          message: approvalMessage,
          link: `/tasks/${task._id}`,
          createdAt: new Date()
        });
      }

      // Send email notification
      const emailInstance = new Email(assignedUser.email, assignedUser.firstName, `/tasks/${task._id}`);
      await emailInstance.sendTextEmail(
        'Task Approval Update',
        `Hello ${assignedUser.firstName},\n\n${approvalMessage}.\n\nPlease check your dashboard for more details.`,
        {}
      );
    }
  } catch (notificationError) {
    console.error('Error sending task approval notification:', notificationError);
    // Don't fail the entire request if notification fails
  }
  if (!task) return next(new AppError('Task not found', 404));

  res.status(200).json({ status: 'success', data: task ,message: 'Task approval status updated successfully'});
});


const getTaskCompletedByManagerForAUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const tasks = await Task.find({ assignedTo: userId, status: 'Completed', approvedByManager: true });
  res.status(200).json({ status: 'success', data: tasks });
});

const updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, screenShot } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid task ID', 400));

  const task = await Task.findByIdAndUpdate(id, { payment: { status, screenShot } }, { new: true });
  if (!task) return next(new AppError('Task not found', 404));

  res.status(200).json({ status: 'success', data: task });
});

// Associate User Dashboard Analytics - Single comprehensive API
const getAssociateUserAnalytics = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  // Get full current year data
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st of current year
  const endDate = new Date(currentYear, 11, 31); // December 31st of current year

  // Get task status counts for pie chart
  const statusCounts = await Task.aggregate([
    { $match: { assignedTo: userId } },
    {
      $group: {
        _id: null,
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        onHold: { $sum: { $cond: [{ $eq: ['$status', 'On Hold'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    }
  ]);

  // Get monthly task completion and earnings for current year
  const monthlyProgress = await Task.aggregate([
    {
      $match: {
        assignedTo: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        tasksCompleted: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        totalEarnings: { 
          $sum: { 
            $cond: [
              { $eq: ['$status', 'Completed'] }, 
              '$budget', 
              0 
            ] 
          } 
        },
        totalTasks: { $sum: 1 }
      }
    }
  ]);

  // Create full year data with month names and 0 for missing months
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fullYearData = monthNames.map((monthName, index) => {
    const monthNumber = index + 1;
    const monthData = monthlyProgress.find(item => item._id === monthNumber);
    
    return {
      month: monthName,
      monthNumber,
      tasksCompleted: monthData ? monthData.tasksCompleted : 0,
      totalEarnings: monthData ? monthData.totalEarnings : 0,
      totalTasks: monthData ? monthData.totalTasks : 0
    };
  });

  // Get monthly task completion by month for bar chart
  const taskCompletionByMonth = await Task.aggregate([
    {
      $match: {
        assignedTo: userId,
        status: 'Completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        tasksCompleted: { $sum: 1 }
      }
    }
  ]);

  // Create full year completion data with month names
  const fullYearCompletionData = monthNames.map((monthName, index) => {
    const monthNumber = index + 1;
    const monthData = taskCompletionByMonth.find(item => item._id === monthNumber);
    
    return {
      month: monthName,
      monthNumber,
      tasksCompleted: monthData ? monthData.tasksCompleted : 0
    };
  });

  // Get project distribution
  const projectDistribution = await Task.aggregate([
    { $match: { assignedTo: userId } },
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },
    {
      $group: {
        _id: '$project._id',
        projectName: { $first: '$project.name' },
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        totalBudget: { $sum: '$budget' }
      }
    },
    {
      $addFields: {
        completionRate: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
      }
    },
    { $sort: { totalTasks: -1 } }
  ]);

  const result = {
    year: currentYear,
    taskStatusCounts: statusCounts[0] || { pending: 0, inProgress: 0, onHold: 0, completed: 0, total: 0 },
    monthlyTaskCompletionAndEarnings: fullYearData,
    taskCompletionByMonth: fullYearCompletionData,
    projectDistribution
  };

  res.status(200).json({ status: 'success', data: result });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksbyAssignedUser,
  getDeveloperTaskStats,
  approvedByManager,
  updatePaymentStatus,
  getTaskCompletedByManagerForAUser,
  getAssociateUserAnalytics
};