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
            const user = await prisma.users.findUnique({
                where: { username },
                include: {
                    employee: true
                }
            });

            if (!user) {
                return res.status(401).json({ error: 'invalid credentials' });
            }

            const valid = bcrypt.compareSync(password, user.password_hash);
            if (!valid) {
                return res.status(401).json({ error: 'invalid credentials' });
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    role: user.role,
                    employee_id: user.employee?.id
                },
                process.env.JWT_SECRET || 'dev_secret',
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                status: 'success',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    face_descriptor: user.face_descriptor,
                    employee: user.employee ? {
                        id: user.employee.id,
                        name: user.employee.name,
                        category: user.employee.category
                    } : null
                }
            });
        } catch (err) {
            console.error('login error', err);
            return res.status(500).json({ error: 'server error' });
        }
    });

    // POST /auth/logout (stateless placeholder)
    router.post('/logout', (req, res) => {
        return res.json({ ok: true });
    });

    // POST /auth/biometric
    router.post('/biometric', async (req, res) => {
        const { descriptor } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'no token' });

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
            await prisma.users.update({
                where: { id: decoded.userId },
                data: { face_descriptor: JSON.stringify(descriptor) }
            });
            return res.json({ ok: true });
        } catch (err) {
            return res.status(401).json({ error: 'invalid token' });
        }
    });

    return router;
};
