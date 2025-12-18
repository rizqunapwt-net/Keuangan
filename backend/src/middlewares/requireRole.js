module.exports = function requireRole(requiredRole) {
    return function (req, res, next) {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthenticated' });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: `Forbidden: requires role ${requiredRole}` });
        }

        next();
    };
};
