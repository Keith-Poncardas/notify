/**
 * Centralized error handling middleware for Express applications.
 * @param {Error} err - The error object caught by Express
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void} Sends error response to client
 * @description Handles errors by extracting status code and message from the error object.
 * If status code is not provided, defaults to 500. If message is not provided, defaults to 'Internal Server Error'.
 */
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (!statusCode) statusCode = 500;
    if (!message) message = 'Internal Server Error';

    res.render('error/404', { statusCode, message });
};

module.exports = { errorHandler };