<?php
/**
 * Create a test karyawan (employee) user for attendance simulation.
 * Run: php scripts/seed-test-employee.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->handleRequest(Illuminate\Http\Request::capture());

use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

// Seed roles if needed
if (\Spatie\Permission\Models\Role::count() === 0) {
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'Database\Seeders\RolePermissionSeeder']);
    echo "✅ Roles seeded\n";
}

// Create user
$user = User::firstOrCreate(
['email' => 'budi@nre.test'],
[
    'name' => 'Budi Karyawan',
    'username' => 'budi',
    'password' => Hash::make('password123'),
    'role' => 'KARYAWAN',
    'is_active' => true,
]
);
echo "👤 User: {$user->name} (ID: {$user->id})\n";

// Assign role
if (!$user->hasRole('Karyawan')) {
    // Create Karyawan role if it doesn't exist
    $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Karyawan', 'guard_name' => 'web']);
    $user->assignRole('Karyawan');
    echo "🔑 Role: Karyawan assigned\n";
}

// Create employee record
$employee = Employee::firstOrCreate(
['user_id' => $user->id],
[
    'id' => (string)Str::uuid(),
    'name' => 'Budi Karyawan',
    'email' => 'budi@nre.test',
    'phone' => '081234567890',
    'position' => 'Staff Gudang',
    'department' => 'Operasional',
    'category' => 'TETAP',
    'join_date' => '2025-01-15',
    'status' => 'AKTIF',
]
);
echo "🏢 Employee: {$employee->name} (ID: {$employee->id})\n";
echo "\n📋 Kredensial Login:\n";
echo "   Username: budi\n";
echo "   Password: password123\n";
echo "\n✅ Siap untuk simulasi absensi!\n";