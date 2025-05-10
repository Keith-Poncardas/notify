const { NotifyError } = require("../utils/notifyError");
const { createPost, editPost, deletePost, getPosts } = require('../services/postService');
const { createComment, deleteComment, editComment } = require("../services/commentService");
const { editUser, getUsers } = require("../services/userService");
const { findLike, deleteLike, createLike, countLike } = require("../services/likeService");

const uploadToCloudinary = require("../utils/claudinaryUpload");
const enrichPostWithLikes = require("../utils/postWithLikes");

const createNewPost = async (req, res) => {
    const userId = res.locals.user._id.toString();

    try {
        const { description } = req.body;
        const postData = { description };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            postData.post_image = result.secure_url;
            postData.public_id = result.public_id;
        };

        const post = await createPost(userId, postData);
        res.json(post);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const alterPost = async (req, res) => {
    try {
        const { description } = req.body;

        const postEditData = { description };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            postEditData.post_image = result.secure_url;
            postEditData.public_id = result.public_id;
        };

        const post = await editPost(req.params.id, postEditData);

        res.json(post);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const killPost = async (req, res) => {
    try {
        const delPost = await deletePost(req.params.id);
        res.json(delPost);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const createNewComment = async (req, res) => {
    const userId = res.locals.user._id.toString();
    try {
        const comment = await createComment(userId, req.params.id, req.body);
        res.json(comment);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const killComment = async (req, res) => {
    try {
        const delComment = await deleteComment(req.params.id);
        res.json(delComment);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const alterComment = async (req, res) => {
    try {
        const editedComment = await editComment(req.params.id, req.body);
        res.json(editedComment);
    } catch (err) {
        throw new NotifyError(err.message);
    }
}


const editProfilePage = async (req, res) => {
    try {
        res.render('private/edit-profile');
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const editProfile = async (req, res) => {
    try {
        const editedProfile = await editUser(req.body.userId, req.body);
        res.json(editedProfile);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const getSearchResults = async (req, res) => {
    const user = res.locals.user;

    try {
        const query = req.query.q?.trim();

        const { users } = await getUsers({ search: query });
        const { posts } = await getPosts({ search: query });

        const taggedUsers = users.map(user => ({ type: 'user', ...user._doc }));

        const taggedPosts = await Promise.all(
            posts.map(async (post) => {
                const postWithLikes = await enrichPostWithLikes(post, user);
                return {
                    type: 'post',
                    ...postWithLikes
                }
            })
        );

        const searchResults = [...taggedUsers, ...taggedPosts];

        res.render('private/search-results', { searchResults, searchTxt: req.query.q });
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const likeAndUnlikeToggle = async (req, res) => {
    const { postId } = req.body;
    const userId = res.locals.user._id.toString();

    try {
        const existingLike = await findLike(userId, postId);

        if (existingLike) {
            await deleteLike(existingLike._id);
        } else {
            await createLike(userId, postId);
        }

        const likeCount = await countLike(postId);

        res.json({
            liked: !existingLike,
            totalLikes: likeCount
        });
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

module.exports = { createNewPost, alterPost, killPost, createNewComment, killComment, alterComment, editProfilePage, editProfile, getSearchResults, likeAndUnlikeToggle };