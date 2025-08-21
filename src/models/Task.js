// models/Task.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Assigned', 'In Progress', 'Review', 'Completed', 'Pending','Review'],
    default: 'Assigned',
  },
  payment: {

    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    screenShot: { type: String }
  },
  approvedByManager: { type: Boolean, default: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date },
  budget: { type: Number, min: 0 },
  attachments: [{ type: String }], // URLs or paths to files
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

module.exports = mongoose.model('Task', taskSchema);
