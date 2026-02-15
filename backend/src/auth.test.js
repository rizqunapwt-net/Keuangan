const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Prisma
const mockPrisma = {
    users: {
        findUnique: jest.fn(),
        update: jest.fn(),
    }
};

const authRouter = require('./auth')(mockPrisma);
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Module Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /auth/login - Success', async () => {
        const password = 'hashed_password';
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync('workerpass', salt);

        mockPrisma.users.findUnique.mockResolvedValue({
            id: 'user-123',
            username: 'karyawan1',
            password_hash: passwordHash,
            role: 'KARYAWAN',
            employee: { id: 'emp-123', name: 'Test Employee', category: 'REGULER' }
        });

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'karyawan1', password: 'workerpass' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.token).toBeDefined();
        expect(response.body.user.username).toBe('karyawan1');
    });

    test('POST /auth/login - Invalid Password', async () => {
        const passwordHash = bcrypt.hashSync('correct-pass', 10);

        mockPrisma.users.findUnique.mockResolvedValue({
            id: 'user-123',
            username: 'karyawan1',
            password_hash: passwordHash,
            role: 'KARYAWAN'
        });

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'karyawan1', password: 'wrong-pass' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('invalid credentials');
    });

    test('POST /auth/login - User Not Found', async () => {
        mockPrisma.users.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'ghost', password: 'password' });

        expect(response.status).toBe(401);
    });

    test('POST /auth/biometric - Success', async () => {
        const token = jwt.sign({ userId: 'user-123' }, 'dev_secret');
        mockPrisma.users.update.mockResolvedValue({ id: 'user-123' });

        const response = await request(app)
            .post('/auth/biometric')
            .set('Authorization', `Bearer ${token}`)
            .send({ descriptor: [0.1, 0.2, 0.3] });

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockPrisma.users.update).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            data: { face_descriptor: JSON.stringify([0.1, 0.2, 0.3]) }
        });
    });

    test('POST /auth/biometric - Invalid Token', async () => {
        const response = await request(app)
            .post('/auth/biometric')
            .set('Authorization', `Bearer invalid-token`)
            .send({ descriptor: [] });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('invalid token');
    });
});
