const { getAllCommentsById } = require("../services/commentService");
const { getAllLikesById } = require("../services/likeService")

const enrichPost = async (post, user) => {
    const likes = await getAllLikesById(post._id);
    const comments = await getAllCommentsById(post._id);
    const likeCount = likes.length;
    const commentCount = comments.length;
    const isLikedByUser = user
        ? likes.some((like) => like.author.toString() === user._id.toString())
        : false;

    return {
        ...post._doc || post, // Support Mongoose documents or plain objects
        likeCount,
        isLikedByUser,
        commentCount,
        comments
    };
};

module.exports = enrichPost;