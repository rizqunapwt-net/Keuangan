const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const assertAuthenticated = require('../middlewares/assertAuthenticated');
const requireAnyRole = require('../middlewares/requireAnyRole');

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createEmployeeSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6),
    name: z.string().min(1),
    employeeCode: z.string().optional(),
    role: z.enum(['KARYAWAN', 'ADMIN', 'OWNER']).default('KARYAWAN'),
    category: z.enum(['REGULER', 'MAHASISWA', 'KEBUN']).default('REGULER'),
    isActive: z.boolean().default(true),
});

const updateEmployeeSchema = z.object({
    name: z.string().min(1).optional(),
    employeeCode: z.string().optional(),
    role: z.enum(['KARYAWAN', 'ADMIN', 'OWNER']).optional(),
    category: z.enum(['REGULER', 'MAHASISWA', 'KEBUN']).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(6).optional(),
});

// ============================================================================
// API ENDPOINTS
// ============================================================================

// GET /api/employees - List all employees
router.get('/employees', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const { search, role, category } = req.query;

        const where = {
            user: {}
        };

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { employee_code: { contains: search } },
                { user: { username: { contains: search } } }
            ];
        }

        if (role) {
            where.user.role = role;
        }

        if (category) {
            where.category = category;
        }

        const employees = await prisma.employees.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        is_active: true,
                        created_at: true,
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json({ success: true, data: employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data karyawan' });
    }
});

// POST /api/employees - Create new employee
router.post('/employees', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const validatedData = createEmployeeSchema.parse(req.body);

        // Check if username exists
        const existingUser = await prisma.users.findUnique({
            where: { username: validatedData.username }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Username sudah digunakan' });
        }

        const passwordHash = bcrypt.hashSync(validatedData.password, 10);

        // Transaction to create user and employee
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    username: validatedData.username,
                    password_hash: passwordHash,
                    role: validatedData.role,
                    is_active: validatedData.isActive,
                }
            });

            const employee = await tx.employees.create({
                data: {
                    user_id: user.id,
                    name: validatedData.name,
                    employee_code: validatedData.employeeCode || null,
                    category: validatedData.category,
                    is_active: validatedData.isActive,
                },
                include: {
                    user: true
                }
            });

            // Initialize leave balances for the current year if it's a new employee
            const currentYear = new Date().getFullYear();
            const leaveTypes = await tx.leave_types.findMany({ where: { is_active: true } });

            for (const type of leaveTypes) {
                await tx.leave_balances.create({
                    data: {
                        employee_id: employee.id,
                        year: currentYear,
                        leave_type_id: type.id,
                        total_quota: type.max_days,
                        remaining: type.max_days,
                    }
                });
            }

            return employee;
        });

        res.status(201).json({ success: true, message: 'Karyawan berhasil didaftarkan', data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validasi gagal', details: error.issues });
        }
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, error: 'Gagal mendaftarkan karyawan' });
    }
});

// GET /api/employees/:id - Get specific employee
router.get('/employees/:id', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const employee = await prisma.employees.findUnique({
            where: { id: req.params.id },
            include: {
                user: true,
                leave_balances: {
                    include: { leave_type: true }
                }
            }
        });

        if (!employee) {
            return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });
        }

        res.json({ success: true, data: employee });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ success: false, error: 'Gagal mengambil detail karyawan' });
    }
});

// PUT /api/employees/:id - Update employee
router.patch('/employees/:id', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const validatedData = updateEmployeeSchema.parse(req.body);

        const currentEmployee = await prisma.employees.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });

        if (!currentEmployee) {
            return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update User data if role or isActive provided
            const userData = {};
            if (validatedData.role) userData.role = validatedData.role;
            if (validatedData.isActive !== undefined) userData.is_active = validatedData.isActive;
            if (validatedData.password) userData.password_hash = bcrypt.hashSync(validatedData.password, 10);

            if (Object.keys(userData).length > 0) {
                await tx.users.update({
                    where: { id: currentEmployee.user_id },
                    data: userData
                });
            }

            // Update Employee data
            const employeeData = {};
            if (validatedData.name) employeeData.name = validatedData.name;
            if (validatedData.employeeCode !== undefined) employeeData.employee_code = validatedData.employeeCode;
            if (validatedData.category) employeeData.category = validatedData.category;
            if (validatedData.isActive !== undefined) employeeData.is_active = validatedData.isActive;

            const updatedEmployee = await tx.employees.update({
                where: { id: req.params.id },
                data: employeeData,
                include: { user: true }
            });

            return updatedEmployee;
        });

        res.json({ success: true, message: 'Data karyawan berhasil diperbarui', data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validasi gagal', details: error.issues });
        }
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, error: 'Gagal memperbarui data karyawan' });
    }
});

// DELETE /api/employees/:id - Soft delete or permanent delete
router.delete('/employees/:id', requireAnyRole(['OWNER']), async (req, res) => {
    try {
        const employee = await prisma.employees.findUnique({
            where: { id: req.params.id }
        });

        if (!employee) {
            return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });
        }

        // We choose to soft delete by deactivating the user and employee record
        // Permanent deletion would require cascading through attendance, payroll, etc.
        await prisma.$transaction([
            prisma.users.update({
                where: { id: employee.user_id },
                data: { is_active: false }
            }),
            prisma.employees.update({
                where: { id: req.params.id },
                data: { is_active: false }
            })
        ]);

        res.json({ success: true, message: 'Karyawan berhasil dinonaktifkan (Deactivated)' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ success: false, error: 'Gagal menonaktifkan karyawan' });
    }
});

module.exports = router;
