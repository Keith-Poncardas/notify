const { deleteComment } = require("../../services/commentService");
const redis = require('../../config/redisClient');

/**
 * Handles the deletion of a comment by ID.
 * @async
 * @param {Object} req - Express request object containing the comment ID in params.
 * @param {Object} res - Express response object to send the deletion result.
 * @param {Function} next - Express next middleware function for error handling.
 * @throws {Error} - Forwards any errors to the next middleware.
 */
module.exports = async (req, res, next) => {
    try {
        const comment = await deleteComment(req.params.id);
        await redis.del(`comments:${comment.post._id}`);

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete comment',
                data: comment
            });
        };

        res.status(201).json({
            success: true,
            message: 'Comment deleted successfully',
            data: comment
        });
    } catch (err) {
        next(err);
    }
};
