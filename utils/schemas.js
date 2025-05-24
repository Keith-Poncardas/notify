const Joi = require('joi');

const signUpSchema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(25).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    profile_image: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    public_id: Joi.string().optional(),
    bio: Joi.string().optional()
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const editProfileSchema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(25).required(),
    profile_image: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    public_id: Joi.string().optional(),
    bio: Joi.string().optional().allow('', null)
});

module.exports = { signUpSchema, loginSchema, editProfileSchema };