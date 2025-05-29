const { NotifyError } = require('../utils/notifyError');
const { getPosts, viewPost } = require('../services/postService');
const { getComments } = require('../services/commentService');
const { getUser, getUsers, getUserByUsername } = require('../services/userService');
const { countLike } = require('../services/likeService');
const enrichPost = require('../utils/enrichedPost');
const redis = require('../config/redisClient');
const { getCache, setCache } = require('../utils/cache');
const logger = require('../utils/logger');

/**
 * Renders the homepage with posts and their likes
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @throws {NotifyError} Throws if posts cannot be retrieved
 * @returns {void} Renders the homepage template with enriched posts data
 */
const homepage = async (req, res, next) => {
    const user = res.locals.user;

    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 15;

    const cacheKey = `posts:page=${page}:limit=${limit}`

    try {
        const cachedPosts = await getCache(cacheKey);

        if (cachedPosts) {
            const postWithLikes = await Promise.all(
                cachedPosts.posts.map((post) => enrichPost(post, user))
            );

            console.log("Post cached is active!");

            return res.render('public/home', {
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

        res.render('public/home', {
            posts: postsWithLikes,
            currentPage,
            totalPages,
            totalDocuments
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Renders a view displaying a single post with its comments and like information.
 * 
 * @param {Object} req - Express request object containing the post ID in params
 * @param {Object} res - Express response object with user information in locals
 * @param {Function} next - Express next middleware function
 * @throws {NotifyError} When post is not found or has been deleted
 * @async
 */
const seePost = async (req, res, next) => {
    const user = res.locals.user;
    const { id } = req.params;

    const cachedKey = `post:${id}`;

    try {

        const cachedPost = await getCache(cachedKey);

        if (cachedPost) {
            logger.success('VIEW POST is cached');
            const postWithLikes = await enrichPost(cachedPost, user);
            return res.render('public/view', { post: postWithLikes });
        };

        const post = await viewPost(id);

        if (!post) {
            throw new NotifyError('Post not found or already deleted.', 404);
        };

        await setCache(cachedKey, post);

        const postWithLikes = await enrichPost(post, user);

        res.locals.seo.add(res, {
            title: `${post.description.substring(0, 25)} - (@${post.author.username})`,
            description: post.description,
            image: post.post_image,
            twitterCard: post.post_image
        });

        logger.warn('VIEW POST is NOT YET cached');

        res.render('public/view', { post: postWithLikes });
    } catch (err) {
        next(err)
    }
};

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
const viewProfile = async (req, res, next) => {
    const user = res.locals.user;
    const { username } = req.params;

    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 15;

    const cachedKeyUser = `userProfile:${username}`;
    const cachedKeyPosts = `userProfile:${username}:page=${page}:limit=${limit}`;

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

/**
 * Renders the users page with a list of all users.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {NotifyError} Throws NotifyError if there's an error retrieving users
 */
const viewUsers = async (req, res) => {
    const { pageNumber } = req.params;

    const page = parseInt(pageNumber) || 1;
    const limit = 15;

    const cacheKeyUsers = `users:page=${page}:limit=${limit}`;

    try {
        const cachedUsers = await getCache(cacheKeyUsers);

        if (cachedUsers) {
            logger.success('USERS is cached');
            return res.render('public/users', {
                users: cachedUsers.users,
                currentPage: cachedUsers.currentPage,
                totalPages: cachedUsers.totalPages,
                totalDocuments: cachedUsers.totalDocuments,
            });
        };

        console.log(req.params.pageNumber);
        const usersList = await getUsers(req.params);

        if (!usersList) {
            throw new NotifyError('Failed to fetch users', 500);
        };

        const { users, currentPage, totalDocuments, totalPages } = usersList;

        await setCache(cacheKeyUsers, { users, currentPage, totalDocuments, totalPages });

        res.render('public/users', { users, currentPage, totalDocuments, totalPages });
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

/**
 * Retrieves the number of likes for a specific post and user combination
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.userId - ID of the user
 * @param {string} req.query.postId - ID of the post
 * @param {Object} res - Express response object
 * @throws {NotifyError} If there's an error counting likes
 * @returns {Promise<void>} JSON response containing the like count
 */
const likeCounts = async (req, res) => {
    const { userId, postId } = req.query;
    try {
        const count = await countLike(userId, postId);

        res.json({ count });
    } catch (err) {
        throw new NotifyError(err.message);
    }
}

module.exports = { homepage, seePost, viewProfile, viewUsers, likeCounts }; 