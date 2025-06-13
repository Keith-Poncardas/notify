// ────── Core Services ──────
const { getUsersLikePosts } = require("../../services/likeService");
const { getPosts, getPaginatedPost } = require("../../services/postService");
const { getUserByUsername } = require("../../services/userService");

// ────── Utilities ──────
const { getCache, setCache, getOrSetCache } = require("../../utils/cache");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");
const enrichPost = require("../../utils/enrichedPost");
const { NotifyError } = require("../../utils/notifyError");

/**
 * Renders the public profile view for a specific user's liked posts
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user || null;
    const userId = user ? user._id.toString() : 'guest';
    const { username } = req.params;
    const page = parseInt(req.params.pageNumber) || 1;
    const limit = 15;

    const cachedKeyPostsLikes = `userPostsLikes:${username}:page=${page}:limit=${limit}:user=${userId}`;

    try {
        const { userProfile, userPostsLikes } = await getOrSetCache(cachedKeyPostsLikes, async () => {

            const userProfile = await getUserByUsername(username);
            if (!userProfile) throw new NotifyError("User not found");

            const userPostsLikes = await getPaginatedPost({
                page,
                limit,
                username,
                userId,
                likedOnly: true
            });

            return { userProfile, userPostsLikes };
        }, 60);

        res.locals.seo.add(res, {
            title: `${userProfile.firstname} ${userProfile.lastname} (@${userProfile.username})`,
            description: userProfile.bio || `Hi peeps, I'm ${userProfile.firstname}!`,
            image: userProfile.profile_image || null,
            url: `https://notify-blond.vercel.app/home/${userProfile._id}/profile`,
            twitterCard: userProfile.profile_image?.[0] || null
        });

        res.render('users/likes', {
            viewUser: userProfile,
            posts: userPostsLikes.posts,
            currentPage: userPostsLikes.pagination.currentPage,
            totalPages: userPostsLikes.pagination.totalPages,
            totalDocuments: userPostsLikes.pagination.totalDocuments,
            path: req.path
        });

    } catch (err) {
        next(err);
    }
};
