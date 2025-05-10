const { getAllLikesById } = require("../services/likeService")

const enrichPostWithLikes = async (post, user) => {
    const likes = await getAllLikesById(post._id);
    const likeCount = likes.length;
    const isLikedByUser = user
        ? likes.some((like) => like.author.toString() === user._id.toString())
        : false;

    return {
        ...post._doc || post, // Support Mongoose documents or plain objects
        likeCount,
        isLikedByUser
    };
};

module.exports = enrichPostWithLikes;