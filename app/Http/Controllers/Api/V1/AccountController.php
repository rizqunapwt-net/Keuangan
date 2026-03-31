<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Accounting\Account;
use App\Support\ApiResponse;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AccountController extends Controller
{
    use ApiResponse, Auditable;
    /**
     * Category mapping — maps the DB enum type to the frontend's expected format.
     */
    private function getCategories(): array
    {
        return [
            ['id' => 1, 'code' => '1', 'name' => 'Aset', 'type' => 'asset'],
            ['id' => 2, 'code' => '2', 'name' => 'Kewajiban', 'type' => 'liability'],
            ['id' => 3, 'code' => '3', 'name' => 'Modal', 'type' => 'equity'],
            ['id' => 4, 'code' => '4', 'name' => 'Pendapatan', 'type' => 'revenue'],
            ['id' => 5, 'code' => '5', 'name' => 'Beban', 'type' => 'expense'],
        ];
    }

    private function categoryForType(string $type): array
    {
        $categories = $this->getCategories();
        foreach ($categories as $cat) {
            if ($cat['type'] === $type) {
                return ['id' => $cat['id'], 'code' => $cat['code'], 'name' => $cat['name']];
            }
        }

        return ['id' => 0, 'code' => '0', 'name' => 'Lainnya'];
    }

    private function categoryIdToType(int $categoryId): string
    {
        $map = [1 => 'asset', 2 => 'liability', 3 => 'equity', 4 => 'revenue', 5 => 'expense'];

        return $map[$categoryId] ?? 'asset';
    }

    /**
     * GET /finance/accounts/categories
     */
    public function categories()
    {
        Gate::authorize('accounting_read');

        $cats = $this->getCategories();

        return response()->json(['success' => true, 'data' => array_map(function ($c) {
            return ['id' => $c['id'], 'code' => $c['code'], 'name' => $c['name']];
        }, $cats)]);
    }

    /**
     * GET /finance/accounts
     */
    public function index()
    {
        Gate::authorize('accounting_read');

        $accounts = Account::orderBy('code')->get();

        $result = $accounts->map(function (Account $a) {
            $cat = $this->categoryForType($a->type);

            return [
                'id' => $a->id,
                'code' => $a->code,
                'name' => $a->name,
                'categoryId' => $cat['id'],
                'category' => $cat,
                'openingBalance' => 0,
                'isArchived' => ! $a->is_active,
                'description' => $a->description,
            ];
        });

        return response()->json(['success' => true, 'data' => $result->values()]);
    }

    /**
     * GET /finance/banks
     */
    public function banks()
    {
        Gate::authorize('accounting_read');

        // Typically cash and bank accounts start with '11' in this project
        $accounts = Account::where('code', 'like', '11%')
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return response()->json(['success' => true, 'data' => $accounts]);
    }

    /**
     * POST /finance/accounts
     */
    public function store(Request $request)
    {
        Gate::authorize('accounting_write');

        $request->validate([
            'code' => 'required|string|unique:accounting_accounts,code',
            'name' => 'required|string|max:255',
            'categoryId' => 'required|integer|between:1,5',
        ]);

        $account = Account::create([
            'code' => $request->code,
            'name' => $request->name,
            'type' => $this->categoryIdToType($request->categoryId),
            'description' => $request->description ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil ditambahkan',
            'data' => $account,
        ], 201);
    }

    /**
     * PUT /finance/accounts/{id}
     */
    public function update(Request $request, int $id)
    {
        Gate::authorize('accounting_write');

        $account = Account::findOrFail($id);

        $request->validate([
            'code' => 'sometimes|string|unique:accounting_accounts,code,'.$id,
            'name' => 'sometimes|string|max:255',
            'categoryId' => 'sometimes|integer|between:1,5',
        ]);

        if ($request->has('code')) {
            $account->code = $request->code;
        }
        if ($request->has('name')) {
            $account->name = $request->name;
        }
        if ($request->has('categoryId')) {
            $account->type = $this->categoryIdToType($request->categoryId);
        }
        if ($request->has('description')) {
            $account->description = $request->description;
        }
        if ($request->has('isArchived')) {
            $account->is_active = ! $request->isArchived;
        }

        $account->save();

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil diperbarui',
            'data' => $account,
        ]);
    }

    /**
     * DELETE /finance/accounts/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('accounting_write');

        $account = Account::findOrFail($id);

        // Check if account has journal entries
        if ($account->entries()->count() > 0) {
            return $this->error('Akun tidak bisa dihapus karena memiliki transaksi jurnal', 422);
        }

        $this->logDelete($account, "Menghapus akun akuntansi: {$account->name} ({$account->code})");

        $account->delete();

        return $this->success(null);
    }
}
