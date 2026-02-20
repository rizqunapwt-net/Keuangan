# 👥 ROLES & PERMISSIONS - Sistem Percetakan New Rizquna Elfath

**Tanggal:** 20 Februari 2026  
**Total Roles:** 3 (Simplified)  
**Total Permissions:** 32  

---

## 📊 **OVERVIEW**

| Role | Permissions | Access Level | Description |
|------|-------------|--------------|-------------|
| **Admin** | 20 | FULL ACCESS | Management & Operations |
| **Karyawan** | 4 | PERSONAL DATA | Employee Self-Service |
| **Author** | 8 | PERSONAL PUBLISHING | Author Portal Access |

---

## 🔑 **1. ADMIN** (Full Access)

**Description:** Administrator dengan akses penuh ke semua fitur sistem

**Permissions:** 20

### **HR Management (8 permissions):**
- ✅ `users.manage` - Manage user accounts
- ✅ `employees.manage` - Manage employee data
- ✅ `attendance.manage` - Manage attendance records
- ✅ `attendance.view-own` - View own attendance
- ✅ `payroll.manage` - Manage payroll
- ✅ `payroll.view-own` - View own payroll
- ✅ `leave.manage` - Manage leave requests
- ✅ `leave.view-own` - View own leave

### **Publishing Management (7 permissions):**
- ✅ `authors.manage` - Manage authors
- ✅ `books.manage` - Manage books
- ✅ `contracts.manage` - Manage contracts
- ✅ `marketplaces.manage` - Manage marketplaces
- ✅ `assignments.manage` - Manage book assignments
- ✅ `sales.import` - Import sales data
- ✅ `royalties.manage` - Manage royalty calculations

### **Finance & Accounting (3 permissions):**
- ✅ `payments.manage` - Manage payments
- ✅ `accounting.manage` - Manage accounting
- ✅ `audit.view` - View audit logs

### **Reports & Dashboard (2 permissions):**
- ✅ `reports.view` - View all reports
- ✅ `dashboard.view` - View dashboard

### **Can Do:**
- ✅ **HR:** Manage users, employees, attendance, leave, payroll
- ✅ **Publishing:** Manage authors, books, contracts, marketplaces
- ✅ **Sales:** Import sales, calculate royalties, process payments
- ✅ **Finance:** Manage accounting, view audit logs
- ✅ **Reports:** View all reports & dashboards
- ✅ **System:** Full system configuration

### **Cannot Do:**
- ❌ Nothing - Full access to all features!

### **Typical Users:**
- Owner/CEO
- Operations Manager
- System Administrator
- HR Manager (with full access)
- Finance Manager (with full access)
- Legal Team (with full access)
- Marketing Team (with full access)

---

## 👤 **2. KARYAWAN** (Employee Self-Service)

**Description:** Karyawan biasa (akses terbatas ke data pribadi)

**Permissions:** 4

### **Personal Access:**
- ✅ `attendance.view-own` - View own attendance
- ✅ `leave.view-own` - View own leave balance
- ✅ `payroll.view-own` - View own payroll
- ✅ `dashboard.view` - View dashboard

### **Can Do:**
- ✅ View own attendance records
- ✅ Submit leave requests
- ✅ View own leave balance
- ✅ View own payroll slips
- ✅ View general dashboard

### **Cannot Do:**
- ❌ Manage other employees
- ❌ Manage attendance records
- ❌ Approve leave requests
- ❌ Process payroll
- ❌ Access publishing modules
- ❌ Access finance modules
- ❌ View reports (except personal)

### **Typical Users:**
- All regular employees
- Staff members
- Non-management personnel

---

## ✍️ **3. AUTHOR** (Penulis Mitra)

**Description:** Penulis mitra (akses terbatas ke data sendiri)

**Permissions:** 8

### **Author Portal:**
- ✅ `author_contracts_read` - Read contracts
- ✅ `author_contracts_sign` - Sign contracts
- ✅ `author_books_read` - View own books
- ✅ `author_books_write` - Edit own book info
- ✅ `author_royalties_read` - View royalty calculations
- ✅ `author_royalty_reports_read` - View royalty reports
- ✅ `author_sales_read` - View sales data (transparency)
- ✅ `author_profile_write` - Edit own profile

### **Can Do:**
- ✅ View contracts for own books
- ✅ Sign/reject contracts digitally
- ✅ View books they authored
- ✅ Edit book metadata (description, etc)
- ✅ View royalty calculations
- ✅ View detailed royalty reports with breakdown
- ✅ View sales data (full transparency)
- ✅ Edit personal profile & bank account info

### **Cannot Do:**
- ❌ Manage other authors
- ❌ Create contracts
- ❌ Import sales
- ❌ Calculate royalties
- ❌ Process payments
- ❌ Access employee modules
- ❌ View other authors' data

