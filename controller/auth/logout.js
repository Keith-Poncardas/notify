const { getUser } = require('../../services/userService');
const deleteKeysByPattern = require('../../utils/deleteKeysByPattern');

/**
 * Logs out the user by clearing the authentication token cookie
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void} - Returns a 200 status with logout confirmation message
 */
module.exports = async (req, res) => {
    const id = res.locals.user;

    const user = await getUser(id);
    console.log(user);

    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    });

    await deleteKeysByPattern('posts:page=*:limit=*');
    await deleteKeysByPattern(`userPosts:${user.username}:page=*:limit=*:user=${user._id}`);


    res.status(201).json({
        success: true,
        message: 'Logged Out',
    });
};