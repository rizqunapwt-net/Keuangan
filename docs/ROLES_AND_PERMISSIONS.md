# 👥 ROLES & PERMISSIONS - Sistem Percetakan New Rizquna Elfath

**Tanggal:** 20 Februari 2026  
**Total Roles:** 6  
**Total Permissions:** 52+  

---

## 📊 **OVERVIEW**

| Role | Permissions | Category | Access Level |
|------|-------------|----------|--------------|
| **Admin** | 20 | Management | Full Access |
| **Legal** | 6 | Publishing | Limited |
| **Marketing** | 5 | Publishing | Limited |
| **Finance** | 9 | Finance | Financial Data |
| **Karyawan** | 4 | HR | Personal Data |
| **Author** | 8 | Publishing | Personal Data |

---

## 🔑 **1. ADMIN** (Full Access)

**Description:** Administrator dengan akses penuh ke semua fitur sistem

**Permissions:** 20

### **HR Management:**
- ✅ `users.manage` - Manage user accounts
- ✅ `employees.manage` - Manage employee data
- ✅ `attendance.manage` - Manage attendance records
- ✅ `attendance.view-own` - View own attendance
- ✅ `payroll.manage` - Manage payroll
- ✅ `payroll.view-own` - View own payroll
- ✅ `leave.manage` - Manage leave requests
- ✅ `leave.view-own` - View own leave

### **Publishing Management:**
- ✅ `authors.manage` - Manage authors
- ✅ `books.manage` - Manage books
- ✅ `contracts.manage` - Manage contracts
- ✅ `marketplaces.manage` - Manage marketplaces
- ✅ `assignments.manage` - Manage book assignments
- ✅ `sales.import` - Import sales data
- ✅ `royalties.manage` - Manage royalty calculations
- ✅ `payments.manage` - Manage payments

### **Accounting & Reports:**
- ✅ `accounting.manage` - Manage accounting
- ✅ `reports.view` - View all reports
- ✅ `dashboard.view` - View dashboard
- ✅ `audit.view` - View audit logs

### **Can Do:**
- ✅ Access all modules (HR, Publishing, Finance, Accounting)
- ✅ Create/edit/delete users, employees, authors
- ✅ Manage all publishing workflow
- ✅ Import sales, calculate royalties
- ✅ Process payments & payroll
- ✅ View all reports & audit logs
- ✅ Configure system settings

### **Cannot Do:**
- ❌ Nothing - Full access!

---

## ⚖️ **2. LEGAL** (Contract Management)

**Description:** Tim legal yang mengelola kontrak penulis

**Permissions:** 6

### **Publishing:**
- ✅ `authors.manage` - Manage authors
- ✅ `books.manage` - Manage books
- ✅ `contracts.manage` - Manage contracts

### **Reports:**
- ✅ `reports.view` - View reports
- ✅ `dashboard.view` - View dashboard
- ✅ `audit.view` - View audit logs

### **Can Do:**
- ✅ Create/edit author profiles
- ✅ Create/edit book records
- ✅ Create contracts
- ✅ Review & approve contracts
- ✅ Reject contracts
- ✅ View publishing reports
- ✅ Access audit logs for contracts

### **Cannot Do:**
- ❌ Manage employees
- ❌ Process payroll
- ❌ Import sales
- ❌ Calculate royalties
- ❌ Process payments
- ❌ Manage accounting

---

## 📢 **3. MARKETING** (Book Promotion)

**Description:** Tim marketing yang mengelola pemasaran buku

**Permissions:** 5

### **Publishing:**
- ✅ `books.manage` - Manage books
- ✅ `marketplaces.manage` - Manage marketplaces
- ✅ `assignments.manage` - Manage book assignments to marketplaces

### **Reports:**
- ✅ `reports.view` - View reports
- ✅ `dashboard.view` - View dashboard

### **Can Do:**
- ✅ View & edit book information
- ✅ Manage marketplace accounts
- ✅ Assign books to marketplaces
- ✅ View sales reports
- ✅ View marketing dashboard

### **Cannot Do:**
- ❌ Manage authors
- ❌ Create contracts
- ❌ Import sales
- ❌ Calculate royalties
- ❌ Process payments
- ❌ Manage employees

---

## 💰 **4. FINANCE** (Financial Management)

**Description:** Tim finance yang mengelola keuangan & royalti

**Permissions:** 9

### **Publishing:**
- ✅ `authors.manage` - Manage authors (for payment info)
- ✅ `sales.import` - Import sales data
- ✅ `royalties.manage` - Manage royalty calculations
- ✅ `payments.manage` - Manage payments

### **Accounting:**
- ✅ `accounting.manage` - Manage accounting
- ✅ `payroll.manage` - Manage payroll

### **Reports:**
- ✅ `reports.view` - View all reports
- ✅ `dashboard.view` - View dashboard
- ✅ `audit.view` - View audit logs

### **Can Do:**
- ✅ Import sales data from marketplaces
- ✅ Calculate royalties for authors
- ✅ Process royalty payments
- ✅ Manage accounting entries
- ✅ Process payroll
- ✅ View financial reports
- ✅ Access audit logs
- ✅ Manage author payment info

### **Cannot Do:**
- ❌ Manage employees (except payroll)
- ❌ Manage attendance
- ❌ Manage leave requests
- ❌ Create contracts
- ❌ Assign books to marketplaces

---

## 👤 **5. KARYAWAN** (Employee - HR Access)

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

---

## ✍️ **6. AUTHOR** (Penulis)

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
- ✅ View detailed royalty reports
- ✅ View sales data (transparency)
- ✅ Edit personal profile & bank info

