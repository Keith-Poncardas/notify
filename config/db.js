const { connect } = require('mongoose');
const logger = require('../utils/logger');

/**
 * Establishes a connection to MongoDB.
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is established
 * @throws {Error} If the connection fails
 */
const connectDB = async () => {
    try {
        const conn = await connect(process.env.MONGO_URL);
        logger.success(`DB Connected to: ${conn.connection.host}`);
    } catch (err) {
        logger.error(err.message);
    }
};

module.exports = connectDB;