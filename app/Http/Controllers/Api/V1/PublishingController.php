<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Author;
use App\Models\BookFile;
use App\Models\BookStatusLog;
use App\Models\Contract;
use App\Models\PrintOrder;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublishingController extends Controller
{
    use ApiResponse;

    // ── Books ──

    public function books(Request $request): JsonResponse
    {
        $query = Book::with('author:id,name');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('tracking_code', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $books = $query->orderByDesc('created_at')->get()->map(fn(Book $book) => $this->formatBook($book));

        return $this->success($books);
    }

    /**
     * ISBN tracking: books in ISBN-related statuses.
     */
    public function isbnTracking(Request $request): JsonResponse
    {
        $query = Book::with('author:id,name')
            ->where('type', 'publishing')
            ->whereIn('status', ['isbn_process', 'production', 'warehouse', 'published']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('tracking_code', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $books = $query->orderByDesc('created_at')->get()->map(fn(Book $book) => $this->formatBook($book));

        return $this->success($books);
    }

    private function formatBook(Book $book): array
    {
        return [
            'id' => $book->id,
            'type' => $book->type ?? 'publishing',
            'title' => $book->title,
            'isbn' => $book->isbn,
            'tracking_code' => $book->tracking_code,
            'author' => $book->author ? ['id' => $book->author->id, 'name' => $book->author->name] : null,
            'author_name' => $book->author?->name,
            'description' => $book->description,
            'price' => $book->price,
            'stock' => $book->stock,
            'status' => $book->status?->value ?? $book->status,
            'status_label' => $book->status?->getLabel() ?? $book->status,
            'cover_path' => $book->cover_path,
            'progress' => $book->getProgressPercentage(),
            'files_count' => $book->files()->count(),
            'print_orders_count' => $book->printOrders()->count(),
            'created_at' => $book->created_at,
            'updated_at' => $book->updated_at,
        ];
    }

    public function bookDetail(int $id): JsonResponse
    {
        $book = Book::with(['author', 'files', 'statusLogs.changer', 'printOrders'])->findOrFail($id);

        return $this->success([
            'id' => $book->id,
            'type' => $book->type ?? 'publishing',
            'title' => $book->title,
            'isbn' => $book->isbn,
            'tracking_code' => $book->tracking_code,
            'description' => $book->description,
            'author' => $book->author ? ['id' => $book->author->id, 'name' => $book->author->name] : null,
            'price' => $book->price,
            'stock' => $book->stock,
            'status' => $book->status?->value ?? $book->status,
            'status_label' => $book->status?->getLabel() ?? $book->status,
            'progress' => $book->getProgressPercentage(),
            'cover_path' => $book->cover_path,
            'cover_file_path' => $book->cover_file_path,
            'gdrive_link' => $book->gdrive_link,
            'surat_scan_path' => $book->surat_scan_path,
            'surat_status' => $book->surat_status,
            'revision_notes' => $book->revision_notes,
            'page_count' => $book->page_count,
            'size' => $book->size,
            'published_year' => $book->published_year,
            'allowed_transitions' => $book->getAllowedTransitions(),
            'files' => $book->files->map(fn(BookFile $f) => [
                'id' => $f->id,
                'file_type' => $f->file_type,
                'file_type_label' => $f->getFileTypeLabel(),
                'file_path' => $f->file_path,
                'original_name' => $f->original_name,
                'file_size' => $f->file_size,
                'uploaded_by' => $f->uploader?->name,
                'notes' => $f->notes,
                'created_at' => $f->created_at,
            ]),
            'status_logs' => $book->statusLogs->map(fn(BookStatusLog $l) => [
                'id' => $l->id,
                'from_status' => $l->from_status,
                'to_status' => $l->to_status,
                'changed_by' => $l->changer?->name,
                'notes' => $l->notes,
                'created_at' => $l->created_at,
            ]),
            'print_orders' => $book->printOrders->map(fn(PrintOrder $po) => [
                'id' => $po->id,
                'order_number' => $po->order_number,
                'vendor_name' => $po->vendor_name,
                'quantity' => $po->quantity,
                'total_cost' => $po->total_cost,
                'status' => $po->status,
                'ordered_at' => $po->ordered_at,
                'expected_delivery' => $po->expected_delivery,
            ]),
            'created_at' => $book->created_at,
            'updated_at' => $book->updated_at,
        ]);
    }

    public function storeBook(Request $request): JsonResponse
    {
        $type = $request->input('type', 'publishing');

        $rules = [
            'title' => 'required|string|max:255',
            'type' => 'nullable|string|in:publishing,printing',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'status' => 'nullable|string',
        ];

        // author_id required for publishing, optional for printing
        if ($type === 'publishing') {
            $rules['author_id'] = 'required|exists:authors,id';
            $rules['isbn'] = 'nullable|string|max:50';
        } else {
            $rules['author_id'] = 'nullable|exists:authors,id';
            $rules['isbn'] = 'nullable|string|max:50';
        }

        $data = $request->validate($rules);

        $data['type'] = $type;
        $data['stock'] = $data['stock'] ?? 0;
        $data['price'] = $data['price'] ?? 0;
        $data['status'] = $data['status'] ?? 'incoming';

        $book = Book::create($data);

        BookStatusLog::create([
            'book_id' => $book->id,
            'from_status' => null,
            'to_status' => $book->status?->value ?? $book->status,
            'changed_by' => auth()->id(),
            'notes' => $type === 'printing' ? 'Naskah cetak baru' : 'Buku baru dibuat',
        ]);

        return $this->success($book->load('author'), 'Buku berhasil ditambahkan', 201);
    }

    public function updateBook(Request $request, int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'author_id' => 'sometimes|exists:authors,id',
            'isbn' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
        ]);

        $book->update($data);

        return $this->success($book->load('author'), 'Buku berhasil diperbarui');
    }

    public function updateBookStatus(Request $request, int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $data = $request->validate([
            'status' => 'required|string',
            'notes' => 'nullable|string',
            'gdrive_link' => 'nullable|url',
            'revision_notes' => 'nullable|string',
        ]);

        $oldStatus = $book->status?->value ?? $book->status;

        $updateData = ['status' => $data['status']];

        // Save gdrive_link when moving to surat_pernyataan
        if ($data['status'] === 'surat_pernyataan' && !empty($data['gdrive_link'])) {
            $updateData['gdrive_link'] = $data['gdrive_link'];
            $updateData['surat_status'] = 'link_terkirim';
        }

        // Save revision notes when sending back to author
        if ($data['status'] === 'revision' && !empty($data['revision_notes'])) {
            $updateData['revision_notes'] = $data['revision_notes'];
        }

        $book->update($updateData);

        BookStatusLog::create([
            'book_id' => $book->id,
            'from_status' => $oldStatus,
            'to_status' => $data['status'],
            'changed_by' => auth()->id(),
            'notes' => $data['notes'] ?? null,
        ]);

        $fresh = $book->fresh();
        return $this->success([
            'id' => $fresh->id,
            'type' => $fresh->type ?? 'publishing',
            'status' => $data['status'],
            'status_label' => $fresh->status?->getLabel(),
            'progress' => $fresh->getProgressPercentage(),
            'allowed_transitions' => $fresh->getAllowedTransitions(),
        ], 'Status buku berhasil diperbarui');
    }

    // ── Book Files ──

    public function bookFiles(int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $files = $book->files()->with('uploader')->orderByDesc('created_at')->get();

        return $this->success($files->map(fn(BookFile $f) => [
            'id' => $f->id,
            'file_type' => $f->file_type,
            'file_type_label' => $f->getFileTypeLabel(),
            'file_path' => $f->file_path,
            'original_name' => $f->original_name,
            'file_size' => $f->file_size,
            'uploaded_by' => $f->uploader?->name,
            'notes' => $f->notes,
            'created_at' => $f->created_at,
        ]));
    }

    public function uploadBookFile(Request $request, int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
            'file_type' => 'required|string|in:manuscript,edited,layout,proof,isbn_cert,cover_final,print_ready',
            'notes' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $path = $file->store("books/{$book->id}/files", 'public');

        $bookFile = BookFile::create([
            'book_id' => $book->id,
            'file_type' => $request->input('file_type'),
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'uploaded_by' => auth()->id(),
            'notes' => $request->input('notes'),
        ]);

        return $this->success($bookFile, 'File berhasil diupload', 201);
    }

    // ── Book Status Logs ──

    public function bookStatusLogs(int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $logs = $book->statusLogs()->with('changer')->orderByDesc('created_at')->get();

        return $this->success($logs->map(fn(BookStatusLog $l) => [
            'id' => $l->id,
            'from_status' => $l->from_status,
            'to_status' => $l->to_status,
            'changed_by' => $l->changer?->name,
            'notes' => $l->notes,
            'created_at' => $l->created_at,
        ]));
    }

    // ── Print Orders ──

    public function printOrders(Request $request): JsonResponse
    {
        $query = PrintOrder::with(['book:id,title,tracking_code', 'orderer:id,name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($bookId = $request->query('book_id')) {
            $query->where('book_id', $bookId);
        }

        $orders = $query->orderByDesc('created_at')->get()->map(fn(PrintOrder $po) => [
            'id' => $po->id,
            'order_number' => $po->order_number,
            'book' => $po->book ? ['id' => $po->book->id, 'title' => $po->book->title, 'tracking_code' => $po->book->tracking_code] : null,
            'book_title' => $po->book?->title,
            'vendor_name' => $po->vendor_name,
            'vendor_contact' => $po->vendor_contact,
            'quantity' => $po->quantity,
            'unit_cost' => $po->unit_cost,
            'total_cost' => $po->total_cost,
            'paper_type' => $po->paper_type,
            'binding_type' => $po->binding_type,
            'cover_type' => $po->cover_type,
            'page_count' => $po->page_count,
            'size' => $po->size,
            'status' => $po->status,
            'ordered_by' => $po->orderer?->name,
            'ordered_at' => $po->ordered_at,
            'expected_delivery' => $po->expected_delivery,
            'delivered_at' => $po->delivered_at,
            'notes' => $po->notes,
            'created_at' => $po->created_at,
        ]);

        return $this->success($orders);
    }

    public function storePrintOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'book_id' => 'required|exists:books,id',
            'vendor_name' => 'required|string|max:255',
            'vendor_contact' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
            'paper_type' => 'nullable|string|max:100',
            'binding_type' => 'nullable|string|max:100',
            'cover_type' => 'nullable|string|max:100',
            'page_count' => 'nullable|integer|min:1',
            'size' => 'nullable|string|max:50',
            'ordered_at' => 'nullable|date',
            'expected_delivery' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $data['ordered_by'] = auth()->id();
        $data['ordered_at'] = $data['ordered_at'] ?? now()->toDateString();
        $data['status'] = 'pending';

        $order = PrintOrder::create($data);

        return $this->success($order->load('book:id,title'), 'Order cetak berhasil dibuat', 201);
    }

    public function updatePrintOrder(Request $request, int $id): JsonResponse
    {
        $order = PrintOrder::findOrFail($id);
        $data = $request->validate([
            'status' => 'sometimes|string|in:pending,approved,in_production,qc,delivered,cancelled',
            'vendor_name' => 'sometimes|string|max:255',
            'vendor_contact' => 'nullable|string|max:255',
            'quantity' => 'sometimes|integer|min:1',
            'unit_cost' => 'sometimes|numeric|min:0',
            'expected_delivery' => 'nullable|date',
            'delivered_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Auto-set delivered_at when status changes to delivered
        if (isset($data['status']) && $data['status'] === 'delivered' && !$order->delivered_at) {
            $data['delivered_at'] = now()->toDateString();
        }

        $order->update($data);

        return $this->success($order->fresh()->load('book:id,title'), 'Order cetak berhasil diperbarui');
    }

    // ── Authors ──

    public function authors(Request $request): JsonResponse
    {
        $query = Author::withCount('books');

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $authors = $query->orderBy('name')->get()->map(fn(Author $author) => [
            'id' => $author->id,
            'name' => $author->name,
            'email' => $author->email,
            'phone' => $author->phone,
            'address' => $author->address,
            'books_count' => $author->books_count,
        ]);

        return $this->success($authors);
    }

    public function storeAuthor(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $author = Author::create($data);

        return $this->success($author, 'Penulis berhasil ditambahkan', 201);
    }

    // ── Contracts ──

    public function contracts(Request $request): JsonResponse
    {
        $query = Contract::with(['book:id,title,author_id', 'book.author:id,name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $contracts = $query->orderByDesc('created_at')->get()->map(fn(Contract $c) => [
            'id' => $c->id,
            'contract_number' => $c->contract_file_path ?? null,
            'book' => $c->book ? ['id' => $c->book->id, 'title' => $c->book->title] : null,
            'book_title' => $c->book?->title,
            'author' => $c->book?->author ? ['id' => $c->book->author->id, 'name' => $c->book->author->name] : null,
            'author_name' => $c->book?->author?->name,
            'start_date' => $c->start_date,
            'end_date' => $c->end_date,
            'royalty_percentage' => $c->royalty_percentage,
            'status' => $c->status?->value ?? $c->status,
            'created_at' => $c->created_at,
        ]);

        return $this->success($contracts);
    }

    public function contractDetail(int $id): JsonResponse
    {
        $c = Contract::with(['book:id,title,author_id', 'book.author:id,name', 'creator:id,name', 'approver:id,name'])->findOrFail($id);

        return $this->success([
            'id' => $c->id,
            'book_id' => $c->book_id,
            'book' => $c->book ? ['id' => $c->book->id, 'title' => $c->book->title] : null,
            'book_title' => $c->book?->title,
            'author' => $c->book?->author ? ['id' => $c->book->author->id, 'name' => $c->book->author->name] : null,
            'author_name' => $c->book?->author?->name,
            'contract_file_path' => $c->contract_file_path,
            'start_date' => $c->start_date,
            'end_date' => $c->end_date,
            'royalty_percentage' => $c->royalty_percentage,
            'status' => $c->status?->value ?? $c->status,
            'approved_by' => $c->approved_by,
            'approver_name' => $c->approver?->name,
            'approved_at' => $c->approved_at,
            'rejected_reason' => $c->rejected_reason,
            'created_by' => $c->created_by,
            'creator_name' => $c->creator?->name,
            'created_at' => $c->created_at,
            'updated_at' => $c->updated_at,
        ]);
    }

    public function updateContract(Request $request, int $id): JsonResponse
    {
        $contract = Contract::findOrFail($id);

        $data = $request->validate([
            'book_id' => 'sometimes|exists:books,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'royalty_percentage' => 'sometimes|numeric|min:0|max:100',
            'status' => 'sometimes|in:pending,approved,rejected,expired',
        ]);

        $contract->update($data);

        return $this->success($contract->fresh()->load(['book:id,title', 'book.author:id,name']), 'Kontrak berhasil diperbarui');
    }

    public function approveContract(Request $request, int $id): JsonResponse
    {
        $contract = Contract::findOrFail($id);

        if (($contract->status?->value ?? $contract->status) !== 'pending') {
            return $this->error('Hanya kontrak berstatus pending yang bisa di-approve', 409);
        }

        $contract->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return $this->success($contract->fresh()->load(['book:id,title', 'approver:id,name']), 'Kontrak berhasil disetujui');
    }

    public function rejectContract(Request $request, int $id): JsonResponse
    {
        $contract = Contract::findOrFail($id);

        $data = $request->validate([
            'rejected_reason' => 'required|string|max:500',
        ]);

        if (($contract->status?->value ?? $contract->status) !== 'pending') {
            return $this->error('Hanya kontrak berstatus pending yang bisa ditolak', 409);
        }

        $contract->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejected_reason' => $data['rejected_reason'],
        ]);

        return $this->success($contract->fresh(), 'Kontrak berhasil ditolak');
    }

    // ── Status Reference ──

    public function statusList(Request $request): JsonResponse
    {
        $type = $request->query('type', 'publishing');

        if ($type === 'printing') {
            $statuses = collect(\App\Enums\PrintingBookStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->getLabel(),
                'color' => $s->getColor(),
                'icon' => $s->getIcon(),
            ]);
        } else {
            $statuses = collect(\App\Enums\BookStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->getLabel(),
                'color' => $s->getColor(),
                'icon' => $s->getIcon(),
            ]);
        }

        return $this->success($statuses);
    }
}