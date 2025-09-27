const Joi = require("joi");

const projectSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  status: Joi.string().valid('Potential', 'Ongoing', 'Completed','Pause'),
  members: Joi.array().items(Joi.string().hex().length(24)).default([]),
  managerId: Joi.string().hex().length(24),
  tasks: Joi.array().items(Joi.string().hex().length(24)).default([]),
  deadline: Joi.date(),
  docs: Joi.string().uri().trim(),
  budget: Joi.number().min(0)

})
// .fork(['title', 'description', 'status', 'clientId', 'managerId'], schema => schema.required());

module.exports = { projectSchema };