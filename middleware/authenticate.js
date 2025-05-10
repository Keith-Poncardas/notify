const jwt = require('jsonwebtoken');
const { getUser } = require('../services/userService');

/**
 * Middleware to authenticate a user based on a JWT token stored in cookies.
 * If the token is missing or invalid, the user is redirected to the login page.
 * 
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} req.cookies - The cookies attached to the request.
 * @param {string} req.cookies.token - The JWT token used for authentication.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 * 
 * @throws {Error} If the JWT token is invalid or expired.
 */
const authenticateUser = async (req, res, next) => {

    /**
    * Extract the session cookie token from the request object
    */
    const token = req.cookies.token;

    if (token) {
        try {

            /**
            * Verify if the token is valid, along with JWT_SECRET
            */
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await getUser(decoded.id);
            res.locals.user = user;

        } catch (err) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }

    next();
};

module.exports = authenticateUser;