<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAuthorProfileRequest;
use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\RoyaltyCalculation;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthorPortalController extends Controller
{
    /**
     * Display author dashboard statistics
     */
    public function dashboard(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'author' => $author,
                'statistics' => $author->getDashboardStats(),
            ],
        ]);
    }

    /**
     * Display author's books
     */
    public function books(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $query = Book::with(['author', 'contracts'])
            ->where('author_id', $author->id)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 15);
        $books = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $books->items(),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    /**
     * Update author's book
     */
    public function updateBook(Request $request, $bookId): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $book = Book::where('author_id', $author->id)->findOrFail($bookId);
        
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'cover_path' => ['nullable', 'string'],
        ]);

        $book->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Book updated successfully',
            'data' => $book->fresh(),
        ]);
    }

    /**
     * Display author's contracts
     */
    public function contracts(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $query = Contract::with(['book.author', 'marketplace'])
            ->whereIn('book_id', $bookIds)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by book_id
        if ($request->filled('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        $perPage = $request->get('per_page', 15);
        $contracts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $contracts->items(),
            'meta' => [
                'current_page' => $contracts->currentPage(),
                'last_page' => $contracts->lastPage(),
                'per_page' => $contracts->perPage(),
                'total' => $contracts->total(),
            ],
        ]);
    }

    /**
     * Sign contract (author acceptance)
     */
    public function signContract(Request $request, $contractId): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');
        $contract = Contract::whereIn('book_id', $bookIds)->findOrFail($contractId);

        if ($contract->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Contract status must be pending to sign',
            ], 422);
        }

        $validated = $request->validate([
            'accepted' => ['required', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $contract->update([
            'status' => $validated['accepted'] ? 'approved' : 'rejected',
            'notes' => $validated['notes'] ?? $contract->notes,
            'approved_at' => $validated['accepted'] ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['accepted'] 
                ? 'Contract signed successfully' 
                : 'Contract rejected',
            'data' => $contract->fresh(),
        ]);
    }

    /**
     * Display author's royalties
     */
    public function royalties(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $query = RoyaltyCalculation::with(['book.author', 'payment'])
            ->whereIn('book_id', $bookIds)
            ->orderBy('period_month', 'desc');

        // Filter by period_month
        if ($request->filled('period_month')) {
            $query->where('period_month', $request->period_month);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $royalties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $royalties->items(),
            'meta' => [
                'current_page' => $royalties->currentPage(),
                'last_page' => $royalties->lastPage(),
                'per_page' => $royalties->perPage(),
                'total' => $royalties->total(),
            ],
        ]);
    }

    /**
     * Get detailed royalty report
     */
    public function royaltyReport(Request $request, $royaltyId): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $royalty = RoyaltyCalculation::with(['book.author', 'payment', 'royaltyItems.sale'])
            ->whereIn('book_id', $bookIds)
            ->findOrFail($royaltyId);

        // Calculate breakdown
        $totalSales = $royalty->royaltyItems->sum('quantity');
        $totalRevenue = $royalty->royaltyItems->sum(fn($item) => $item->quantity * $item->net_price);
        $royaltyRate = $royalty->royalty_rate;
        $calculatedRoyalty = $totalRevenue * ($royaltyRate / 100);

        return response()->json([
            'success' => true,
            'data' => [
                'royalty' => $royalty,
                'breakdown' => [
                    'total_sales' => $totalSales,
                    'total_revenue' => $totalRevenue,
                    'royalty_rate' => $royaltyRate,
                    'calculated_royalty' => $calculatedRoyalty,
                    'platform_fee' => $royalty->platform_fee ?? 0,
                    'net_royalty' => $royalty->total_royalty,
                ],
                'sales_breakdown' => $royalty->royaltyItems->map(fn($item) => [
                    'marketplace' => $item->sale?->marketplace?->name,
                    'quantity' => $item->quantity,
                    'net_price' => $item->net_price,
                    'subtotal' => $item->quantity * $item->net_price,
                ]),
            ],
        ]);
    }

    /**
     * Display author's sales (transparency)
     */
    public function sales(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $query = Sale::with(['book.author', 'marketplace'])
            ->whereIn('book_id', $bookIds)
            ->orderBy('period_month', 'desc');

        // Filter by period_month
        if ($request->filled('period_month')) {
            $query->where('period_month', $request->period_month);
        }

        // Filter by marketplace_id
        if ($request->filled('marketplace_id')) {
            $query->where('marketplace_id', $request->marketplace_id);
        }

        $perPage = $request->get('per_page', 15);
        $sales = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ],
        ]);
    }

    /**
     * Get author profile
     */
    public function profile(): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $author,
        ]);
    }

    /**
     * Update author profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account' => ['nullable', 'string', 'max:50'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'npwp' => ['nullable', 'string', 'max:20'],
        ]);

        $author->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $author->fresh(),
        ]);
    }

    /**
     * Helper to get authenticated author
     */
    private function getAuthenticatedAuthor(): ?Author
    {
        $user = auth()->user();
        
        if (!$user) {
            return null;
        }

        // Check if user has Author role
        if (!$user->hasRole('Author')) {
            return null;
        }

        // Find author profile by email or user relationship
        $author = Author::where('email', $user->email)->first();
        
        if (!$author) {
            // Try to find by user relationship if exists
            $author = Author::where('user_id', $user->id)->first();
        }

        return $author;
    }
}

    /**
     * Display author's books
     */
    public function books(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $query = Book::with(['author', 'contracts'])
            ->where('author_id', $author->id)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 15);
        $books = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $books->items(),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    /**
     * Display author's contracts
     */
    public function contracts(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $query = Contract::with(['book.author', 'marketplace'])
            ->whereIn('book_id', $bookIds)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by book_id
        if ($request->filled('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        $perPage = $request->get('per_page', 15);
        $contracts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $contracts->items(),
            'meta' => [
                'current_page' => $contracts->currentPage(),
                'last_page' => $contracts->lastPage(),
                'per_page' => $contracts->perPage(),
                'total' => $contracts->total(),
            ],
        ]);
    }

    /**
     * Display author's royalties
     */
    public function royalties(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $query = RoyaltyCalculation::with(['book.author', 'payment'])
            ->whereIn('book_id', $bookIds)
            ->orderBy('period_month', 'desc');

        // Filter by period_month
        if ($request->filled('period_month')) {
            $query->where('period_month', $request->period_month);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $royalties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $royalties->items(),
            'meta' => [
                'current_page' => $royalties->currentPage(),
                'last_page' => $royalties->lastPage(),
                'per_page' => $royalties->perPage(),
                'total' => $royalties->total(),
            ],
        ]);
    }

    /**
     * Display author's sales (transparency)
     */
    public function sales(Request $request): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $query = Sale::with(['book.author', 'marketplace'])
            ->whereIn('book_id', $bookIds)
            ->orderBy('period_month', 'desc');

        // Filter by period_month
        if ($request->filled('period_month')) {
            $query->where('period_month', $request->period_month);
        }

        // Filter by marketplace_id
        if ($request->filled('marketplace_id')) {
            $query->where('marketplace_id', $request->marketplace_id);
        }

        $perPage = $request->get('per_page', 15);
        $sales = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ],
        ]);
    }

    /**
     * Get detailed royalty report
     */
    public function royaltyReport(Request $request, $royaltyId): JsonResponse
    {
        $author = $this->getAuthenticatedAuthor();
        
        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author profile not found',
            ], 404);
        }

        $bookIds = Book::where('author_id', $author->id)->pluck('id');

        $royalty = RoyaltyCalculation::with(['book.author', 'payment', 'royaltyItems.sale'])
            ->whereIn('book_id', $bookIds)
            ->findOrFail($royaltyId);

        // Calculate breakdown
        $totalSales = $royalty->royaltyItems->sum('quantity');
        $totalRevenue = $royalty->royaltyItems->sum(fn($item) => $item->quantity * $item->net_price);
        $royaltyRate = $royalty->royalty_rate;
        $calculatedRoyalty = $totalRevenue * ($royaltyRate / 100);

        return response()->json([
            'success' => true,
            'data' => [
                'royalty' => $royalty,
                'breakdown' => [
                    'total_sales' => $totalSales,
                    'total_revenue' => $totalRevenue,
                    'royalty_rate' => $royaltyRate,
                    'calculated_royalty' => $calculatedRoyalty,
                    'platform_fee' => $royalty->platform_fee ?? 0,
                    'net_royalty' => $royalty->total_royalty,
                ],
                'sales_breakdown' => $royalty->royaltyItems->map(fn($item) => [
                    'marketplace' => $item->sale?->marketplace?->name,
                    'quantity' => $item->quantity,
                    'net_price' => $item->net_price,
                    'subtotal' => $item->quantity * $item->net_price,
                ]),
            ],
        ]);
    }

    /**
     * Helper to get authenticated author
     */
    private function getAuthenticatedAuthor(): ?Author
    {
        $user = auth()->user();
        
        if (!$user) {
            return null;
        }

        // Check if user has Author role
        if (!$user->hasRole('Author')) {
            return null;
        }

        // Find author profile by email or user relationship
        $author = Author::where('email', $user->email)->first();
        
        if (!$author) {
            // Try to find by user relationship if exists
            $author = Author::where('user_id', $user->id)->first();
        }

        return $author;
    }
}
