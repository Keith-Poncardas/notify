/**
 * Wraps an async function to automatically catch errors and pass them to Express error handler
 * @param {Function} fn - Async function to be wrapped
 * @returns {Function} Express middleware function that executes the wrapped async function
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = { catchAsync };