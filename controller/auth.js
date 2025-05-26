const { createUser, loginUser, deleteUser } = require("../services/userService");
const generateToken = require("../utils/generateToken");
const { NotifyError } = require("../utils/notifyError");

/**
 * Handles user login authentication and session creation
 * @param {Object} req - Express request object containing user credentials in the body
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.username - Username for authentication
 * @param {string} req.body.password - Password for authentication
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} - Returns JSON response with user data or error
 * @throws {Error} - Forwards any errors to error handling middleware
 */
const loginUserSession = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const loggedUser = await loginUser(username, password);

        if (!loggedUser) {
            return res.status(401).json({ error: 'Invalid username or password. Try again.' });
        };

        const token = generateToken({ user: loggedUser });
        res.cookie('token', token, { httpOnly: true });
        res.json(loggedUser);
    } catch (err) {
        next(err);
    }
};

/**
 * Creates a new user and generates an authentication token
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Promise that resolves when user is created and token is set
 * @throws {NotifyError} - Throws error if user creation fails
 */
const createNewUser = async (req, res, next) => {
    try {
        const newUser = await createUser({ userData: req.body });
        const token = generateToken({ user: newUser });

        res.cookie('token', token, { httpOnly: false });
        res.json(newUser);
    } catch (err) {
        next(err);
    }
};

const deleteProfile = async (req, res, next) => {
    try {
        console.log(req.params.id);
        await deleteUser(req.params.id);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

/**
 * Logs out the user by clearing the authentication token cookie
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void} - Returns a 200 status with logout confirmation message
 */
const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    });

    res.status(200).json({ message: 'Logged Out' });
};

module.exports = { createNewUser, loginUserSession, logoutUser, deleteProfile }; 