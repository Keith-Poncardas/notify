const joi = require('joi');

const validateSchema = (schema) => {
    return (req, res, next) => {
        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details[0].message;
            return res.status(400).json({ error: errorMessage });
        }
        next();
    };
};

module.exports = validateSchema;