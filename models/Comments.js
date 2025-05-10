const { Schema, model } = require('mongoose');

/**
 * Schema definition for Comments
 * @typedef {Object} CommentSchema
 * @property {ObjectId} author - Reference to the User model (user.id) who created the comment
 * @property {ObjectId} post - Reference to the Post model (post.id) that this comment belongs to
 * @property {string} content - The actual text content of the comment
 * @property {Date} created_at - Timestamp when the comment was created (automatically managed)
 */
const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to users.id
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post', // Refers to posts.id
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = model('Comment', commentSchema);
