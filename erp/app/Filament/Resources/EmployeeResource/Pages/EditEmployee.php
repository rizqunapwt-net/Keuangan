<?php

namespace App\Filament\Resources\EmployeeResource\Pages;

use App\Filament\Resources\EmployeeResource;
use App\Models\User;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class EditEmployee extends EditRecord
{
    protected static string $resource = EmployeeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Load data dari User ke form
        $user = $this->record->user;
        if ($user) {
            $data['name'] = $user->name;
            $data['username'] = $user->username;
            $data['email'] = $user->email;
            $data['role'] = $user->role;
        }

        return $data;
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        // 1. Update Employee data
        $record->update([
            'employee_code' => $data['employee_code'] ?? null,
            'category' => $data['category'],
            'base_salary' => $data['base_salary'] ?? 0,
        ]);

        // 2. Update User data
        $user = $record->user;
        if ($user) {
            $userData = [
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'role' => strtoupper($data['role']),
            ];

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            $user->update($userData);

            // Sync Spatie Role
            if (strtoupper($data['role']) === 'ADMIN' || strtoupper($data['role']) === 'OWNER') {
                $user->syncRoles(['Admin']);
            }
            else {
                $user->syncRoles([]); // Remove admin roles for KARYAWAN
            }
        }

        return $record;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}