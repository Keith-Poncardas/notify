const { NotifyError } = require('../utils/notifyError');
const { getPosts, viewPost } = require('../services/postService');
const { getComments } = require('../services/commentService');
const { getUser, getUsers } = require('../services/userService');
const { countLike } = require('../services/likeService');
const enrichPostWithLikes = require('../utils/postWithLikes');

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

    try {
        const listOfPosts = await getPosts(req.query);
        const { posts, currentPage, totalPages, totalDocuments } = listOfPosts;

        if (!listOfPosts) {
            throw new NotifyError('Failed to render posts', 500);
        };

        const postsWithLikes = await Promise.all(
            posts.map((post) => enrichPostWithLikes(post, user))
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

    try {
        const post = await viewPost(req.params.id);

        if (!post) {
            throw new NotifyError('Post not found or already deleted.', 404);
        };

        const commentsList = await getComments(post._id, {});
        const { comments } = commentsList;

        const postWithLikes = await enrichPostWithLikes(post, user);

        res.locals.seo.add(res, {
            title: `${post.description.substring(0, 25)} - (@${post.author.username})`,
            description: post.description,
            image: post.post_image,
            twitterCard: post.post_image
        });

        res.render('public/view', { post: postWithLikes, comments });
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

    try {
        const viewUser = await getUser(req.params.id);

        if (!viewUser) {
            throw new NotifyError('User not found.', 404);
        };

        const userPosts = await getPosts(req.query, viewUser._id);

        const { posts, currentPage, totalPages, totalDocuments } = userPosts;

        const postWithLikes = await Promise.all(
            posts.map((post) => enrichPostWithLikes(post, user))
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
    try {
        const usersList = await getUsers(req.query);
        const { users } = usersList;
        res.render('public/users', { users });
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