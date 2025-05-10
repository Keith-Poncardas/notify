/**
 * Custom error class for handling operational errors in the Notify application
 * @class NotifyError
 * @extends Error
 * @param {string} message - Error message to be displayed
 * @param {number} statusCode - HTTP status code associated with the error
 * @property {boolean} isOperational - Indicates if error is an operational error
 */
class NotifyError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
};

module.exports = { NotifyError };