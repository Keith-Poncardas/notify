const { createPost } = require("../../services/postService");
const { getUser } = require("../../services/userService");
const uploadToCloudinary = require("../../utils/claudinaryUpload");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");

/**
 * Creates a new post for a user with optional image upload
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.description - Post description
 * @param {Object} [req.file] - Optional file upload
 * @param {Buffer} [req.file.buffer] - Buffer of uploaded file
 * @param {Object} res - Express response object
 * @param {Object} res.locals.user - Authenticated user information
 * @param {string} res.locals.user._id - User ID
 * @throws {NotifyError} Throws error if post creation fails
 * @returns {Promise<Object>} Created post object
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user || null;
    const userId = user ? user._id.toString() : 'guest';

    try {
        const { username } = await getUser(userId);

        const { description } = req.body;
        const postData = { description, type: 'post' };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            postData.post_image = result.secure_url;
            postData.public_id = result.public_id;
        };

        const post = await createPost(userId, postData);

        if (!post) {
            return res.status(400).json({
                success: true,
                message: 'Failed to create post',
                data: post
            });
        };

        await deleteKeysByPattern(`posts:page=*:limit=*:user=${userId}`);
        await deleteKeysByPattern(`userPosts:${username}:page=*:limit=*:user=${userId}`);

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: post
        });
    } catch (err) {
        next(err);
    }
};