const { editPost } = require("../../services/postService");
const { getUser } = require("../../services/userService");
const uploadToCloudinary = require("../../utils/claudinaryUpload");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");

/**
 * Updates a post with new description and/or image
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.description - New post description
 * @param {Object} [req.file] - Uploaded file object
 * @param {Buffer} [req.file.buffer] - File buffer for image upload
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Post ID to edit
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the updated post
 * @throws {Error} Forwards any errors to the next middleware
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user || null;
    const userId = user ? user._id.toString() : 'guest';
    try {

        const { description } = req.body;
        const postEditData = { description };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            postEditData.post_image = result.secure_url;
            postEditData.public_id = result.public_id;
        };

        const post = await editPost(req.params.id, postEditData);

        if (!post) {
            return res.status(400).json({
                success: true,
                message: 'Failed to edit post',
                data: post
            });
        };

        const { username } = await getUser(userId);

        await deleteKeysByPattern(`posts:page=*:limit=*:user=${userId}`);
        await deleteKeysByPattern(`userPosts:${username}:page=*:limit=*:user=${userId}`);
        await deleteKeysByPattern(`userPostsLikes:${username}:page=*:limit=*:user=${userId}`);

        res.status(201).json({
            success: true,
            message: 'Post edited successfully',
            data: post
        });
    } catch (err) {
        next(err);
    }
};