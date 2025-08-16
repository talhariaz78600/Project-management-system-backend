const { Schema } = require('mongoose');
const User = require('./User');

const associateUserSchema = new Schema({
  assignedTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  experienceYears: { type: Number },
  bankInfo:{
    accountNumber: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String}
  }

});

module.exports = User.discriminator('associateUser', associateUserSchema);
