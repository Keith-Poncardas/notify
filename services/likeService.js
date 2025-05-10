const Likes = require("../models/Likes");
const { NotifyError } = require("../utils/notifyError")

const getAllLikesById = async (postId) => {
    try {
        const likes = await Likes.find({ post: postId }).lean();
        return likes;
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const findLike = async (userId, postId) => {
    try {
        if (!userId || !postId) {
            throw new NotifyError('Missing required fields');
        };

        const checkLike = await Likes.findOne({ author: userId, post: postId });

        return checkLike;
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const countLike = async (postId) => {
    try {
        if (!postId) {
            throw new NotifyError('Missing required fields');
        };

        const likeCount = await Likes.countDocuments({ post: postId });

        return likeCount;
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

/**
 * Creates a new like record in the database
 * @param {string} authorId - The ID of the user who is creating the like
 * @param {string} postId - The ID of the post being liked
 * @returns {Promise<Object>} The created like object
 * @throws {NotifyError} When required fields are missing or if like creation fails
 */
const createLike = async (authorId, postId) => {
    try {

        /**
         * Validate all the required fields
         */
        if (!authorId || !postId) {
            throw new NotifyError('Missing required fields');
        };

        /**
         * Create a like record for a specific post
         */
        const like = await Likes.create({ author: authorId, post: postId });

        return like;
    } catch (err) {
        throw new NotifyError(`Failed to create like: ${err.message}`);
    }
};

/**
 * Deletes a like entry from the database based on the author's ID.
 * @async
 * @param {string} authorId - The ID of the author whose like should be deleted.
 * @throws {NotifyError} When authorId is missing or if deletion operation fails.
 * @returns {Promise<Object>} The deleted like object.
 */
const deleteLike = async (authorId) => {
    try {

        /**
         * Validate if post ID is missing
         */
        if (!authorId) throw new NotifyError('Missing postID');

        /**
         * Delete like record by the author ID
         */
        const like = await Likes.findByIdAndDelete(authorId);

        return like;
    } catch (err) {
        throw new NotifyError(`Failed to delete like: ${err.message}`);
    }
};

module.exports = {
    createLike,
    deleteLike,
    findLike,
    countLike,
    getAllLikesById
};