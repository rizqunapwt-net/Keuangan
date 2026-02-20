<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AuthorRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached permissions and roles
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for Author role
        $authorPermissions = [
            // Contract permissions
            'author_contracts_read',
            'author_contracts_sign',
            
            // Book permissions
            'author_books_read',
            'author_books_write',
            
            // Royalty permissions
            'author_royalties_read',
            'author_royalty_reports_read',
            
            // Sales permissions (read-only for transparency)
            'author_sales_read',
            
            // Profile permissions
            'author_profile_write',
        ];

        foreach ($authorPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Author role
        $authorRole = Role::firstOrCreate(['name' => 'Author']);
        $authorRole->givePermissionTo($authorPermissions);

        // Create test author user if not exists
        $authorUser = \App\Models\User::firstOrCreate(
            ['email' => 'author@example.com'],
            [
                'name' => 'Test Author',
                'username' => 'testauthor',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $authorUser->assignRole($authorRole);

        // Link author to an author profile if exists (use minimal fields)
        $authorProfile = \App\Models\Author::firstOrCreate(
            ['email' => 'author@example.com'],
            [
                'name' => 'Test Author',
                'phone' => '08123456789',
            ]
        );

        $this->command->info('Author role and permissions created successfully!');
        $this->command->info('Test author user created:');
        $this->command->info('  Email: author@example.com');
        $this->command->info('  Password: password');
        $this->command->info('  Role: Author');
    }
}
