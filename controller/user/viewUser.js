const { getPosts } = require("../../services/postService");
const { getUserByUsername } = require("../../services/userService");
const { getCache, setCache } = require("../../utils/cache");
const enrichPost = require("../../utils/enrichedPost");
const logger = require("../../utils/logger");

/**
 * Renders the public profile view for a specific user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - User ID to view
 * @param {Object} res - Express response object
 * @param {Object} res.locals - Response locals
 * @param {Object} res.locals.user - Currently authenticated user
 * @param {Function} next - Express next middleware function
 * @throws {NotifyError} When user is not found - 404 error
 * @returns {Promise<void>} Renders the profile page with user data and posts
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user;
    const { username } = req.params;

    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 15;

    const cachedKeyUser = `userProfile:${username}`;
    const cachedKeyPosts = `userPosts:${username}:page=${page}:limit=${limit}`;

    try {

        const cachedUser = await getCache(cachedKeyUser);
        const cachedPost = await getCache(cachedKeyPosts);

        if (cachedUser && cachedPost) {
            logger.success('USER PROFILE is cached');
            logger.success('USER POSTS PROFILE is cached');

            const paginatedCachedPosts = await Promise.all(
                cachedPost.posts.map(post => enrichPost(post, user))
            );

            return res.render('public/profile', {
                viewUser: cachedUser,
                posts: paginatedCachedPosts,
                currentPage: cachedPost.currentPage,
                totalPages: cachedPost.totalPages,
                totalDocuments: cachedPost.totalDocuments
            });

        };

        const viewUser = await getUserByUsername(username);

        if (!viewUser) {
            throw new NotifyError('User not found.', 404);
        };

        const userPosts = await getPosts(req.params, viewUser._id);

        const { posts, currentPage, totalPages, totalDocuments } = userPosts;

        await setCache(cachedKeyUser, viewUser);
        await setCache(cachedKeyPosts, {
            posts,
            currentPage,
            totalPages,
            totalDocuments
        }, 60);

        const postWithLikes = await Promise.all(
            posts.map((post) => enrichPost(post, user))
        );

        res.locals.seo.add(res, {
            title: `${viewUser.firstname} ${viewUser.lastname} (@${viewUser.username})`,
            description: viewUser.bio || `Hi peeps I'm ${viewUser.firstname}!`,
            image: viewUser.profile_image || null,
            url: `https://notify-blond.vercel.app/home/${viewUser._id}/profile`,
            twitterCard: viewUser.profile_image[0] || null
        });

        res.render('public/profile', {
            viewUser,
            posts: postWithLikes,
            currentPage,
            totalPages,
            totalDocuments
        });

    } catch (err) {
        next(err);
    }
};
