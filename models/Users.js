const { Schema, model } = require('mongoose');
const logger = require('../utils/logger');

const Posts = require('./Posts');
const Comments = require('./Comments');
const Likes = require('./Likes');

/**
 * Represents the schema for a user in the system.
 * @typedef {Object} UserSchema
 * @property {string} firstname - The user's first name (required)
 * @property {string} lastname - The user's last name (required)
 * @property {string} username - Unique identifier for the user (required)
 * @property {string} password - User's hashed password (required)
 * @property {string|null} profile_image - URL or path to user's profile image
 * @property {string|null} bio - User's biographical information
 * @property {Date} created_at - Timestamp of when the user was created
 * @property {Date} updated_at - Timestamp of when the user was last updated
 */
const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true // Store as a hashed value
    },
    profile_image: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

/**
* User schema cascading
*/
userSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Posts.deleteMany({ author: doc._id });
        await Comments.deleteMany({ author: doc._id });
        await Likes.deleteMany({ author: doc._id });

        logger.success('User and related posts/comments deleted');
    }
});

module.exports = model('User', userSchema);