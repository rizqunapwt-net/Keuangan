<?php

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
use Illuminate\Support\Str;

// Database source path
$sourcePath = 'backend/prisma/dev.db';

if (!file_exists($sourcePath)) {
    die("Source database not found at $sourcePath
");
}

// Connect to source database
$source = new PDO("sqlite:$sourcePath");

echo "Starting migration...
";

// 1. Migrate Users
$users = $source->query("SELECT * FROM users")->fetchAll(PDO::FETCH_ASSOC);
$userIdMap = []; // old_uuid => new_int_id

foreach ($users as $u) {
    echo "Processing user: {$u['username']}
";
    $user = User::updateOrCreate(
        ['username' => $u['username']],
        [
            'name' => ucfirst($u['username']),
            'email' => $u['username'] . '@rizquna.id', // Placeholder email
            'password' => $u['password_hash'], // Note: Might need re-hashing if format differs, but we keep it for now
            'role' => $u['role'],
            'is_active' => $u['is_active'],
            'face_descriptor' => $u['face_descriptor'] ?? null,
        ]
    );
    $userIdMap[$u['id']] = $user->id;
}

// 2. Migrate Employees
$employees = $source->query("SELECT * FROM employees")->fetchAll(PDO::FETCH_ASSOC);
$employeeIdMap = []; // old_uuid => new_uuid (Laravel uses varchar/string for employee ID in some cases)

foreach ($employees as $e) {
    echo "Processing employee: {$e['name']}
";
    
    // In Laravel, employee table might use same ID as source or auto-gen
    // Let's check if the ID in Laravel is a string or integer
    $newEmployee = Employee::updateOrCreate(
        ['employee_code' => $e['employee_code'] ?? 'EMP-' . $e['username']], 
        [
            'id' => $e['id'], // Keeping the UUID for compatibility with attendance
            'user_id' => $userIdMap[$e['user_id']],
            'name' => $e['name'],
            'category' => $e['category'],
            'is_active' => $e['is_active'],
            'created_at' => $e['created_at'],
            'updated_at' => $e['updated_at'],
        ]
    );
    $employeeIdMap[$e['id']] = $newEmployee->id;
}

// 3. Migrate Attendance
$attendances = $source->query("SELECT * FROM attendance")->fetchAll(PDO::FETCH_ASSOC);

foreach ($attendances as $a) {
    echo "Processing attendance for date: {$a['attendance_date']}
";
    Attendance::updateOrCreate(
        ['id' => $a['id']],
        [
            'employee_id' => $a['employee_id'],
            'attendance_date' => substr($a['attendance_date'], 0, 10), // Ensure YYYY-MM-DD
            'check_in_time' => $a['check_in_time'],
            'check_out_time' => $a['check_out_time'],
            'check_in_location' => $a['check_in_location'],
            'check_out_location' => $a['check_out_location'],
            'check_in_photo' => $a['check_in_photo'],
            'check_out_photo' => $a['check_out_photo'],
            'late_minutes' => $a['late_minutes'],
            'status' => $a['status'],
            'created_at' => $a['created_at'],
            'updated_at' => $a['updated_at'],
        ]
    );
}

echo "Migration finished successfully!
";
