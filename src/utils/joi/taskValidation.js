const Joi = require("joi");

const taskSchemaValidation = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  status: Joi.string().valid('Pending', 'Assigned', 'In Progress', 'Completed'),
  assignedTo: Joi.string().hex().length(24),
  deadline: Joi.date(),
  projectId: Joi.string().hex().length(24),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
  budget: Joi.number().min(0),
  attachments: Joi.array().items(Joi.string().uri())
})
// .fork(['title', 'description', 'status', 'assignedTo', 'deadline', 'projectId'], schema => schema.required());

module.exports={taskSchemaValidation}