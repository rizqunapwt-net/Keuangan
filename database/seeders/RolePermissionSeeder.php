<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.manage',
            'employees.manage',
            'attendance.manage',
            'attendance.view-own',
            'payroll.manage',
            'payroll.view-own',
            'leave.manage',
            'leave.view-own',
            'authors.manage',
            'books.manage',
            'contracts.manage',
            'marketplaces.manage',
            'assignments.manage',
            'sales.import',
            'royalties.manage',
            'payments.manage',
            'accounting.manage',
            'reports.view',
            'dashboard.view',
            'audit.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $legal = Role::firstOrCreate(['name' => 'Legal']);
        $marketing = Role::firstOrCreate(['name' => 'Marketing']);
        $finance = Role::firstOrCreate(['name' => 'Finance']);
        $karyawan = Role::firstOrCreate(['name' => 'Karyawan']);

        $admin->syncPermissions($permissions);

        $legal->syncPermissions([
            'authors.manage',
            'books.manage',
            'contracts.manage',
            'reports.view',
            'dashboard.view',
            'audit.view',
        ]);

        $marketing->syncPermissions([
            'books.manage',
            'marketplaces.manage',
            'assignments.manage',
            'reports.view',
            'dashboard.view',
        ]);

        $finance->syncPermissions([
            'authors.manage',
            'sales.import',
            'royalties.manage',
            'accounting.manage',
            'payments.manage',
            'payroll.manage',
            'reports.view',
            'dashboard.view',
            'audit.view',
        ]);

        $karyawan->syncPermissions([
            'attendance.view-own',
            'leave.view-own',
            'payroll.view-own',
            'dashboard.view',
        ]);
    }
}