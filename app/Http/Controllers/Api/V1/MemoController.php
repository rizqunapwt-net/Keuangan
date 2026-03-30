<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Memo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Memo::with('user:id,name')
            ->orderBy('is_pinned', 'desc')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'color' => 'nullable|string|max:20',
            'is_pinned' => 'nullable|boolean',
        ]);

        $validated['user_id'] = auth()->id();

        $memo = Memo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil dibuat.',
            'data' => $memo,
        ], 201);
    }

    public function show(Memo $memo): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $memo->load('user:id,name'),
        ]);
    }

    public function update(Request $request, Memo $memo): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'color' => 'nullable|string|max:20',
            'is_pinned' => 'nullable|boolean',
        ]);

        $memo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil diperbarui.',
            'data' => $memo,
        ]);
    }

    public function destroy(Memo $memo): JsonResponse
    {
        $memo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil dihapus.',
        ]);
    }

    public function togglePin(Memo $memo): JsonResponse
    {
        $memo->update(['is_pinned' => ! $memo->is_pinned]);

        return response()->json([
            'success' => true,
            'message' => $memo->is_pinned ? 'Catatan disematkan.' : 'Sematkan dilepas.',
            'data' => $memo,
        ]);
    }
}
