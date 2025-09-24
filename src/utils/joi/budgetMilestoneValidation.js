const Joi = require('joi');

// Validation schema for creating a budget milestone
const createBudgetMilestoneValidation = Joi.object({
  milestoneName: Joi.string()
    .required()
    .min(1)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Milestone name is required',
      'string.min': 'Milestone name must be at least 1 character long',
      'string.max': 'Milestone name cannot exceed 100 characters',
      'any.required': 'Milestone name is required'
    }),
  
  status: Joi.string()
    .valid('Pending', 'In Progress', 'Completed', 'Cancelled')
    .default('Pending')
    .messages({
      'any.only': 'Status must be one of: Pending, In Progress, Completed, Cancelled'
    }),
  
  price: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  
  projectId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Project ID must be a valid MongoDB ObjectId',
      'any.required': 'Project ID is required'
    }),
  
  description: Joi.string()
    .allow('')
    .max(500)
    .trim()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Validation schema for updating a budget milestone
const updateBudgetMilestoneValidation = Joi.object({
  milestoneName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Milestone name cannot be empty',
      'string.min': 'Milestone name must be at least 1 character long',
      'string.max': 'Milestone name cannot exceed 100 characters'
    }),
  
  status: Joi.string()
    .valid('Pending', 'In Progress', 'Completed', 'Cancelled')
    .messages({
      'any.only': 'Status must be one of: Pending, In Progress, Completed, Cancelled'
    }),
  
  price: Joi.number()
    .min(0)
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  
  description: Joi.string()
    .allow('')
    .max(500)
    .trim()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Validation schema for status update
const updateStatusValidation = Joi.object({
  status: Joi.string()
    .required()
    .valid('Pending', 'In Progress', 'Completed', 'Cancelled')
    .messages({
      'any.only': 'Status must be one of: Pending, In Progress, Completed, Cancelled',
      'any.required': 'Status is required'
    })
});

// Validation schema for query parameters
const queryValidation = Joi.object({
  status: Joi.string()
    .valid('Pending', 'In Progress', 'Completed', 'Cancelled')
    .messages({
      'any.only': 'Status must be one of: Pending, In Progress, Completed, Cancelled'
    }),
  
  projectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Project ID must be a valid MongoDB ObjectId'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  sort: Joi.string()
    .valid('createdAt', '-createdAt', 'price', '-price', 'milestoneName', '-milestoneName', 'status', '-status')
    .default('-createdAt')
    .messages({
      'any.only': 'Sort must be one of: createdAt, -createdAt, price, -price, milestoneName, -milestoneName, status, -status'
    }),
  
  fields: Joi.string()
    .messages({
      'string.base': 'Fields must be a string'
    })
});

module.exports = {
  createBudgetMilestoneValidation,
  updateBudgetMilestoneValidation,
  updateStatusValidation,
  queryValidation
};
