<?php

namespace App\Filament\Resources\EmployeeResource\Pages;

use App\Filament\Resources\EmployeeResource;
use App\Models\User;
use App\Models\Employee;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Model;

class CreateEmployee extends CreateRecord
{
    protected static string $resource = EmployeeResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        // 1. Bersihkan data untuk User
        $userData = [
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'role' => strtoupper($data['role']), // ADMIN, KARYAWAN, OWNER
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ];

        // 2. Buat User
        $user = User::create($userData);

        // 3. Assign Spatie Role (Penting untuk Permission Policy)
        // Map: ADMIN -> Admin, OWNER -> Admin (untuk akses penuh), KARYAWAN -> Karyawan (jika ada)
        if (strtoupper($data['role']) === 'ADMIN' || strtoupper($data['role']) === 'OWNER') {
            $user->assignRole('Admin');
        }

        // 4. Buat Employee
        return Employee::create([
            'user_id' => $user->id,
            'employee_code' => $data['employee_code'] ?? null,
            'category' => $data['category'],
            'base_salary' => $data['base_salary'] ?? 0,
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}