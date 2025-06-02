const { default: millify } = require("millify");
const { getAllCommentsById } = require("../services/commentService");
const { getAllLikesById } = require("../services/likeService");
const { getCache, setCache } = require("./cache");


const enrichPost = async (post, user) => {

    function isLiked(user, data) {
        return user
            ? data.some((like) => like.author._id.toString() === user._id.toString())
            : false;
    };

    function usersLike(data) {

        if (!Array.isArray(data)) {
            console.warn("Expected an array in usersLike but got:", data);
            return [];
        }

        return data.map((user) => {
            const firstname = user?.author?.firstname || "Unknown";
            const lastname = user?.author?.lastname || "";
            return `${firstname} ${lastname}`.trim();
        });
    }

    const likesKey = `likes:${post._id}`;
    const commentKey = `comments:${post._id}`;

    const cachedLikes = await getCache(likesKey);
    const cachedComments = await getCache(commentKey);

    if (cachedLikes && cachedComments) {

        const cachedLikesCount = cachedLikes.length;
        const cachedCommentsCount = cachedComments.length;

        return {
            ...post._doc || post, // Support Mongoose documents or plain objects
            likeCount: millify(cachedLikesCount),
            isLikedByUser: isLiked(user, cachedLikes),
            userLikeName: usersLike(cachedLikes),
            commentCount: cachedCommentsCount,
            comments: cachedComments
        };
    };

    const likes = await getAllLikesById(post._id);
    const comments = await getAllCommentsById(post._id);
    const likeCount = likes.length;
    const commentCount = comments.length;

    await setCache(likesKey, likes);
    await setCache(commentKey, comments);

    return {
        ...post._doc || post,
        likeCount: millify(likeCount),
        isLikedByUser: isLiked(user, likes),
        userLikeName: usersLike(likes),
        commentCount,
        comments
    };
};

module.exports = enrichPost;