const { getPaginatedPost } = require("../../services/postService");
const { getOrSetCache } = require("../../utils/cache");

/**
 * Renders the paginated list of posts
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @throws {NotifyError} Throws if posts cannot be retrieved
 * @returns {void} Renders the homepage template with enriched posts data
 */
module.exports = async (req, res, next) => {
    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 10;
    const query = req.query.q || '';
    const username = req.query.username || null;

    const user = res.locals.user || null;
    const userId = user ? user._id.toString() : 'guest';

    const cacheKey = `posts:page=${page}:limit=${limit}:user=${userId}`;

    try {

        const { posts, pagination } = await getOrSetCache(cacheKey, async () => {
            return await getPaginatedPost({
                page,
                limit,
                username,
                query,
                userId
            });
        }, 60);

        res.render('home/index', {
            posts,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalDocuments: pagination.totalDocuments
        });

    } catch (err) {
        next(err);
    }
};
