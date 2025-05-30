const { editUser } = require('../../services/userService');
const uploadToCloudinary = require('../../utils/claudinaryUpload');
const redis = require('../../config/redisClient');

/**
 * Updates user profile information
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {string} req.body.userId - ID of the user to be updated
 * @param {Object} res - Express response object 
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the updated user profile
 * @throws {Error} Forwards any errors to Express error handler
 */
module.exports = async (req, res, next) => {
    const userId = res.locals.user._id.toString();

    try {
        const { firstname, lastname, username, bio } = req.body;
        const profileData = { userId, firstname, lastname, username, bio };

        await redis.del(`userProfile:${username}`);

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'Profile Image');
            profileData.profile_image = result.secure_url;
            profileData.public_id = result.public_id;
        };

        const editedProfile = await editUser(userId, profileData);
        res.json(editedProfile);
    } catch (err) {
        next(err);
    }
};