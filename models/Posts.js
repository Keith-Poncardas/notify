const { Schema, model } = require('mongoose');
const logger = require('../utils/logger');

const Comments = require('./Comments');
const Likes = require('./Likes');

const cloudinary = require('cloudinary').v2;

/**
 * Schema definition for Posts
 * @typedef {Object} PostSchema
 * @property {ObjectId} author - Reference to User model, represents post creator
 * @property {string} title - Title of the post
 * @property {string} description - Content/description of the post
 * @property {string|null} post_image - URL/path to post image, null if no image
 * @property {Date} created_at - Timestamp when post was created
 * @property {Date} updated_at - Timestamp when post was last updated
 */
const postSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true
    },
    description: {
        type: String,
        required: null
    },
    post_image: {
        type: String,
        default: null
    },
    public_id: {
        type: String,
        default: null
    },
    type: {
        type: String,
        enum: ['post', 'profile'],
        default: 'post'
    }
}, {
    timestamps: true
});

/**
* Post schema cascading
*/
postSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Likes.deleteMany({ author: doc._id });
        await Comments.deleteMany({ author: doc._id });

        logger.success('Post and related likes/comments deleted');
    }
});

postSchema.post('findOneAndDelete', async function (doc) {
    if (doc?.public_id) {
        try {
            console.log('Attempting to delete image with public_id:', doc.public_id); // for debugging
            const result = await cloudinary.uploader.destroy(doc.public_id);
            console.log('Cloudinary response:', result);
        } catch (error) {
            console.error('Failed to delete image from Cloudinary:', error.message || error);
        }
    } else {
        console.warn('No public_id found in the deleted document.');
    }
});


module.exports = model('Post', postSchema);