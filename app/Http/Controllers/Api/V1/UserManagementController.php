<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Admin\Services\UserService;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Controller for managing system users.
 * Refactored to use UserService for core logic and dynamic role validation.
 */
class UserManagementController extends Controller
{
    use ApiResponse;

    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Get a list of all users.
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->getAllUsers(
            $request->only(['search', 'role', 'is_active']),
            $request->input('per_page', 20)
        );

        // Transform for a consistent frontend response
        $data = collect($users->items())->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'phone' => $user->phone,
            'is_active' => (bool) $user->is_active,
            'is_verified_author' => (bool) $user->is_verified_author,
            'roles' => $user->getRoleNames(),
            'role' => $user->getRoleNames()->first() ?? 'User',
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'phone' => $user->phone,
            'is_active' => (bool) $user->is_active,
            'is_verified_author' => (bool) $user->is_verified_author,
            'roles' => $user->getRoleNames(),
            'role' => $user->getRoleNames()->first() ?? 'User',
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['nullable', 'string', 'max:100', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'exists:roles,name'], // Dynamic validation from DB
            'is_active' => ['boolean'],
        ]);

        $user = $this->userService->createUser($validated);

        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $validated['role'],
        ], 201);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['sometimes', 'string', 'max:100', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['sometimes', 'string', 'exists:roles,name'], // Dynamic validation
            'is_active' => ['sometimes', 'boolean'],
            'is_verified_author' => ['sometimes', 'boolean'],
        ]);

        $this->userService->updateUser($user, $validated);

        return $this->success(['message' => 'User berhasil diperbarui.']);
    }

    /**
     * Toggle the active status of the user.
     */
    public function toggleActive(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return $this->error('Tidak bisa menonaktifkan akun sendiri.', 422);
        }

        $this->userService->toggleActive($user);

        return $this->success([
            'is_active' => (bool) $user->is_active,
            'message' => $user->is_active ? 'User diaktifkan.' : 'User dinonaktifkan.',
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return $this->error('Tidak bisa menghapus akun sendiri.', 422);
        }

        $this->userService->deleteUser($user);

        return $this->success(['message' => 'User berhasil dihapus.']);
    }

    /**
     * Get all available system roles.
     */
    public function roles(): JsonResponse
    {
        $roles = $this->userService->getAvailableRoles();

        return $this->success($roles);
    }
}
