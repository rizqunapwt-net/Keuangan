<?php

namespace App\Domain\Admin\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class UserService
{
    public function getAllUsers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = User::query()
            ->with('roles')
            ->latest('id');

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $sub) use ($search): void {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->role((string) $filters['role']);
        }

        if (array_key_exists('is_active', $filters)) {
            $isActive = $this->toBoolean($filters['is_active']);
            if ($isActive !== null) {
                $query->where('is_active', $isActive);
            }
        }

        $perPage = max(1, min($perPage, 100));

        return $query->paginate($perPage);
    }

    public function createUser(array $payload): User
    {
        return DB::transaction(function () use ($payload): User {
            $role = $this->resolveRole((string) $payload['role']);

            $user = User::query()->create([
                'name' => (string) $payload['name'],
                'email' => (string) $payload['email'],
                'username' => $payload['username'] ?? null,
                'phone' => $payload['phone'] ?? null,
                'password' => (string) $payload['password'],
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ]);

            $user->syncRoles([$role->name]);

            return $user->fresh(['roles']);
        });
    }

    public function updateUser(User $user, array $payload): User
    {
        return DB::transaction(function () use ($user, $payload): User {
            $attributes = [];

            foreach (['name', 'email', 'username', 'phone', 'is_active', 'is_verified_author'] as $field) {
                if (array_key_exists($field, $payload)) {
                    $attributes[$field] = $payload[$field];
                }
            }

            if (array_key_exists('password', $payload) && filled($payload['password'])) {
                $attributes['password'] = $payload['password'];
            }

            if ($attributes !== []) {
                $user->forceFill($attributes)->save();
            }

            if (array_key_exists('role', $payload) && filled($payload['role'])) {
                $role = $this->resolveRole((string) $payload['role']);
                $user->syncRoles([$role->name]);
            }

            return $user->fresh(['roles']);
        });
    }

    public function toggleActive(User $user): User
    {
        $user->forceFill(['is_active' => ! (bool) $user->is_active])->save();

        return $user->fresh();
    }

    public function deleteUser(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $user->tokens()->delete();
            $user->syncRoles([]);
            $user->delete();
        });
    }

    public function getAvailableRoles(): array
    {
        return Role::query()
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();
    }

    private function resolveRole(string $roleName): Role
    {
        return Role::query()
            ->where('name', $roleName)
            ->where('guard_name', 'web')
            ->firstOrFail();
    }

    private function toBoolean(mixed $value): ?bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_int($value)) {
            return $value === 1;
        }

        if (! is_string($value)) {
            return null;
        }

        $normalized = strtolower(trim($value));

        return match ($normalized) {
            '1', 'true', 'yes', 'on' => true,
            '0', 'false', 'no', 'off' => false,
            default => null,
        };
    }
}