### **Cannot Do:**
- ❌ Manage other authors
- ❌ Create contracts
- ❌ Import sales
- ❌ Calculate royalties
- ❌ Process payments
- ❌ Access employee modules
- ❌ View other authors' data

---

## 📋 **PERMISSION CATEGORIES**

### **HR Permissions:**
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

### **Publishing Permissions:**
```
authors.manage
books.manage
contracts.manage
marketplaces.manage
assignments.manage
sales.import
royalties.manage
payments.manage
```

### **Accounting Permissions:**
```
accounting.manage
reports.view
audit.view
```

### **Author-Specific Permissions:**
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

## 🎯 **ACCESS MATRIX**

| Module | Admin | Legal | Marketing | Finance | Karyawan | Author |
|--------|-------|-------|-----------|---------|----------|--------|
| **Users** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Employees** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Attendance** | ✅ | ❌ | ❌ | ❌ | Own | ❌ |
| **Leave** | ✅ | ❌ | ❌ | ❌ | Own | ❌ |
| **Payroll** | ✅ | ❌ | ❌ | ✅ | Own | ❌ |
| **Authors** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Books** | ✅ | ✅ | ✅ | ❌ | ❌ | Own |
| **Contracts** | ✅ | ✅ | ❌ | ❌ | ❌ | Read/Sign |
| **Marketplaces** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Assignments** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Sales Import** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Royalties** | ✅ | ❌ | ❌ | ✅ | ❌ | Read |
| **Payments** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Accounting** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Reports** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Audit** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## 🔧 **MANAGING ROLES**

### **Create New Role:**
```bash
php artisan tinker
```

```php
use Spatie\Permission\Models\Role;

// Create role
$role = Role::create(['name' => 'Manager']);

// Assign permissions
$role->givePermissionTo([
    'books.manage',
    'contracts.manage',
    'reports.view',
]);
```

### **Assign Role to User:**
```php
$user = App\Models\User::find(1);
$user->assignRole('Admin');

// Or multiple roles
$user->assignRole(['Admin', 'Finance']);
```

### **Remove Role from User:**
```php
$user->removeRole('Admin');
```

### **Check User Role:**
```php
if ($user->hasRole('Admin')) {
    // User is Admin
}

if ($user->hasAnyRole(['Admin', 'Finance'])) {
    // User is Admin OR Finance
}

if ($user->hasAllRoles(['Admin', 'Finance'])) {
    // User is Admin AND Finance
}
```

### **Check Permission:**
```php
if ($user->can('books.manage')) {
    // User can manage books
}

if ($user->can('contracts.manage')) {
    // User can manage contracts
}
```

---

## 🛡️ **SECURITY BEST PRACTICES**

### **1. Principle of Least Privilege:**
- Give users minimum permissions needed
- Don't assign Admin role unless necessary
- Use specific roles (Legal, Marketing, Finance)

### **2. Role Separation:**
- Separate duties (Finance vs Legal vs Marketing)
- No single user should have conflicting roles
- Example: Finance shouldn't also be Legal

### **3. Regular Audits:**
```bash
# View all users with Admin role
php artisan tinker
>>> Role::findByName('Admin')->users()->get();

# View all permissions for a role
>>> Role::findByName('Finance')->permissions()->get();
```

### **4. Permission Caching:**
```bash
# Clear permission cache if issues
php artisan cache:forget spatie.permission.cache
```

---

## 📊 **ROLE STATISTICS**

```
Total Roles: 6
Total Permissions: 52+

Permission Distribution:
- Admin: 20 permissions (38.5%)
- Finance: 9 permissions (17.3%)
- Author: 8 permissions (15.4%)
- Legal: 6 permissions (11.5%)
- Marketing: 5 permissions (9.6%)
- Karyawan: 4 permissions (7.7%)
```

---

## 🎯 **RECOMMENDED ROLE ASSIGNMENTS**

### **Small Team:**
- **Owner:** Admin
- **Admin Staff:** Admin (limited)
- **Legal:** Legal
- **Marketing:** Marketing
- **Finance:** Finance
- **Authors:** Author
- **Employees:** Karyawan

### **Medium Team:**
- **CEO/Owner:** Admin
- **HR Manager:** Admin (HR focus)
- **Publishing Manager:** Admin (Publishing focus)
- **Finance Manager:** Finance
- **Legal Team:** Legal
- **Marketing Team:** Marketing
- **Authors:** Author
- **All Staff:** Karyawan

### **Large Team:**
- **Multiple Admins** with different focuses
- **Dedicated roles** for each department
- **Granular permissions** as needed

---

## 📝 **EXAMPLE USER ASSIGNMENTS**

```php
// CEO - Full access
$ceo->assignRole('Admin');

// Legal Manager
$legal->assignRole('Legal');

// Marketing Manager  
$marketing->assignRole('Marketing');

// Finance Manager
$finance->assignRole('Finance');

// HR Staff
$hr->assignRole('Karyawan');
$hr->givePermissionTo(['employees.manage', 'attendance.manage', 'leave.manage']);

// Author (External)
$author->assignRole('Author');

// Regular Employee
$employee->assignRole('Karyawan');
```

---

## ✅ **SUMMARY**

**6 Roles dengan tanggung jawab berbeda:**

1. **Admin** - Full access (20 permissions)
2. **Legal** - Contract management (6 permissions)
3. **Marketing** - Book marketing (5 permissions)
4. **Finance** - Financial management (9 permissions)
5. **Karyawan** - Personal HR access (4 permissions)
6. **Author** - Personal publishing data (8 permissions)

**Total:** 52+ permissions across all roles

---

**Documentation Complete! 📚**
