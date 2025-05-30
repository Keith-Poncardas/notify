const { getPosts } = require("../../services/postService");
const { getUsers } = require("../../services/userService");
const enrichPost = require("../../utils/enrichedPost");

/**
 * Toggles like/unlike status for a post and returns updated like information
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.postId - ID of the post to toggle like status
 * @param {Object} res - Express response object
 * @param {Object} res.locals.user - Authenticated user information
 * @param {string} res.locals.user._id - ID of the authenticated user
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing:
 *   - liked {boolean} - New like status (true if liked, false if unliked)
 *   - totalLikes {number} - Updated total number of likes for the post
 * @throws {Error} Forwards any errors to the next middleware
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user;

    try {
        const query = req.query.search_query?.trim();

        const { users } = await getUsers({ search: query });
        const { posts } = await getPosts({ search: query });

        const taggedUsers = users.map(user => ({ type: 'user', ...user._doc }));

        const taggedPosts = await Promise.all(
            posts.map(async (post) => {
                const postWithLikes = await enrichPost(post, user);
                return {
                    type: 'post',
                    ...postWithLikes
                }
            })
        );

        const searchResults = [...taggedUsers, ...taggedPosts];

        res.render('private/search-results', {
            searchResults,
            users: taggedUsers,
            posts: taggedPosts,
            searchTxt: query
        });
    } catch (err) {
        next(err);
    }
};