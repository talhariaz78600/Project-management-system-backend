const Joi = require("joi");

const paymentMilestoneSchema = Joi.object({
  name: Joi.string().trim().required(),
  status: Joi.string().valid('Potential', 'Completed').default('Potential'),
  screenShot: Joi.string().uri().allow(''),
  price: Joi.number().min(0).required()
});

const taskSchemaValidation = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  status: Joi.string().valid('Potential', 'Assigned', 'In Progress', 'Completed','In Review'),
  assignedTo: Joi.string().hex().length(24),
  deadline: Joi.date(),
  projectId: Joi.string().hex().length(24),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
  budget: Joi.number().min(0),
  payment: Joi.array().items(paymentMilestoneSchema),
  approvedByManager: Joi.boolean().default(false), 
  attachments: Joi.array().items(Joi.string().uri())
});

const milestoneValidation = Joi.object({
  name: Joi.string().trim().required(),
  status: Joi.string().valid('Potential', 'Completed'),
  screenShot: Joi.string().uri().allow(''),
  price: Joi.number().min(0).required()
});

const updateMilestoneValidation = Joi.object({
  name: Joi.string().trim(),
  status: Joi.string().valid('Potential', 'Completed'),
  screenShot: Joi.string().uri().allow(''),
  price: Joi.number().min(0),
  milestoneId: Joi.string().hex().length(24)
});

module.exports = {
  taskSchemaValidation,
  paymentMilestoneSchema,
  milestoneValidation,
  updateMilestoneValidation
};