const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (prisma) => {
    const router = express.Router();

    // POST /auth/login
    router.post('/login', async (req, res) => {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'username and password required' });

        try {
            const user = await prisma.users.findUnique({ where: { username } });
            if (!user) return res.status(401).json({ error: 'invalid credentials' });

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(401).json({ error: 'invalid credentials' });

            const payload = { userId: user.id, role: user.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });

            return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        } catch (err) {
            console.error('login error', err);
            return res.status(500).json({ error: 'server error' });
        }
    });

    // POST /auth/logout (stateless placeholder)
    router.post('/logout', (req, res) => {
        // With stateless JWTs, logout is handled on client side or with token blacklist (not implemented)
        return res.json({ ok: true });
    });

    return router;
};
