const { getPosts } = require("../../services/postService");
const { getCache, setCache } = require("../../utils/cache");
const enrichPost = require("../../utils/enrichedPost");
const logger = require("../../utils/logger");

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
    const user = res.locals.user;

    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 15;

    const cacheKey = `posts:page=${page}:limit=${limit}`

    try {
        const cachedPosts = await getCache(cacheKey);

        if (cachedPosts) {

            const postWithLikes = await Promise.all(cachedPosts.posts.map((post) => enrichPost(post, user)));

            return res.render('home/index', {
                posts: postWithLikes,
                currentPage: cachedPosts.currentPage,
                totalPages: cachedPosts.totalPages,
                totalDocuments: cachedPosts.totalDocuments
            });

        };

        const listOfPosts = await getPosts(req.params);

        if (!listOfPosts) {
            throw new NotifyError('Failed to render posts', 500);
        };

        const { posts, currentPage, totalPages, totalDocuments } = listOfPosts;

        await setCache(cacheKey, { posts, currentPage, totalPages, totalDocuments });

        const postsWithLikes = await Promise.all(
            posts.map((post) => enrichPost(post, user))
        );

        res.render('home/index', {
            posts: postsWithLikes,
            currentPage,
            totalPages,
            totalDocuments
        });

    } catch (err) {
        next(err);
    }
};