const Joi = require('joi');

const availablePermissions = [
  'dashboard', 
  'inbox', 
  'projectlist', 
  'admin', 
  'associate', 
  'role', 
  'log', 
  'notification', 
  'settings', 
  'profile'
];

const base = {
  name: Joi.string().trim().min(3).max(50),
  permissions: Joi.array().items(
    Joi.string().valid(...availablePermissions)
  ).min(1)
};

exports.roleCreateSchema = Joi.object(base).fork(
  ['name', 'permissions'], s => s.required()
);

exports.roleUpdateSchema = Joi.object(base);
