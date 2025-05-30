const { createComment } = require("../../services/commentService");

/**
 * Creates a new comment for a specified post
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the post to comment on
 * @param {Object} req.body - Request body containing comment data
 * @param {Object} res - Express response object
 * @param {Object} res.locals - Response local variables
 * @param {Object} res.locals.user - Authenticated user object
 * @param {string} res.locals.user._id - ID of the authenticated user
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} The created comment object
 * @throws {Error} If comment creation fails
 */
module.exports = async (req, res, next) => {
    const userId = res.locals.user._id.toString();
    try {
        const comment = await createComment(userId, req.params.id, req.body);

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create comment',
                data: comment
            });
        };

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment
        });
    } catch (err) {
        next(err);
    }
};