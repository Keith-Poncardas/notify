const User = require('../models/Users');
const { NotifyError } = require('../utils/notifyError');
const bcrypt = require('bcrypt');

/**
 * Creates a new user in the system.
 *
 * @async
 * @function createUser
 * @param {Object} userData - The data for the user to be created.
 * @param {string} userData.firstname - The first name of the user.
 * @param {string} userData.lastname - The last name of the user.
 * @param {string} userData.username - The username of the user.
 * @param {string} userData.password - The password of the user.
 * @throws {NotifyError} Throws an error if required fields are missing.
 * @throws {NotifyError} Throws an error if the username already exists.
 * @throws {NotifyError} Throws a general error if user creation fails.
 * @returns {Promise<Object>} Returns the newly created user object.
 */
const createUser = async ({ userData }) => {
    try {

        /**
         * Validate if there is missing fields
         */
        if (!userData.firstname || !userData.lastname || !userData.username || !userData.password) {
            throw new NotifyError('Missing required fields');
        };

        /**
         * Hash the password before saving it
         */
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        /**
         * Check if the username already exists
         */
        const existingUser = await User.findOne({ username: userData.username });
        if (existingUser) return null;

        /**
         * Assigned illustration profile image
         */
        userData.profile_image = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${userData.firstname + ' ' + userData.lastname}`;

        /**
         * Create the new user
         */
        const newUser = await User.create(userData);
        return newUser;

    } catch (err) {
        throw new NotifyError(`Failed to create user: ${err.message}`);
    }
};

/**
 * Authenticates a user with their username and password
 * @async
 * @param {string} username - The username of the user trying to login
 * @param {string} password - The password of the user trying to login
 * @returns {Promise<Object>} The authenticated user object
 * @throws {NotifyError} When authentication fails due to invalid credentials or other errors
 */
const loginUser = async (username, password) => {
    try {

        /**
         * Validate if there is missing fields
         */
        if (!username || !password) throw new NotifyError('Missing required fields');

        /**
         * Check if 'user' username is valid. 
         */
        const user = await User.findOne({ username });
        if (!user) return null;

        /**
         * Check if the provided password matches the stored hashed password
         */
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return user;

    } catch (err) {
        throw new NotifyError(`Failed to login user: ${err.message}`);
    }
};

/**
 * Retrieves a user by their ID from the database.
 *
 * @async
 * @function getUser
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user object retrieved from the database.
 * @throws {NotifyError} Throws an error if the ID is missing or if the user retrieval fails.
 */
const getUser = async (id) => {
    try {

        /**
        * Validate if user ID is missing
        */
        if (!id) throw new NotifyError('Missing user ID');

        /**
        * Locate user in the DB by ID
        */
        const user = await User.findById(id);

        return user;

    } catch (err) {
        throw new NotifyError(`Failed to retrieve user: ${err.message}`);
    }
};

/**
 * Edits a user's information in the database.
 *
 * @async
 * @function editUser
 * @param {string} id - The unique identifier of the user to be updated.
 * @param {Object} userData - An object containing the updated user data.
 * @param {string} userData.password - The new password for the user, which will be hashed before saving.
 * @returns {Promise<Object>} The updated user object.
 * @throws {NotifyError} Throws an error if the user ID is missing or if the update operation fails.
 */
const editUser = async (authorId, userData) => {
    try {

        /**
        * Validate if user ID and User data is missing
        */
        if (!authorId || !userData) throw new NotifyError('Missing ID and User Data');

        /**
        * Update the user info by ID
        */
        const updatedUser = await User.findByIdAndUpdate(authorId, userData);

        return updatedUser;

    } catch (err) {
        throw new NotifyError(`Failed to edit user: ${err.message}`);
    }
};

/**
 * Retrieves a paginated list of users from the database.
 *
 * @async
 * @function getUsers
 * @param {Object} query - The query object containing pagination parameters.
 * @param {number} [query.page=1] - The page number to retrieve (default is 1).
 * @returns {Promise<Object>} An object containing the paginated users and metadata.
 * @returns {Array} return.users - The list of users for the current page.
 * @returns {number} return.currentPage - The current page number.
 * @returns {number} return.totalDocuments - The total number of user documents.
 * @returns {number} return.totalPages - The total number of pages.
 * @throws {NotifyError} If an error occurs while retrieving users.
 */
const getUsers = async (query) => {
    try {

        /**
        * Validate if query is missing
        */
        if (!query) throw new NotifyError('Missing Query');

        const { page = 1, search } = query;
        const limit = 15;
        const currentPage = parseInt(page);

        const totalDocuments = await User.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);

        const filterBy = {};

        if (search) {
            filterBy.$or = [
                { firstname: { $regex: search, $options: 'i' } },
                { lastname: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } },
            ];
        };

        /**
        * Paginated list of users
        */
        const users = await User.find(filterBy)
            .skip((currentPage - 1) * limit)
            .limit(limit);

        return { users, currentPage, totalDocuments, totalPages };

    } catch (err) {
        throw new NotifyError(`Failed to get users: ${err.message}`);
    }
};

/**
 * Deletes a user by their ID.
 *
 * @async
 * @function deleteUser
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<Object>} The deleted user object.
 * @throws {NotifyError} If the user ID is missing.
 * @throws {NotifyError} If the user is not found.
 * @throws {NotifyError} If there is an error during the deletion process.
 */
const deleteUser = async (id) => {
    try {

        /**
        * Validate if ID is missing
        */
        if (!id) throw new NotifyError('Missing user ID');

        /**
        * Find user by ID then delete, along with its associated data.
        */
        const user = await User.findOneAndDelete({ _id: id });

        /**
        * Throw error if user not found
        */
        if (!user) throw new NotifyError('User not found');

        return user;

    } catch (err) {
        throw new NotifyError(`Failed to delete user: ${err.message}`);
    }
};

module.exports = {
    createUser,
    loginUser,
    getUser,
    editUser,
    getUsers,
    deleteUser
};