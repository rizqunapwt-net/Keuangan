<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicTrackingController extends Controller
{
    use ApiResponse;

    /**
     * Track a book by tracking code.
     * Public endpoint — no authentication required.
     */
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:100'],
        ]);

        $book = Book::where('tracking_code', $request->input('code'))->first();

        if (!$book) {
            return $this->error('Kode tracking tidak ditemukan.', 404);
        }

        return $this->success([
            'tracking_code' => $book->tracking_code,
            'title' => $book->title,
            'status' => $book->status?->value ?? $book->status,
            'status_label' => $book->status?->getLabel() ?? '-',
            'progress' => $book->getProgressPercentage(),
            'author' => $book->author?->name,
            'updated_at' => $book->updated_at,
            'logs' => $book->statusLogs()->orderBy('created_at')->get()->map(fn($l) => [
                'from' => $l->from_status,
                'to' => $l->to_status,
                'date' => $l->created_at->toDateTimeString(),
                'notes' => $l->notes,
            ]),
        ]);
    }
}