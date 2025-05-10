const { NotifyError } = require('./notifyError');


/**
 * Middleware function to handle 404 Not Found errors
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @throws {BookifyError} - Throws a BookifyError with 404 status code
 */
const pageNotFound = (req, res, next) => {
    next(new NotifyError('Not found', 404));
};

module.exports = { pageNotFound };