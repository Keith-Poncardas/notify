const { viewPost } = require("../../services/postService");
const { getCache, setCache } = require("../../utils/cache");
const enrichPost = require("../../utils/enrichedPost");

/**
 * Renders a view displaying a single post
 * 
 * @param {Object} req - Express request object containing the post ID in params
 * @param {Object} res - Express response object with user information in locals
 * @param {Function} next - Express next middleware function
 * @throws {NotifyError} When post is not found or has been deleted
 * @async
 */
module.exports = async (req, res, next) => {
    const user = res.locals.user;
    const { id } = req.params;

    const cachedKey = `post:${id}`;

    try {

        const cachedPost = await getCache(cachedKey);

        if (cachedPost) {
            const postWithLikes = await enrichPost(cachedPost, user);

            res.locals.seo.add(res, {
                title: `${cachedPost.description.substring(0, 25)} - (@${cachedPost.author.username})`,
                description: cachedPost.description,
                image: cachedPost.post_image,
                twitterCard: cachedPost.post_image
            });

            return res.render('post/view', { post: postWithLikes });
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

        res.render('post/view', { post: postWithLikes });
    } catch (err) {
        next(err)
    }
};