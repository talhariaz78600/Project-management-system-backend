const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const budgetMilestoneSchema = new Schema({
  milestoneName: {
    type: String,
    required: [true, 'Milestone name is required'],
    trim: true,
    maxlength: [100, 'Milestone name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
budgetMilestoneSchema.index({ projectId: 1, status: 1 });
budgetMilestoneSchema.index({ createdAt: -1 });

// Virtual to calculate total budget for a project
budgetMilestoneSchema.virtual('totalBudgetByProject', {
  ref: 'BudgetMilestone',
  localField: 'projectId',
  foreignField: 'projectId',
  justOne: false
});

// Pre-save middleware to update the updatedAt field
budgetMilestoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get total budget for a project
budgetMilestoneSchema.statics.getTotalBudgetByProject = function(projectId) {
  return this.aggregate([
    { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
    { 
      $group: {
        _id: '$projectId',
        totalBudget: { $sum: '$price' },
        completedBudget: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, '$price', 0]
          }
        },
        pendingBudget: {
          $sum: {
            $cond: [{ $ne: ['$status', 'Completed'] }, '$price', 0]
          }
        },
        milestoneCount: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get milestones by status
budgetMilestoneSchema.statics.getMilestonesByStatus = function(projectId, status) {
  return this.find({ projectId, status }).populate('projectId', 'title');
};

module.exports = mongoose.model('BudgetMilestone', budgetMilestoneSchema);
