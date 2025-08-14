const { Schema } = require('mongoose');
const User = require('./User');

const associateUserSchema = new Schema({
  assignedTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  experienceYears: { type: Number },
  bankInfo:{
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true }
  }

});

module.exports = User.discriminator('associateUser', associateUserSchema);
