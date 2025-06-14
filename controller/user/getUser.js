const { getUsers } = require("../../services/userService");
const { getCache, setCache } = require("../../utils/cache");
const logger = require("../../utils/logger");

/**
 * Renders the users page with a list of all users.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {NotifyError} Throws NotifyError if there's an error retrieving users
 */
module.exports = async (req, res, next) => {
    const { pageNumber } = req.params;

    console.log(req.path);

    const page = parseInt(pageNumber) || 1;
    const limit = 15;

    const cacheKeyUsers = `users:page=${page}:limit=${limit}`;

    try {
        const cachedUsers = await getCache(cacheKeyUsers);

        if (cachedUsers) {
            return res.render('users/list', {
                users: cachedUsers.users,
                currentPage: cachedUsers.currentPage,
                totalPages: cachedUsers.totalPages,
                totalDocuments: cachedUsers.totalDocuments,
            });
        };

        const usersList = await getUsers(req.params);

        if (!usersList) {
            throw new NotifyError('Failed to fetch users', 500);
        };

        const { users, currentPage, totalDocuments, totalPages } = usersList;

        await setCache(cacheKeyUsers, { users, currentPage, totalDocuments, totalPages });

        res.render('users/list', { users, currentPage, totalDocuments, totalPages });
    } catch (err) {
        next(err);
    }
};