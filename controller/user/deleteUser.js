const { deleteUser } = require("../../services/userService");
const deleteKeysByPattern = require("../../utils/deleteKeysByPattern");

module.exports = async (req, res, next) => {
    const { username } = req.params;
    try {
        await deleteUser(username);
        await deleteKeysByPattern(`userPosts:${username}:page=*:limit=*`);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};
