<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens;
    use HasFactory;
    use HasRoles;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'role',
        'face_descriptor',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'face_descriptor',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // ─── Filament Auth ───

    public function canAccessPanel(Panel $panel): bool
    {
        // Only non-Karyawan users can access Filament admin panel
        return $this->is_active && !$this->isKaryawan();
    }

    // ─── Relationships ───

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    // ─── Helpers ───

    public function isAdmin(): bool
    {
        return $this->hasRole('Admin') || in_array($this->role, ['ADMIN', 'OWNER']);
    }

    public function isOwner(): bool
    {
        return $this->hasRole('Owner') || $this->role === 'OWNER';
    }

    public function isKaryawan(): bool
    {
        // Spatie roles take priority — if user has any admin-level role,
        // they are NOT a Karyawan even if the DB column says 'KARYAWAN'
        $adminRoles = ['Admin', 'Owner', 'HR', 'Finance', 'Legal'];
        if ($this->hasAnyRole($adminRoles)) {
            return false;
        }

        return $this->hasRole('Karyawan') || $this->role === 'KARYAWAN';
    }
}