const { getPaginatedPost } = require("../../services/postService");
const { getUserByUsername } = require("../../services/userService");
const { getOrSetCache } = require("../../utils/cache");
const { NotifyError } = require("../../utils/notifyError");

/**
 * Renders the public profile view for a specific user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.username - Username of the user to view
 * @param {Object} res - Express response object
 * @param {Object} res.locals.user - Currently authenticated user (optional)
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Renders the profile page with user data and posts
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user || null;
    const userId = user ? user._id.toString() : 'guest';

    const { username } = req.params;
    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 15;

    const cacheKey = `userPosts:${username}:page=${page}:limit=${limit}:user=${userId}`;

    try {
        const { userProfile, userPosts } = await getOrSetCache(cacheKey, async () => {
            const userProfile = await getUserByUsername(username);
            if (!userProfile) throw new NotifyError("User not found");

            const userPosts = await getPaginatedPost({
                page,
                limit,
                username,
                userId
            });

            return { userProfile, userPosts };
        }, 60);

        const { posts, pagination } = userPosts;
        const { currentPage, totalPages, totalDocuments } = pagination;

        // Set SEO metadata
        res.locals.seo.add(res, {
            title: `${userProfile.firstname} ${userProfile.lastname} (@${userProfile.username})`,
            description: userProfile.bio || `Hi peeps I'm ${userProfile.firstname}!`,
            image: userProfile.profile_image || null,
            url: `https://notify-blond.vercel.app/home/${userProfile._id}/profile`,
            twitterCard: userProfile.profile_image?.[0] || null
        });

        // Render profile page
        res.render('users/profile', {
            viewUser: userProfile,
            posts,
            currentPage,
            totalPages,
            totalDocuments,
            path: req.path
        });

    } catch (err) {
        next(err);
    }
};
