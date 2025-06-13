const { deletePost } = require("../../services/postService");
const { getUser } = require("../../services/userService");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");

/**
 * Deletes a post based on the provided ID from the request parameters.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the post to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the deleted post data
 * @throws {Error} Forwards any errors to the next middleware
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user || null;
    const userId = user ? user._id.toString() : 'guest';

    try {

        const post = await deletePost(req.params.id);

        if (!post) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete post',
                data: null
            });
        };

        const { username } = await getUser(userId);

        await deleteKeysByPattern(`posts:page=*:limit=*:user=${userId}`);
        await deleteKeysByPattern(`userPosts:${username}:page=*:limit=*:user=${userId}`);
        await deleteKeysByPattern(`userPostsLikes:${username}:page=*:limit=*:user=${userId}`);

        res.status(201).json({
            success: true,
            message: 'Post deleted successfully',
            data: post
        });

    } catch (err) {
        next(err);
    }
};