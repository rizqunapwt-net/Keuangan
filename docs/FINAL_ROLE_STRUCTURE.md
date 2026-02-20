# 👥 FINAL ROLE STRUCTURE - Sistem Percetakan New Rizquna Elfath

**Tanggal:** 20 Februari 2026  
**Decision:** KEEP Karyawan Role  
**Status:** ✅ FINALIZED

---

## 📊 **FINAL ROLE STRUCTURE (3 Roles)**

| Role | Users | Permissions | Access Level | Purpose |
|------|-------|-------------|--------------|---------|
| **Admin** | Management | 20 | FULL ACCESS | System management & operations |
| **Karyawan** | Employees | 4 | SELF-SERVICE | Employee HR self-service |
| **Author** | Authors | 8 | PERSONAL DATA | Author portal access |

**Total:** 3 Roles, 32 Permissions

---

## 🔑 **1. ADMIN** (Full Access)

**Description:** Administrator dengan akses penuh ke semua fitur sistem

**Users:**
- Owner/CEO
- Operations Manager
- HR Staff
- Finance Staff
- Legal Staff
- Marketing Staff

**Permissions (20):**

### **HR Management (8):**
- ✅ `users.manage` - Manage user accounts
- ✅ `employees.manage` - Manage employee data
- ✅ `attendance.manage` - Manage attendance records
- ✅ `attendance.view-own` - View own attendance
- ✅ `payroll.manage` - Manage payroll
- ✅ `payroll.view-own` - View own payroll
- ✅ `leave.manage` - Manage leave requests
- ✅ `leave.view-own` - View own leave

### **Publishing Management (7):**
- ✅ `authors.manage` - Manage authors
- ✅ `books.manage` - Manage books
- ✅ `contracts.manage` - Manage contracts
- ✅ `marketplaces.manage` - Manage marketplaces
- ✅ `assignments.manage` - Manage book assignments
- ✅ `sales.import` - Import sales data
- ✅ `royalties.manage` - Manage royalty calculations

### **Finance & Accounting (3):**
- ✅ `payments.manage` - Manage payments
- ✅ `accounting.manage` - Manage accounting
- ✅ `audit.view` - View audit logs

### **Reports & Dashboard (2):**
- ✅ `reports.view` - View all reports
- ✅ `dashboard.view` - View dashboard

**Can Do:**
- ✅ Full access to all modules
- ✅ HR, Publishing, Finance, Accounting
- ✅ All reports & dashboards
- ✅ System configuration

**Cannot Do:**
- ❌ Nothing - Full access!

---

## 👤 **2. KARYAWAN** (Employee Self-Service)

**Description:** Karyawan biasa (akses terbatas ke data pribadi)

**Users:**
- Regular employees
- Staff members
- Non-management personnel

**Permissions (4):**

### **Self-Service HR (4):**
- ✅ `attendance.view-own` - View own attendance
- ✅ `leave.view-own` - View own leave balance
- ✅ `payroll.view-own` - View own payroll slip
- ✅ `dashboard.view` - View general dashboard

**Can Do:**
- ✅ View own attendance records
- ✅ Submit leave requests
- ✅ View own leave balance
- ✅ View own payroll slips
- ✅ View general dashboard

**Cannot Do:**
- ❌ Manage other employees
- ❌ Manage attendance records
- ❌ Approve leave requests
- ❌ Process payroll
- ❌ Access publishing modules
- ❌ Access finance modules
- ❌ View reports (except personal)

**Use Case:**
> "Saya punya karyawan yang perlu lihat absensi sendiri, submit cuti, dan lihat slip gaji. Karyawan role ini untuk mereka."

---

## ✍️ **3. AUTHOR** (Penulis Mitra)

**Description:** Penulis mitra (akses terbatas ke data sendiri)

**Users:**
- External authors
- Book writers
- Content creators

**Permissions (8):**

### **Author Portal (8):**
- ✅ `author_contracts_read` - Read contracts
- ✅ `author_contracts_sign` - Sign contracts
- ✅ `author_books_read` - View own books
- ✅ `author_books_write` - Edit own book info
- ✅ `author_royalties_read` - View royalty calculations
- ✅ `author_royalty_reports_read` - View royalty reports
- ✅ `author_sales_read` - View sales data (transparency)
- ✅ `author_profile_write` - Edit own profile

**Can Do:**
- ✅ View contracts for own books
- ✅ Sign/reject contracts digitally
- ✅ View books they authored
- ✅ Edit book metadata (description, etc)
- ✅ View royalty calculations
- ✅ View detailed royalty reports
- ✅ View sales data (full transparency)
- ✅ Edit personal profile & bank account info

**Cannot Do:**
- ❌ Manage other authors
- ❌ Create contracts
- ❌ Import sales
- ❌ Calculate royalties
- ❌ Process payments
- ❌ Access employee modules
- ❌ View other authors' data

