const { createPost, editPost, deletePost, getPosts } = require('../services/postService');
const { createComment, deleteComment, editComment } = require("../services/commentService");
const { editUser, getUsers } = require("../services/userService");
const { findLike, deleteLike, createLike, countLike } = require("../services/likeService");

const uploadToCloudinary = require("../utils/claudinaryUpload");
const enrichPostWithLikes = require("../utils/postWithLikes");

/**
 * Creates a new post for a user with optional image upload
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.description - Post description
 * @param {Object} [req.file] - Optional file upload
 * @param {Buffer} [req.file.buffer] - Buffer of uploaded file
 * @param {Object} res - Express response object
 * @param {Object} res.locals.user - Authenticated user information
 * @param {string} res.locals.user._id - User ID
 * @throws {NotifyError} Throws error if post creation fails
 * @returns {Promise<Object>} Created post object
 */
const createNewPost = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * Updates a post with new description and/or image
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.description - New post description
 * @param {Object} [req.file] - Uploaded file object
 * @param {Buffer} [req.file.buffer] - File buffer for image upload
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Post ID to edit
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the updated post
 * @throws {Error} Forwards any errors to the next middleware
 */
const alterPost = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * Deletes a post based on the provided ID from the request parameters.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the post to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the deleted post data
 * @throws {Error} Forwards any errors to the next middleware
 */
const killPost = async (req, res, next) => {
    try {
        const post = await deletePost(req.params.id);
        res.json(post);
    } catch (err) {
        next(err);
    }
};

/**
 * Creates a new comment for a specified post
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the post to comment on
 * @param {Object} req.body - Request body containing comment data
 * @param {Object} res - Express response object
 * @param {Object} res.locals - Response local variables
 * @param {Object} res.locals.user - Authenticated user object
 * @param {string} res.locals.user._id - ID of the authenticated user
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} The created comment object
 * @throws {Error} If comment creation fails
 */
const createNewComment = async (req, res, next) => {
    const userId = res.locals.user._id.toString();
    try {
        const comment = await createComment(userId, req.params.id, req.body);
        res.json(comment);
    } catch (err) {
        next(err);
    }
};

/**
 * Handles the deletion of a comment by ID.
 * @async
 * @param {Object} req - Express request object containing the comment ID in params.
 * @param {Object} res - Express response object to send the deletion result.
 * @param {Function} next - Express next middleware function for error handling.
 * @throws {Error} - Forwards any errors to the next middleware.
 */
const killComment = async (req, res, next) => {
    try {
        const comment = await deleteComment(req.params.id);
        res.json(comment);
    } catch (err) {
        next(err);
    }
};

/**
 * Updates a comment based on the provided ID and request body
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the comment to be edited
 * @param {Object} req.body - Request body containing comment update data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 * @throws {Error} Forwards any errors to the next middleware
 */
const alterComment = async (req, res, next) => {
    try {
        const comment = await editComment(req.params.id, req.body);
        res.json(comment);
    } catch (err) {
        next(err);
    }
};

/**
 * Renders the edit profile page for authenticated users.
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>} A promise that resolves when the page is rendered
 * @throws {Error} Forwards any errors to the next middleware
 */
const editProfilePage = async (req, res, next) => {
    try {
        res.render('private/edit-profile');
    } catch (err) {
        next(err);
    }
};

/**
 * Updates user profile information
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {string} req.body.userId - ID of the user to be updated
 * @param {Object} res - Express response object 
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the updated user profile
 * @throws {Error} Forwards any errors to Express error handler
 */
const editProfile = async (req, res, next) => {
    const userId = res.locals.user._id.toString();
    try {
        const { firstname, lastname, username, bio } = req.body;
        const profileData = { userId, firstname, lastname, username, bio };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'Profile Image');
            profileData.profile_image = result.secure_url;
            profileData.public_id = result.public_id;
        };

        const editedProfile = await editUser(userId, profileData);
        res.json(editedProfile);
    } catch (err) {
        next(err);
    }
};

/**
 * Handles search functionality by retrieving and combining user and post results
 * @param {Object} req - Express request object containing search query
 * @param {Object} res - Express response object with authenticated user in locals
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Renders search results page with combined users and posts
 * @throws {Error} Forwards any errors to next middleware
 * @async
 * @description
 * This function:
 * 1. Gets search query from request
 * 2. Fetches matching users and posts
 * 3. Tags results with type ('user' or 'post')
 * 4. Enriches posts with like information
 * 5. Combines and renders results
 */
const getSearchResults = async (req, res, next) => {
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

        res.render('private/search-results', {
            searchResults,
            users: taggedUsers,
            posts: taggedPosts,
            searchTxt: req.query.q
        });
    } catch (err) {
        next(err);
    }
};

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
const likeAndUnlikeToggle = async (req, res, next) => {
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
        next(err);
    }
};

module.exports = { createNewPost, alterPost, killPost, createNewComment, killComment, alterComment, editProfilePage, editProfile, getSearchResults, likeAndUnlikeToggle };