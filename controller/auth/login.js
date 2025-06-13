const { loginUser } = require("../../services/userService");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");
const generateToken = require("../../utils/generateToken");

/**
 * Handles user login authentication and session creation
 * @param {Object} req - Express request object containing user credentials in the body
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.username - Username for authentication
 * @param {string} req.body.password - Password for authentication
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} - Returns JSON response with user data or error
 * @throws {Error} - Forwards any errors to error handling middleware
 */
module.exports = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await loginUser(username, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username and password. Try again.',
                data: user
            });
        };

        await deleteKeysByPattern(`posts:page=*:limit=*:user=${username}`);
        await deleteKeysByPattern(`userPosts:${username}:page=*:limit=*:user=${user._id}`);
        await deleteKeysByPattern(`userPostsLikes:${username}:page=*:limit=*:user=${user._id}`);

        const token = generateToken({ user });
        res.cookie('token', token, { httpOnly: true });
        res.json(user);

    } catch (err) {
        next(err);
    };
};