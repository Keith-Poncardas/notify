const { NotifyError } = require('../utils/notifyError');
const { getPosts, viewPost } = require('../services/postService');
const { getComments } = require('../services/commentService');
const { getUser, getUsers } = require('../services/userService');
const { countLike } = require('../services/likeService');
const enrichPostWithLikes = require('../utils/postWithLikes');

const homepage = async (req, res, next) => {
    const user = res.locals.user;

    try {
        const listOfPosts = await getPosts({});
        const { posts } = listOfPosts;

        if (!listOfPosts) {
            throw new NotifyError('Failed to render posts', 500);
        };

        const postsWithLikes = await Promise.all(
            posts.map((post) => enrichPostWithLikes(post, user))
        );

        res.render('public/home', { posts: postsWithLikes });
    } catch (err) {
        next(err);
    }
};

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

        res.render('public/view', { post: postWithLikes, comments });
    } catch (err) {
        next(err)
    }
};

const viewProfile = async (req, res, next) => {
    const user = res.locals.user;

    try {
        const viewUser = await getUser(req.params.id);

        if (!viewUser) {
            throw new NotifyError('User not found.', 404);
        };

        const userPosts = await getPosts({}, viewUser._id);

        const { posts } = userPosts;

        const postWithLikes = await Promise.all(
            posts.map((post) => enrichPostWithLikes(post, user))
        );

        res.render('public/profile', { viewUser, posts: postWithLikes });
    } catch (err) {
        next(err);
    }
};

const viewUsers = async (req, res) => {
    try {
        const usersList = await getUsers({});
        const { users } = usersList;
        res.render('public/users', { users });
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

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