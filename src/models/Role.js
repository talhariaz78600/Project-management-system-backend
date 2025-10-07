// models/SubAdminRole.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subAdminRoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [
    {
      permission:{type: String, required: true, enum: ['dashboard', 'inbox', 'projectlist', 'admin', "associate", "role", "log", "notification", "settings", "profile"]},
      subPermissions: [{type: String}]
    }
  ],
  createdAt: { type: Date, default: Date.now },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
});

module.exports = mongoose.model('SubAdminRole', subAdminRoleSchema);
