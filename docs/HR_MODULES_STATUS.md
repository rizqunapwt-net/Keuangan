# ⚠️ HR MODULES - NOT CURRENTLY USED

**Status:** ⚠️ INSTALLED BUT NOT USED  
**Decision:** KEEP for future use  
**Date:** 2026-02-20

---

## 📊 **CURRENT STATUS**

### **Data Usage:**
```
Employees: 1 record
Attendance: 0 records
Leave Requests: 0 records
Payroll: 0 records
```

### **Why Keep?**
- ✅ Karyawan role needs these features
- ✅ Future HR system ready
- ✅ Already implemented
- ✅ No maintenance cost

### **When to Use:**
- When you have real employees
- When you need attendance tracking
- When you need leave management
- When you need payroll processing

---

## 🗑️ **IF YOU WANT TO REMOVE LATER**

### **Files to Delete:**

**Models:**
```
app/Models/Employee.php
app/Models/Attendance.php
app/Models/LeaveRequest.php
app/Models/LeaveType.php
app/Models/LeaveBalance.php
app/Models/Payroll.php
app/Models/OvertimeRequest.php
```

**Controllers:**
```
app/Http/Controllers/Api/V1/EmployeeController.php
app/Http/Controllers/Api/V1/AttendanceController.php
app/Http/Controllers/Api/V1/LeaveController.php
app/Http/Controllers/Api/V1/OvertimeController.php
app/Http/Controllers/Api/V1/HrPayrollController.php
app/Http/Controllers/Api/V1/HrAuthController.php
app/Http/Controllers/Api/V1/HrNotificationController.php
```

**Routes (in routes/api.php):**
```php
// Remove this entire section:
// ── HR Protected Routes (Attendance, Leave, Overtime, Payroll) ──
Route::prefix('v1/hr')->middleware('auth:sanctum')->group(function (): void {
    // ... all HR routes
});
```

**Permissions to Remove:**
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

**Role to Update:**
```php
// Remove Karyawan role
$karyawanRole = Role::findByName('Karyawan');
$karyawanRole->delete();

// Or reassign Karyawan users to Admin
foreach ($karyawanRole->users as $user) {
    $user->removeRole('Karyawan');
    $user->assignRole('Admin');
}
```

---

## ✅ **CURRENT DECISION**

**KEEP HR MODULES** because:
1. Karyawan role needs them
2. Already implemented
3. No active maintenance cost
4. Ready when needed
5. Easy to enable later

**Documentation:**
- HR modules available but not active
- Karyawan role has self-service permissions
- Admin can enable HR features anytime

---

**Last Updated:** 2026-02-20  
**Next Review:** When first employee is hired
