<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Debt;
use App\Support\ApiResponse;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    use ApiResponse, LogsActivity;

    public function index(Request $request): JsonResponse
    {
        $query = Debt::where('type', 'receivable')
            ->latest('date');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($sub) use ($search) {
                $sub->where('client_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $invoices = $query->get()->map(function ($d) {
            $total = (float) $d->amount;
            $paid = (float) $d->paid_amount;
            $invNumber = $d->kodeinvoice ?: ('INV-'.str_pad($d->id, 6, '0', STR_PAD_LEFT));
            $items = $d->items ? (is_string($d->items) ? json_decode($d->items, true) : $d->items) : [];

            return [
                'id' => $d->id,
                'type' => 'sales',
                'invoice_number' => $invNumber,
                'refNumber' => $invNumber,
                'number' => $invNumber,
                'kodeinvoice' => $d->kodeinvoice,
                'total_amount' => $total,
                'total' => $total,
                'paid_amount' => $paid,
                'paidAmount' => $paid,
                'remaining_balance' => $total - $paid,
                'status' => $d->status,
                'transDate' => $d->date?->toISOString(),
                'date' => $d->date?->toDateString(),
                'due_date' => $d->due_date?->toDateString(),
                'dueDate' => $d->due_date?->toDateString(),
                'customer_name' => $d->client_name ?? '-',
                'contactName' => $d->client_name ?? '-',
                'contact' => [
                    'name' => $d->client_name ?? '-',
                ],
                'description' => $d->description,
                'items' => $items,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contactId' => 'nullable|exists:contacts,id',
            'client_name' => 'nullable|string|max:255',
            'transDate' => 'required|date',
            'dueDate' => 'nullable|date',
            'description' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.nama_produk' => 'required|string|max:255',
            'items.*.jumlah' => 'required|numeric|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.diskon' => 'nullable|numeric|min:0',
        ]);

        $clientName = $validated['client_name'] ?? null;
        if (! empty($validated['contactId'])) {
            $contact = Contact::find($validated['contactId']);
            $clientName = $contact->name;
        }

        $items = collect($validated['items'])->map(fn ($item) => [
            'nama_produk' => $item['nama_produk'],
            'jumlah' => (int) $item['jumlah'],
            'satuan' => $item['satuan'],
            'harga' => (float) $item['harga'],
            'diskon' => (float) ($item['diskon'] ?? 0),
        ])->toArray();

        $total = collect($items)->sum(fn ($i) => ($i['harga'] * $i['jumlah']) - $i['diskon']);

        $debt = Debt::create([
            'type' => 'receivable',
            'status' => 'unpaid',
            'date' => $validated['transDate'],
            'due_date' => $validated['dueDate'] ?? null,
            'client_name' => $clientName ?? 'Umum',
            'description' => $validated['description'] ?? null,
            'amount' => $total,
            'paid_amount' => 0,
            'items' => $items,
        ]);

        $this->logActivity('created', 'debts', "Membuat invoice untuk {$clientName}: Rp".number_format($total, 0, ',', '.').' ('.count($items).' item)', $debt, null, ['client_name' => $clientName, 'total' => $total, 'items' => $items]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil dibuat.',
            'data' => [
                'id' => $debt->id,
                'refNumber' => 'INV-'.str_pad($debt->id, 6, '0', STR_PAD_LEFT),
            ],
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $debt = Debt::where('type', 'receivable')->findOrFail($id);

        $validated = $request->validate([
            'client_name' => 'nullable|string|max:255',
            'transDate' => 'nullable|date',
            'dueDate' => 'nullable|date',
            'description' => 'nullable|string|max:500',
            'items' => 'nullable|array|min:1',
            'items.*.nama_produk' => 'required|string|max:255',
            'items.*.jumlah' => 'required|numeric|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.diskon' => 'nullable|numeric|min:0',
        ]);

        $oldValues = ['client_name' => $debt->client_name, 'amount' => $debt->amount, 'items' => $debt->items];

        if (isset($validated['client_name'])) {
            $debt->client_name = $validated['client_name'];
        }
        if (isset($validated['transDate'])) {
            $debt->date = $validated['transDate'];
        }
        if (isset($validated['dueDate'])) {
            $debt->due_date = $validated['dueDate'];
        }
        if (isset($validated['description'])) {
            $debt->description = $validated['description'];
        }

        if (isset($validated['items'])) {
            $items = collect($validated['items'])->map(fn ($item) => [
                'nama_produk' => $item['nama_produk'],
                'jumlah' => (int) $item['jumlah'],
                'satuan' => $item['satuan'],
                'harga' => (float) $item['harga'],
                'diskon' => (float) ($item['diskon'] ?? 0),
            ])->toArray();

            $debt->items = $items;
            $debt->amount = collect($items)->sum(fn ($i) => ($i['harga'] * $i['jumlah']) - $i['diskon']);
        }

        $debt->save();

        $invNumber = $debt->kodeinvoice ?: ('INV-'.str_pad($debt->id, 6, '0', STR_PAD_LEFT));
        $this->logActivity('updated', 'debts', "Mengubah invoice {$invNumber} ({$debt->client_name})", $debt, $oldValues, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil diperbarui.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $debt = Debt::where('type', 'receivable')->findOrFail($id);

        if ($debt->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus invoice yang sudah lunas.',
            ], 422);
        }

        $invNumber = $debt->kodeinvoice ?: ('INV-'.str_pad($debt->id, 6, '0', STR_PAD_LEFT));
        $oldData = ['client_name' => $debt->client_name, 'amount' => $debt->amount, 'status' => $debt->status];

        $debt->payments()->delete();
        $debt->delete();

        $this->logActivity('deleted', 'debts', "Menghapus invoice {$invNumber} ({$oldData['client_name']}) - Rp".number_format($oldData['amount'], 0, ',', '.'), null, $oldData);

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil dihapus.',
        ]);
    }

    public function togglePaid(int $id): JsonResponse
    {
        $debt = Debt::where('type', 'receivable')->findOrFail($id);

        if ($debt->status === 'paid' || $debt->status === 'lunas') {
            $debt->payments()->delete();
        } else {
            $bank = \App\Models\Bank::orderBy('id')->first();
            if (! $bank) {
                return response()->json(['success' => false, 'message' => 'Silakan buat data Bank terlebih dahulu.'], 422);
            }

            $debt->payments()->create([
                'bank_id' => $bank->id,
                'date' => now(),
                'amount' => $debt->amount - $debt->paid_amount,
                'note' => 'Pelunasan otomatis dari toggle status',
            ]);
        }

        $debt->refresh();

        return response()->json([
            'success' => true,
            'message' => $debt->status === 'paid' ? 'Invoice ditandai LUNAS.' : 'Invoice ditandai BELUM LUNAS.',
            'data' => ['status' => $debt->status],
        ]);
    }
}
