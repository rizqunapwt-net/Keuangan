<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        Gate::authorize('admin.access');

        $roles = Role::all()->unique('name')->values()->map(function ($role) {
            return [
                'id' => $role->name, // Using name as ID for easier sync across guards in frontend
                'name' => $role->name,
                'guard_name' => $role->guard_name
            ];
        });

        return $this->success($roles);
    }
}
