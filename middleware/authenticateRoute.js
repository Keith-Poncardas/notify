const requireAuth = (req, res, next) => {
    if (!res.locals.user) {
        return res.redirect('/');
    }

    next();
};

module.exports = requireAuth;
