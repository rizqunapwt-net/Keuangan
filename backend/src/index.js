require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const helmet = require('helmet');
const app = express();

// Security Headers
app.use(helmet());

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://absensi.infiatin.cloud',
    'https://api-absensi.infiatin.cloud',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
const prisma = new PrismaClient();

app.use(express.json());

// Auth routes (login/logout)
const authRoutes = require('./auth');
app.use('/auth', authRoutes(prisma));

// Attach auth middleware globally so `req.user` is available for RBAC middlewares
const authMiddleware = require('./auth/auth.middleware');
app.use(authMiddleware);

// Mount attendance routes (example integration)
const attendanceRoutesFactory = require('./routes/attendance');
const assertAuthenticated = require('./middlewares/assertAuthenticated');
const requireRole = require('./middlewares/requireRole');
const requireAnyRole = require('./middlewares/requireAnyRole');
const assertPayrollUnlocked = require('./guards/assertPayrollUnlocked');

app.use(
    '/attendance',
    attendanceRoutesFactory(prisma, { assertAuthenticated, requireRole, requireAnyRole, assertPayrollUnlocked })
);

// Mount attendance correction routes (contains /attendance/:id/correct)
const attendanceCorrectionRoutes = require('./routes/attendanceCorrection.routes');
app.use('/', attendanceCorrectionRoutes);

// Mount leave routes
const leaveRoutes = require('./routes/leave.routes');
app.use('/api', leaveRoutes);

// Mount overtime routes
const overtimeRoutes = require('./routes/overtime.routes');
app.use('/api', overtimeRoutes);

// Mount payroll routes
const payrollRoutes = require('./routes/payroll.routes');
app.use('/api', payrollRoutes);

// Mount notification routes
const notificationRoutes = require('./routes/notification.routes');
app.use('/api', notificationRoutes);

// Mount employee management routes
const employeeRoutes = require('./routes/employee.routes');
app.use('/api', employeeRoutes);

// user info endpoint for frontend initialization
app.get('/api/users/me', async (req, res) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: req.user.userId },
            include: { employee: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                employee_id: user.employee?.id,
                employee: user.employee
            }
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/', (req, res) => res.json({ ok: true, service: 'absensi-backend' }));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.issues
        });
    }

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
