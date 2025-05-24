const mongoose = require('mongoose');
const { NotifyError } = require('../utils/notifyError');

/**
 * Creates middleware to validate MongoDB ObjectId parameters in requests.
 * @param {string} [param='id'] - The parameter name to validate in req.params. Defaults to 'id'.
 * @returns {function} Express middleware function that validates the ObjectId.
 * @throws {NotifyError} Throws 400 error if the provided ID is not a valid MongoDB ObjectId.
 * @example
 * // Using default 'id' parameter
 * router.get('/:id', validateObjectId());
 * 
 * // Using custom parameter name
 * router.get('/:userId', validateObjectId('userId'));
 */
const validateObjectId = (param = 'id') => {
    return (req, res, next) => {
        const id = req.params[param];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new NotifyError(`Invalid ${param} provided.`, 400));
        };
        next();
    }
};

module.exports = validateObjectId;