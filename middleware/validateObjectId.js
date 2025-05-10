const mongoose = require('mongoose');
const { NotifyError } = require('../utils/notifyError');

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