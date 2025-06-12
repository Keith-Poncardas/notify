const { findLike, deleteLike, createLike, countLike } = require("../../services/likeService");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");
const redis = require('../../config/redisClient');
const { getUser, getUserByUsername } = require("../../services/userService");

/**
 * Toggles like/unlike status for a post and returns updated like information
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.postId - ID of the post to toggle like status
 * @param {Object} res - Express response object
 * @param {Object} res.locals.user - Authenticated user information
 * @param {string} res.locals.user._id - ID of the authenticated user
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing:
 *   - liked {boolean} - New like status (true if liked, false if unliked)
 *   - totalLikes {number} - Updated total number of likes for the post
 * @throws {Error} Forwards any errors to the next middleware
 */
module.exports = async (req, res, next) => {
    const { postId } = req.body;
    const userId = res.locals.user._id.toString();

    try {
        const existingLike = await findLike(userId, postId);

        if (existingLike) {
            await deleteLike(existingLike._id);
        } else {
            await createLike(userId, postId);
        }

        const user = await getUser(userId);
        const username = user.username;
        console.log(username);

        await deleteKeysByPattern('posts:page=*:limit=*');
        await deleteKeysByPattern(`userPosts:${username}:page=*:limit=*`);

        const likeCount = await countLike(postId);

        res.status(201).json({
            success: true,
            liked: !existingLike,
            totalLikes: likeCount
        });

    } catch (err) {
        next(err);
    }
};