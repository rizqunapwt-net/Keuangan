module.exports = function assertAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    next();
};
