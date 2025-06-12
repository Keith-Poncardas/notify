const { filter } = require("compression");
const Likes = require("../models/Likes");
const Users = require("../models/Users");
const { NotifyError } = require("../utils/notifyError");

/**
 * Retrieves all posts that a user has liked
 * @param {string} username - The username of the user whose liked posts are being retrieved
 * @returns {Promise<Array>} Array of post objects that the user has liked
 * @throws {NotifyError} If user is not found or any other error occurs during the process
 */
const getUsersLikePosts = async (query = {}, username, limit = 15) => {
    try {
        if (!query) throw new NotifyError('Missing Query');

        const { pageNumber = 1 } = query;
        const currentPage = parseInt(pageNumber);

        const user = await Users.findOne({ username });
        if (!user) throw new NotifyError("User not found");

        const likes = await Likes.find({ author: user._id })
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate({
                path: 'post',
                populate: {
                    path: 'author', // this populates post.author
                    select: 'firstname lastname username profile_image' // optional, for optimization
                }
            })
            .lean();


        const totalDocuments = await Likes.countDocuments({ author: user._id });
        const totalPages = Math.ceil(totalDocuments / limit);

        const likedPosts = likes
            .filter(like => like.post && like.post._id) // skip invalid or empty post references
            .map(like => like.post);
        // extract post data

        return { likedPosts, currentPage, totalDocuments, totalPages };
    } catch (err) {
        throw new NotifyError(err.message);
    }
};


/**
 * Retrieves all likes associated with a specific post
 * @param {string|ObjectId} postId - The ID of the post to get likes for
 * @returns {Promise<Array>} A promise that resolves to an array of like objects
 * @throws {NotifyError} If there's an error retrieving the likes
 */
const getAllLikesById = async (postId) => {
    try {
        const likes = await Likes.find({ post: postId }).lean().populate('author');
        return likes;
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

/**
 * Checks if a user has liked a specific post
 * @param {string} userId - The ID of the user
 * @param {string} postId - The ID of the post
 * @returns {Promise<Object|null>} The like document if found, null otherwise
 * @throws {NotifyError} When required fields are missing or other errors occur
 */
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

/**
 * Counts the number of likes for a specific post
 * @param {string} postId - The ID of the post to count likes for
 * @returns {Promise<number>} The total number of likes for the post
 * @throws {NotifyError} When postId is missing or database operation fails
 */
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
    getAllLikesById,
    getUsersLikePosts
};