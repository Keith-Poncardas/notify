const { Schema, model } = require('mongoose');

/**
 * Schema definition for the Like model
 * @typedef {Object} LikeSchema
 * @property {ObjectId} user - Reference to the User model, stores the user who created the like
 * @property {ObjectId} post - Reference to the Post model, stores the post that was liked
 * @property {Date} created_at - Timestamp of when the like was created
 */
const likeSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to users.id
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post', // Refers to posts.id
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false // No updated_at field in original SQL table
    }
});

module.exports = model('Like', likeSchema);