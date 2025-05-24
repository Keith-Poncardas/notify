/**
 * Middleware function to authenticate routes by checking if a user is logged in
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Redirects to home if no user, otherwise calls next middleware
 */
const requireAuth = (req, res, next) => {
    if (!res.locals.user) {
        return res.redirect('/');
    }

    next();
};

module.exports = requireAuth;
