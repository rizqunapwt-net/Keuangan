<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the users.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $users = User::with('roles')->get()->map(function ($user) {
            // For the API response, we simplify roles to unique names to avoid guard duplicates in UI
            $user->role_list = $user->roles->pluck('name')->unique()->values();
            unset($user->roles); // Optional: remove the full collection to save bandwidth
            return $user;
        });

        return $this->success($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['sometimes', 'array'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (!empty($validated['roles'])) {
            // Sync roles for both guards to ensure consistency between API and Web
            foreach (['web', 'sanctum'] as $guard) {
                $user->syncRoles($validated['roles'], $guard);
            }
        } else {
            $user->assignRole('User', 'web');
            $user->assignRole('User', 'sanctum');
        }

        $user->role_list = $user->roles()->pluck('name')->unique()->values();
        return $this->success($user, 201);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
        ]);

        $user->update($validated);

        return $this->success($user);
    }

    /**
     * Update a user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'is_active' => ['sometimes', 'boolean'],
            'roles' => ['sometimes', 'array'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['roles'])) {
            foreach (['web', 'sanctum'] as $guard) {
                $user->syncRoles($validated['roles'], $guard);
            }
        }

        $user->role_list = $user->roles()->pluck('name')->unique()->values();
        return $this->success($user);
    }

    /**
     * Delete a user.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        Gate::authorize('delete', $user);

        if ($request->user()->id === $user->id) {
            return $this->error('Tidak dapat menghapus akun sendiri.', 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return $this->success(null, 204);
    }
}
