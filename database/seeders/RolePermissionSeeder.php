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
            'admin.access',
            // Inventory & Products
            'products_read', 'products_write', 'inventory_read', 'inventory_write',
            // Sales & POS
            'sales_read', 'sales_write', 'pos_access',
            // Finance & Accounting
            'finance.view_reports', 'finance.manage_accounts', 'reports_read', 'accounting_read', 'accounting_write',
            'debt.view', 'debt.create', 'debt.edit', 'debt.delete', 'debt.record_payment',
            // User Management
            'users_read', 'users_write',
            // Resources
            'books.read', 'authors.read',
        ];

        $guards = ['web', 'sanctum'];

        foreach ($guards as $guard) {
            foreach ($permissions as $permission) {
                Permission::findOrCreate($permission, $guard);
            }

            // 2. Create Roles
            $adminRole = Role::findOrCreate('Admin', $guard);
            $adminRole->syncPermissions($permissions);

            $kasirRole = Role::findOrCreate('Kasir', $guard);
            $kasirRole->syncPermissions([
                'pos_access',
                'sales_read',
            ]);
        }
    }
}
