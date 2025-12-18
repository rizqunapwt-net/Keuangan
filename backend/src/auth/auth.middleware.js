const jwt = require('jsonwebtoken');

// Auth middleware: verify JWT and attach `req.user = { userId, role }` when valid.
module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string') return next();

    const parts = authHeader.split(' ');
    if (parts.length !== 2) return next();

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) return next();

    try {
        const secret = process.env.JWT_SECRET || 'dev_secret';
        const payload = jwt.verify(token, secret);
        // Expect payload contains userId and role
        req.user = {
            id: payload.userId || payload.id,
            role: payload.role
        };
    } catch (err) {
        // invalid token -> don't set req.user (assertAuthenticated will reject)
    }

    return next();
};
