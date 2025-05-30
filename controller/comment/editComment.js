const { editComment } = require("../../services/commentService");

/**
 * Updates a comment based on the provided ID and request body
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the comment to be edited
 * @param {Object} req.body - Request body containing comment update data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 * @throws {Error} Forwards any errors to the next middleware
 */
module.exports = async (req, res, next) => {
    try {
        const comment = await editComment(req.params.id, req.body);

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Failed to edit comment',
                data: comment
            });
        };

        res.status(201).json({
            success: true,
            message: 'Post edited successfully',
            data: comment
        });
    } catch (err) {
        next(err);
    }
};