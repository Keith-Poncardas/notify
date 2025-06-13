const { default: mongoose } = require("mongoose");
const { findOneAndDelete } = require("../models/Comments");
const Posts = require("../models/Posts");
const { NotifyError } = require("../utils/notifyError");
const Users = require("../models/Users");
const Likes = require("../models/Likes");

/**
 * Creates a new post in the database
 * @async
 * @param {string} authorId - The ID of the post's author
 * @param {Object} postData - The data for the post
 * @returns {Promise<Object>} The created post object
 * @throws {NotifyError} When required fields are missing or post creation fails
 */
const createPost = async (authorId, postData) => {
    try {

        /**
         * Validate all the required fields
         */
        if (!authorId || !postData) {
            throw new NotifyError('Missing required fields');
        };

        /**
         * Create post
         */
        const post = await Posts.create({ author: authorId, ...postData });

        return post;

    } catch (err) {
        throw new NotifyError(`Failed to create post: ${err.message}`);
    }
};

/**
 * Retrieves a post by its ID from the database
 * @async
 * @param {string} id - The unique identifier of the post to retrieve
 * @throws {NotifyError} When post ID is missing or when database query fails
 * @returns {Promise<Post>} The post document if found
 */
const viewPost = async (postId) => {
    try {

        /**
         * Validate if ID is missing
         */
        if (!postId) {
            throw new NotifyError('Missing post ID');
        };

        /**
         * Find post by ID then populate the author of the post
         */
        const post = await Posts.findById(postId).populate('author');

        return post;

    } catch (err) {
        throw err;
    }
};

/**
 * Updates an existing post with the provided data
 * @async
 * @param {string} postId - The ID of the post to edit
 * @param {Object} postData - The data to update the post with
 * @returns {Promise<Object>} The updated post
 * @throws {NotifyError} When required fields are missing or edit operation fails
 */
const editPost = async (postId, postData) => {
    try {

        /**
         * Validate all the required fields
         */
        if (!postId || !postData) {
            throw new NotifyError('Missing required fields');
        };

        /**
         * Find the post by ID then update
         */
        const post = await Posts.findByIdAndUpdate(postId, postData);

        return post;

    } catch (err) {
        throw new NotifyError(`Failed to edit post: ${err.message}`);
    }
};

/**
 * Retrieves paginated posts from the database.
 * 
 * @param {Object} query - Query parameters for pagination
 * @param {number} [query.page=1] - The page number to retrieve (defaults to 1)
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - posts: Array of post documents
 *   - currentPage: Current page number
 *   - totalDocuments: Total number of documents in the collection
 *   - totalPages: Total number of pages based on limit
 * @throws {NotifyError} If there's an error retrieving the posts
 */
const getPosts = async (query, userId = null, limit = 15) => {

    try {

        /**
         * Validate if query is missing
         */
        if (!query) throw new NotifyError('Missing Query');

        const { pageNumber = 1, search } = query;
        const currentPage = parseInt(pageNumber);

        let filterBy = {};

        if (userId) {
            filterBy.author = userId;
        };

        if (search) {
            filterBy.$or = [
                { description: { $regex: search, $options: 'i' } },
            ];
        };

        const totalDocuments = await Posts.countDocuments(filterBy).lean();
        const totalPages = Math.ceil(totalDocuments / limit);

        /**
         * Paginated list of posts
         */
        const posts = await Posts.find(filterBy)
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('author')
            .lean();

        return { posts, currentPage, totalDocuments, totalPages };

    } catch (err) {
        throw new NotifyError(`Failed to get posts: ${err.message}`, 500);
    }
};

const getPaginatedPost = async ({ page = 1, limit = 10, username, query, userId, likedOnly = false }) => {
    try {
        const currentPage = parseInt(page);
        const skip = (currentPage - 1) * limit;

        const matchStage = {};

        if (query?.trim()) {
            matchStage.description = { $regex: query.trim(), $options: 'i' };
        }

        const safeUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;


        let pipeline = [];

        // 🔁 Handle likedOnly logic
        if (likedOnly) {
            // ❌ Prevent showing liked posts of others
            if (!safeUserId || (username && userId !== safeUserId.toString())) {
                return emptyPaginationResult(currentPage, limit);
            }

            const likedPostIds = await Likes.find({ author: safeUserId }).distinct('post');
            if (likedPostIds.length === 0) {
                return emptyPaginationResult(currentPage, limit);
            }

            matchStage._id = { $in: likedPostIds };

        } else if (username) {
            const user = await Users.findOne({ username }).select('_id');
            if (!user) return emptyPaginationResult(currentPage, limit);
            matchStage.author = user._id;
        }

        // Step 2: Count total documents
        const totalDocuments = await Posts.countDocuments(matchStage);
        const totalPages = Math.ceil(totalDocuments / limit);

        // Step 3: Build aggregation
        pipeline = [
            { $match: matchStage },

            // Join author
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },

            // Join likes
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'likes'
                }
            },

            // Join comments
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments'
                }
            },

            // Computed fields
            {
                $addFields: {
                    likesCount: { $size: '$likes' },
                    commentsCount: { $size: '$comments' },
                    authorUsername: '$author.username',

                    isLikedByCurrentUser: safeUserId
                        ? {
                            $in: [
                                safeUserId,
                                {
                                    $map: {
                                        input: '$likes',
                                        as: 'like',
                                        in: '$$like.author'
                                    }
                                }
                            ]
                        }
                        : { $literal: false },

                    likedByCurrentUser: safeUserId
                        ? {
                            $slice: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: '$likes',
                                                as: 'like',
                                                cond: {
                                                    $ne: ['$$like.author', safeUserId]
                                                }
                                            }
                                        },
                                        as: 'like',
                                        in: '$$like.authorName'
                                    }
                                },
                                6
                            ]
                        }
                        : []
                }
            },

            {
                $project: {
                    likes: 0,
                    comments: 0,
                    'author.password': 0,
                    'author.public_id': 0,
                    'author.bio': 0
                }
            },

            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        const posts = await Posts.aggregate(pipeline);

        return {
            posts,
            pagination: {
                currentPage,
                limit,
                totalDocuments,
                totalPages,
                hasNextPage: currentPage < totalPages
            }
        };

    } catch (err) {
        throw new NotifyError(`Failed to get paginated posts: ${err.message}`);
    }
};

const emptyPaginationResult = (currentPage, limit) => ({
    posts: [],
    pagination: {
        currentPage,
        limit,
        totalDocuments: 0,
        totalPages: 0,
        hasNextPage: false
    }
});


/**
 * Deletes a post from the database by its ID
 * @param {string} postId - The ID of the post to delete
 * @throws {NotifyError} When postId is missing, post is not found, or deletion fails
 * @returns {Promise<Object>} The deleted post object
 */
const deletePost = async (postId) => {
    try {

        /**
         * Validate if postID is missing
         */
        if (!postId) throw new NotifyError('Missing user ID');

        /**
         * Delete post by ID
         */
        const post = await Posts.findOneAndDelete({ _id: postId }).populate('author');

        /**
         * Check if post is not found
         */
        if (!post) throw new NotifyError('Post not found');

        return post;

    } catch (err) {
        throw new NotifyError(`Failed to delete post: ${err.message}`);
    }
};

module.exports = {
    createPost,
    viewPost,
    editPost,
    getPosts,
    deletePost,
    getPaginatedPost
};