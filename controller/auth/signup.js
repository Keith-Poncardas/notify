const { createUser, getUser } = require("../../services/userService");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");
const generateToken = require("../../utils/generateToken");

/**
 * Creates a new user and generates an authentication token
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Promise that resolves when user is created and token is set
 * @throws {NotifyError} - Throws error if user creation fails
 */
module.exports = async (req, res, next) => {

    try {
        const user = await createUser({ userData: req.body });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username already exist',
                data: user
            });
        };

        const token = generateToken({ user });
        res.cookie('token', token, { httpOnly: false });

        await deleteKeysByPattern('posts:page=*:limit=*');
        await deleteKeysByPattern('users:page=*:limit=*');

        res.status(201).json({
            success: true,
            message: `Welcome to notify @${user.username}!`,
            data: user
        });

    } catch (err) {
        next(err);
    };
};