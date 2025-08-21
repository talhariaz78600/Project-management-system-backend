const Joi = require("joi");

const taskSchemaValidation = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  status: Joi.string().valid('Pending', 'Assigned', 'In Progress', 'Completed','Review'),
  assignedTo: Joi.string().hex().length(24),
  deadline: Joi.date(),
  projectId: Joi.string().hex().length(24),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
  budget: Joi.number().min(0),
  payment: Joi.object({
    status: Joi.string().valid('Pending', 'Completed').default('Pending'),
    screenShot: Joi.string().uri()
  }),
  approvedByManager: Joi.boolean().default(false), 
  attachments: Joi.array().items(Joi.string().uri())
})

module.exports={taskSchemaValidation}