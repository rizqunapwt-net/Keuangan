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
            const userWithEmployee = await prisma.users.findUnique({
                where: { username },
                include: {
                    employees: true
                }
            });

            const employee = userWithEmployee.employees[0] || null;

            return res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    face_descriptor: user.face_descriptor,
                    employee: employee ? {
                        id: employee.id,
                        name: employee.name,
                        category: employee.category
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
        // With stateless JWTs, logout is handled on client side or with token blacklist (not implemented)
        return res.json({ ok: true });
    });

    // POST /auth/biometric
    router.post('/biometric', async (req, res) => {
        const { descriptor } = req.body;
        // Since this route is under /auth, and global middleware is AFTER, 
        // we might not have req.user yet if called here.
        // But we want it protected.
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