**Use Case:**
> "Saya punya penulis mitra yang perlu lihat kontrak, royalti, dan penjualan bukunya sendiri. Author role ini untuk mereka."

---

## 🎯 **ACCESS MATRIX**

| Module | Admin | Karyawan | Author |
|--------|-------|----------|--------|
| **Users** | ✅ | ❌ | ❌ |
| **Employees** | ✅ | ❌ | ❌ |
| **Attendance** | ✅ | Own | ❌ |
| **Leave** | ✅ | Own | ❌ |
| **Payroll** | ✅ | Own | ❌ |
| **Authors** | ✅ | ❌ | ❌ |
| **Books** | ✅ | ❌ | Own |
| **Contracts** | ✅ | ❌ | Read/Sign |
| **Marketplaces** | ✅ | ❌ | ❌ |
| **Assignments** | ✅ | ❌ | ❌ |
| **Sales Import** | ✅ | ❌ | ❌ |
| **Royalties** | ✅ | ❌ | Read |
| **Payments** | ✅ | ❌ | ❌ |
| **Accounting** | ✅ | ❌ | ❌ |
| **Reports** | ✅ | ❌ | ❌ |
| **Dashboard** | ✅ | ✅ | ✅ |
| **Audit** | ✅ | ❌ | ❌ |

---

## 🔧 **USAGE EXAMPLES**

### **Assign Role:**

```php
// For management/staff
$user->assignRole('Admin');

// For regular employee
$employee->assignRole('Karyawan');

// For external author
$author->assignRole('Author');
```

### **Check Role:**

```php
// Check if Admin
if ($user->hasRole('Admin')) {
    // Full access
}

// Check if Employee
if ($user->hasRole('Karyawan')) {
    // Self-service only
}

// Check if Author
if ($user->hasRole('Author')) {
    // Author portal access
}
```

### **Check Permission:**

```php
// Check if can manage books
if ($user->can('books.manage')) {
    // Can manage books
}

// Check if can view own attendance
if ($user->can('attendance.view-own')) {
    // Can view own attendance
}

// Check if can read contracts
if ($user->can('author_contracts_read')) {
    // Can read author contracts
}
```

---

## 📋 **DECISION RATIONALE**

### **Why KEEP Karyawan Role?**

1. **Test User Exists** ✅
   - Budi Karyawan (budi@nre.test) sudah ada
   - User ini untuk testing HR features

2. **HR System Ready** ✅
   - Attendance, Leave, Payroll modules sudah ada
   - Tinggal pakai kalau butuh

3. **Proper Separation** ✅
   - Admin: Full access
   - Karyawan: Self-service only
   - Author: Personal data only
   - Clear separation of duties

4. **Future-Proof** ✅
   - Easy to add employees later
   - HR features ready when needed
   - No rebuild required

5. **Best Practice** ✅
   - Principle of least privilege
   - Role-based access control
   - Proper RBAC implementation

---

## ⚠️ **WHEN TO USE EACH ROLE**

### **Use Admin Role When:**
- User needs to manage system
- User needs to manage employees
- User needs to manage publishing
- User needs to manage finance
- User needs to view all reports
- User is management/staff

### **Use Karyawan Role When:**
- User is regular employee
- User only needs self-service
- User should NOT manage others
- User should NOT access publishing
- User should NOT access finance
- User only needs to view own data

### **Use Author Role When:**
- User is external author
- User has written books
- User needs to view contracts
- User needs to view royalties
- User needs to view sales
- User should NOT access internal system

---

## 📊 **STATISTICS**

```
Total Roles: 3
Total Permissions: 32

Permission Distribution:
- Admin: 20 permissions (62.5%)
- Karyawan: 4 permissions (12.5%)
- Author: 8 permissions (25.0%)

Current Users:
- Admin: Multiple users
- Karyawan: 1 user (Budi Karyawan)
- Author: 1 user (Test Author)
```

---

## ✅ **SUMMARY**

**Final Structure:**
- ✅ 3 Roles (Admin, Karyawan, Author)
- ✅ 32 Permissions total
- ✅ Clear access levels
- ✅ Proper separation of duties
- ✅ Future-proof design

**Decision:**
- ✅ KEEP Karyawan role
- ✅ KEEP HR modules (ready to use)
- ✅ KEEP 4 Karyawan permissions
- ✅ KEEP test user (Budi Karyawan)

**Benefits:**
- ✅ Proper RBAC implementation
- ✅ Employee self-service ready
- ✅ HR system ready when needed
- ✅ Clear role separation
- ✅ Scalable for growth

---

**Documentation Finalized! 📚**

**Next Steps:**
1. ✅ Use this role structure
2. ✅ Assign roles appropriately
3. ✅ Document in user manual
4. ✅ Train users on their roles
