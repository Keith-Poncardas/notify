const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {Object} user - The user object containing authentication details
 * @param {string} user._id - The unique identifier of the user
 * @param {string} user.username - The username of the user
 * @returns {string} JWT token string containing encoded user information
 * @throws {Error} If JWT_SECRET or JWT_EXPIRATION environment variables are not set
 */
const generateToken = ({ user }) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

module.exports = generateToken;