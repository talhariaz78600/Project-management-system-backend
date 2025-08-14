// models/SubAdminRole.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subAdminRoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [
    {
      type: String, required: true, enum: ['dashboard', 'inbox', 'projectlist', 'admin', "associate", "role", "log", "notification", "settings", "profile"],

    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SubAdminRole', subAdminRoleSchema);