### **Typical Users:**
- External authors
- Book writers
- Content creators

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

## 📋 **PERMISSION CATEGORIES**

### **HR Permissions (8):**
```
users.manage
employees.manage
attendance.manage
attendance.view-own
payroll.manage
payroll.view-own
leave.manage
leave.view-own
```

### **Publishing Permissions (7):**
```
authors.manage
books.manage
contracts.manage
marketplaces.manage
assignments.manage
sales.import
royalties.manage
```

### **Finance Permissions (3):**
```
payments.manage
accounting.manage
audit.view
```

### **Reports & Dashboard (2):**
```
reports.view
dashboard.view
```

### **Author-Specific Permissions (8):**
```
author_contracts_read
author_contracts_sign
author_books_read
author_books_write
author_royalties_read
author_royalty_reports_read
author_sales_read
author_profile_write
```

---

## 🔧 **MANAGING ROLES**

### **Assign Role to User:**
```bash
php artisan tinker
```

```php
// Assign Admin role
$user = App\Models\User::find(1);
$user->assignRole('Admin');

// Assign Karyawan role
$employee->assignRole('Karyawan');

// Assign Author role
$author->assignRole('Author');
```

### **Check User Role:**
```php
if ($user->hasRole('Admin')) {
    // User is Admin
}

if ($user->hasRole('Karyawan')) {
    // User is Employee
}

if ($user->hasRole('Author')) {
    // User is Author
}
```

### **Check Permission:**
```php
if ($user->can('books.manage')) {
    // User can manage books
}

if ($user->can('author_contracts_read')) {
    // User can read contracts
}
```

---

## 🛡️ **SECURITY BEST PRACTICES**

### **1. Principle of Least Privilege:**
- **Admin:** Only give to trusted management
- **Karyawan:** Default role for all employees
- **Author:** Only for external authors

### **2. Role Assignment:**
```php
// CEO/Owner - Full access
$ceo->assignRole('Admin');

// Manager - Full access
$manager->assignRole('Admin');

// Regular Employee - Self-service only
$employee->assignRole('Karyawan');

// External Author - Personal data only
$author->assignRole('Author');
```

### **3. Permission Caching:**
```bash
# Clear permission cache if issues
php artisan cache:forget spatie.permission.cache
```

---

## 📊 **ROLE STATISTICS**

```
Total Roles: 3
Total Permissions: 32

Permission Distribution:
- Admin: 20 permissions (62.5%)
- Author: 8 permissions (25.0%)
- Karyawan: 4 permissions (12.5%)
```

---

## 🎯 **RECOMMENDED USAGE**

### **Small Team (< 10 people):**
- **Owner:** Admin
- **All Staff:** Admin (for flexibility)
- **Authors:** Author

### **Medium Team (10-50 people):**
- **Management:** Admin
- **All Employees:** Karyawan
- **Authors:** Author

### **Large Team (> 50 people):**
- **Senior Management:** Admin
- **Department Heads:** Admin
- **All Staff:** Karyawan
- **Authors:** Author

---

## 📝 **EXAMPLE USER ASSIGNMENTS**

```php
// Owner/CEO - Full access
$owner->assignRole('Admin');

// Operations Manager - Full access
$ops->assignRole('Admin');

// HR Staff - Full access (HR functions)
$hr->assignRole('Admin');

// Finance Staff - Full access (Finance functions)
$finance->assignRole('Admin');

// Legal Staff - Full access (Legal functions)
$legal->assignRole('Admin');

// Marketing Staff - Full access (Marketing functions)
$marketing->assignRole('Admin');

// Regular Employee - Self-service
$employee->assignRole('Karyawan');

// External Author - Personal data
$author->assignRole('Author');
```

---

## ✅ **SUMMARY**

**3 Roles dengan akses berbeda:**

1. **Admin** (20 permissions)
   - Full access to all features
   - HR, Publishing, Finance, Reports
   - Management & operations

2. **Karyawan** (4 permissions)
   - Personal HR data only
   - Attendance, leave, payroll (own)
   - Self-service

3. **Author** (8 permissions)
   - Personal publishing data
   - Contracts, books, royalties, sales
   - Transparency portal

**Total:** 32 permissions across 3 roles

---

## 🚀 **MIGRATION NOTES**

**What Changed:**
- ❌ Removed: Legal role
- ❌ Removed: Marketing role
- ❌ Removed: Finance role
- ✅ Merged all permissions into Admin role
- ✅ Simplified from 6 roles to 3 roles

**Impact:**
- ✅ Easier role management
- ✅ Clearer access control
- ✅ Simpler user assignment
- ✅ No functionality lost

**Migration:**
- All Legal/Marketing/Finance users → Admin role
- All Karyawan users → Karyawan role (no change)
- All Author users → Author role (no change)

---

**Documentation Complete! 📚**
