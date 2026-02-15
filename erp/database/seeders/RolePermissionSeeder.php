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
            'authors.manage',
            'books.manage',
            'contracts.manage',
            'marketplaces.manage',
            'assignments.manage',
            'sales.import',
            'royalties.manage',
            'payments.manage',
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
            'payments.manage',
            'reports.view',
            'dashboard.view',
            'audit.view',
        ]);
    }
}
