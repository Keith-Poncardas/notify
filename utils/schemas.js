const Joi = require('joi');

/**
 * Schema for user sign-up validation
 * @typedef {Object} SignUpSchema
 * @property {string} firstname - User's first name (3-30 characters)
 * @property {string} lastname - User's last name (3-30 characters)
 * @property {string} username - Username containing at least one dot (3-25 characters, allows letters, numbers, dots, hyphens, underscores)
 * @property {string} password - Password consisting of alphanumeric characters (3-30 characters)
 * @property {string} [profile_image] - Optional URL for user's profile image (must be http/https)
 * @property {string} [public_id] - Optional public identifier
 * @property {string} [bio] - Optional user biography
 */
const signUpSchema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    username: Joi.string()
        .pattern(/^(?=.*\.)[a-zA-Z0-9._-]{3,25}$/)
        .required()
        .messages({
            'string.pattern.base': 'Username must be 3-25 characters and include at least one dot (.) with only letters, numbers, dots, hyphens, or underscores.',
        }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    profile_image: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    public_id: Joi.string().optional(),
    bio: Joi.string().optional()
});

/**
 * Schema for validating login credentials.
 * @typedef {Object} LoginSchema
 * @property {string} username - The username for authentication (required)
 * @property {string} password - The password for authentication (required)
 */
const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

/**
 * @typedef {Object} EditProfileSchema
 * Validation schema for user profile editing
 * @property {string} firstname - User's first name (3-30 characters)
 * @property {string} lastname - User's last name (3-30 characters)
 * @property {string} username - Username with specific pattern requirements:
 *                              - Must be 3-25 characters long
 *                              - Must contain at least one dot (.)
 *                              - Can only contain letters, numbers, dots, hyphens, or underscores
 * @property {string} [profile_image] - Optional URL for profile image (must be http/https)
 * @property {string} [public_id] - Optional public identifier
 * @property {string} [bio] - Optional user biography (can be empty or null)
 */
const editProfileSchema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    username: Joi.string()
        .pattern(/^(?=.*\.)[a-zA-Z0-9._-]{3,25}$/)
        .required()
        .messages({
            'string.pattern.base': 'Username must be 3-25 characters and include at least one dot (.) with only letters, numbers, dots, hyphens, or underscores.',
        }),
    profile_image: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    public_id: Joi.string().optional(),
    bio: Joi.string().optional().allow('', null)
});

module.exports = { signUpSchema, loginSchema, editProfileSchema };