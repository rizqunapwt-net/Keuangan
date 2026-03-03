<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define Permissions
        $permissions = [
            // Inventory & Products
            'products_read', 'products_write', 'inventory_read', 'inventory_write',
            // Sales & POS
            'sales_read', 'sales_write', 'pos_access',
            // Finance & Accounting
            'reports_read', 'accounting_read', 'accounting_write',
            // User Management
            'users_read', 'users_write',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 2. Create Single Role: Admin
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        // 3. Clean up other roles for project security
        Role::where('name', '!=', 'Admin')->delete();
    }
}
