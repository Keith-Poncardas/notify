const { getUsersLikePosts } = require("../../services/likeService");
const { getPosts } = require("../../services/postService");
const { getUserByUsername } = require("../../services/userService");
const { getCache, setCache } = require("../../utils/cache");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");
const enrichPost = require("../../utils/enrichedPost");
const { NotifyError } = require("../../utils/notifyError");

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

    const cachedKeyUserLikes = `userProfileLikes:${username}`;
    const cachedKeyPostsLikes = `userPostsLikes:${username}:page=${page}:limit=${limit}`;

    try {

        // const cachedUserLikes = await getCache(cachedKeyUserLikes);
        // const cachedPostLikes = await getCache(cachedKeyPostsLikes);



        // if (cachedUserLikes && cachedPostLikes) {

        //     console.log('TRIGGERED!');

        //     const paginatedCachedPostsLikes = await Promise.all(
        //         (cachedPostLikes.likedPosts || [])
        //             .filter(post => post && post._id)
        //             .map(post => enrichPost(post, user))
        //     );

        //     res.locals.seo.add(res, {
        //         title: `${cachedUserLikes.firstname} ${cachedUserLikes.lastname} (@${cachedUserLikes.username})`,
        //         description: cachedUserLikes.bio || `Hi peeps I'm ${cachedUserLikes.firstname}!`,
        //         image: cachedUserLikes.profile_image,
        //         url: `https://notify-b60e.onrender.com/${cachedUserLikes.username}`,
        //         twitterCard: cachedUserLikes.profile_image
        //     });

        //     return res.render('users/likes', {
        //         viewUser: cachedUserLikes,
        //         posts: paginatedCachedPostsLikes,
        //         currentPage: cachedPostLikes.currentPage,
        //         totalPages: cachedPostLikes.totalPages,
        //         totalDocuments: cachedPostLikes.totalDocuments,
        //         path: req.path
        //     });

        // } else {
        //     console.log('Not invalidating!');
        // };


        const viewUserLikes = await getUserByUsername(username);

        if (!viewUserLikes) {
            throw new NotifyError('User not found.', 404);
        };

        const userPostsLikes = await getUsersLikePosts(req.params, username, 15);

        const { likedPosts, currentPage, totalPages, totalDocuments } = userPostsLikes;

        console.log(likedPosts);

        // await setCache(cachedKeyUserLikes, viewUserLikes);
        // await setCache(cachedKeyPostsLikes, {
        //     likedPosts,
        //     currentPage,
        //     totalPages,
        //     totalDocuments
        // }, 60);

        const postWithLikes = await Promise.all(
            likedPosts.map(post => enrichPost(post, user))
        );

        res.locals.seo.add(res, {
            title: `${viewUserLikes.firstname} ${viewUserLikes.lastname} (@${viewUserLikes.username})`,
            description: viewUserLikes.bio || `Hi peeps I'm ${viewUserLikes.firstname}!`,
            image: viewUserLikes.profile_image || null,
            url: `https://notify-blond.vercel.app/home/${viewUserLikes._id}/profile`,
            twitterCard: viewUserLikes.profile_image[0] || null
        });

        console.log(postWithLikes);

        console.log('TRIGGERED NOT FRESH DATA!');

        res.render('users/likes', {
            viewUser: viewUserLikes, // <-- fixed here
            posts: userPostsLikes,
            currentPage,
            totalPages,
            totalDocuments,
            path: req.path
        });

    } catch (err) {
        next(err);
    }
};
