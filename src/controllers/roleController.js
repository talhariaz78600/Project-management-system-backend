const mongoose = require('mongoose');
const Role = require('../models/Role');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const joiError = require('../utils/joiError');
const { roleCreateSchema, roleUpdateSchema } = require('../utils/joi/roleValidation');

// Create a new role
const createRole = catchAsync(async (req, res, next) => {
  const { error } = roleCreateSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    const fieldErrors = joiError(error);
    return next(new AppError("Invalid role data", 400, { fieldErrors }));
  }

  // Check if role name already exists
  const existingRole = await Role.findOne({ name: req.body.name });
  if (existingRole) {
    return next(new AppError('Role name already exists', 400));
  }

  const role = await Role.create(req.body);
  return res.status(201).json({
    status: 'success',
    message: 'Role created successfully',
    data: role
  });
});

// Get a single role
const getRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid role ID', 400));
  }

  const role = await Role.findById(id);
  if (!role) {
    return next(new AppError('Role not found', 404));
  }

  return res.status(200).json({ 
    status: 'success', 
    data: role 
  });
});

// Get all roles with pagination and search
const getAllRoles = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;
  
  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  
  // Build match criteria
  const match = {};
  if (search) {
    match.name = { $regex: search, $options: 'i' };
  }

  const [total, roles] = await Promise.all([
    Role.countDocuments(match),
    Role.find(match)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions)
  ]);

  return res.status(200).json({
    status: 'success',
    total,
    results: roles.length,
    data: roles
  });
});

// Update a role
const updateRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid role ID', 400));
  }

  const { error } = roleUpdateSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    const fieldErrors = joiError(error);
    return next(new AppError("Invalid role data", 400, { fieldErrors }));
  }

  // Check if role name already exists (excluding current role)
  if (req.body.name) {
    const existingRole = await Role.findOne({ 
      name: req.body.name, 
      _id: { $ne: id } 
    });
    if (existingRole) {
      return next(new AppError('Role name already exists', 400));
    }
  }

  const role = await Role.findByIdAndUpdate(
    id, 
    req.body, 
    { new: true, runValidators: true }
  );
  
  if (!role) {
    return next(new AppError('Role not found', 404));
  }

  return res.status(200).json({ 
    status: 'success', 
    message: 'Role updated successfully',
    data: role 
  });
});

// Delete a role
const deleteRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid role ID', 400));
  }

  const role = await Role.findByIdAndDelete(id);
  
  if (!role) {
    return next(new AppError('Role not found', 404));
  }

  return res.status(200).json({ 
    status: 'success', 
    message: 'Role deleted successfully',
    data: null 
  });
});

// Get role names only (for dropdowns)
const getRoleNames = catchAsync(async (req, res, next) => {
  const roles = await Role.find({}).select('name permissions');
  
  return res.status(200).json({ 
    status: 'success', 
    data: roles 
  });
});

module.exports = {
  createRole,
  getRole,
  getAllRoles,
  updateRole,
  deleteRole,
  getRoleNames
};
