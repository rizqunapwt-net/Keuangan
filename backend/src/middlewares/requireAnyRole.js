module.exports = function requireAnyRole(allowedRoles = []) {
    return function (req, res, next) {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]` });
        }

        next();
    };
};
