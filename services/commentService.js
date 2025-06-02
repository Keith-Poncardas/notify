const Comments = require("../models/Comments");
const { NotifyError } = require("../utils/notifyError");

/**
 * Retrieves all comments associated with a specific post
 * @param {string} postId - The ID of the post to fetch comments for
 * @returns {Promise<Array>} A promise that resolves to an array of comment documents
 * @throws {NotifyError} If there is an error retrieving the comments
 */
const getAllCommentsById = async (postId) => {
    try {
        const comments = await Comments.find({ post: postId }).lean().populate('author');
        return comments;
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

/**
 * Creates a new comment for a post
 * @param {string} authorId - The ID of the comment's author
 * @param {string} postId - The ID of the post being commented on
 * @param {object} commentData - Additional data for the comment
 * @returns {Promise<object>} The created comment object
 * @throws {NotifyError} When required fields are missing or comment creation fails
 */
const createComment = async (authorId, postId, commentData) => {
    try {

        /**
         *  Validate all the required fields
         */
        if (!authorId || !postId || !commentData) {
            throw new NotifyError('Missing required fields');
        };

        /**
         * Create comment to a post, with author ID
         */
        const comment = await Comments.create({ author: authorId, post: postId, ...commentData });

        return comment;

    } catch (err) {
        throw new NotifyError(`Failed to create comment: ${err.message}`);
    }
};

/**
 * Updates an existing comment with new data
 * @param {string} commentId - The ID of the comment to edit
 * @param {Object} commentData - The updated comment data
 * @returns {Promise<Object>} The updated comment object
 * @throws {NotifyError} When required fields are missing or update fails
 */
const editComment = async (commentId, commentData) => {
    try {

        /**
         *  Validate all the required fields
         */
        if (!commentId || !commentData) {
            throw new NotifyError('Missing required field');
        };

        /**
         * Find the comment by ID then update
         */
        const comment = await Comments.findByIdAndUpdate(commentId, commentData).populate('post');

        return comment;
    } catch (err) {
        throw new NotifyError(`Failed to edit comment: ${err.message}`);
    }
};

/**
 * Retrieves paginated comments for a specific post
 * @param {string} postId - The ID of the post to get comments for
 * @param {Object} query - Query parameters for pagination
 * @param {number} [query.page=1] - The page number to retrieve
 * @returns {Promise<Object>} Object containing:
 * @returns {Array} .comments - Array of comment documents
 * @returns {number} .totalDocuments - Total number of comments
 * @returns {number} .totalPages - Total number of pages
 * @returns {number} .currentPage - Current page number
 * @throws {NotifyError} When query is missing or comments retrieval fails
 */
const getComments = async (postId, query) => {
    try {

        /**
         * Validate if query is missing
         */
        if (!query) {
            throw new NotifyError('Missing Query');
        };

        const { page = 1 } = query;
        const limit = 15;
        const currentPage = parseInt(page);

        const totalDocuments = Comments.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);

        /**
         * Find all the comments by their post ID, then apply pagination.
         */
        const comments = await Comments.find({ post: postId })
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('author');

        return { comments, totalDocuments, totalPages, currentPage }
    } catch (err) {
        throw new NotifyError(`Failed to get comments: ${err.message}`);
    }
};

/**
 * Deletes a comment from the database based on its ID
 * @async
 * @param {string} commentId - The unique identifier of the comment to delete
 * @returns {Promise<Object>} The deleted comment object
 * @throws {NotifyError} When commentId is missing or deletion fails
 */
const deleteComment = async (commentId) => {
    try {

        /**
        * Validate if ID is missing
        */
        if (!commentId) throw new NotifyError('Missing ID');

        /**
        * Delete comment by ID
        */
        const comment = await Comments.findOneAndDelete({ _id: commentId }).populate('post');

        /**
         * Check if comment is not found
         */
        if (!comment) throw new NotifyError('Comment not found');

        return comment;
    } catch (err) {
        throw new NotifyError(`Failed to delete comment: ${err.message}`);
    }
};

module.exports = {
    createComment,
    editComment,
    getComments,
    deleteComment,
    getAllCommentsById
};