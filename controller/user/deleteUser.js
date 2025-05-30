module.exports = async (req, res, next) => {
    const { username } = req.params;
    try {
        await deleteUser(username);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};
