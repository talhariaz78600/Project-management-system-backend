const { Schema } = require('mongoose');
const User = require('./User');

const SubAdminSchema = new Schema({
  roleId: { type: Schema.Types.ObjectId, ref: 'SubAdminRole' },
});

module.exports = User.discriminator('subAdmin', SubAdminSchema);
