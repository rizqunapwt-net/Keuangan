<?php

namespace App\Observers;

use App\Domain\Inventory\Actions\ReplenishStockAction;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PurchaseObserver
{
    public function __construct(private readonly ReplenishStockAction $replenishStock) {}

    public function created(PurchaseOrder $purchase): void
    {
        DB::afterCommit(function () use ($purchase): void {
            $purchase = $purchase->fresh();

            if (! $purchase || ! $this->shouldAffectStock($purchase)) {
                return;
            }

            $purchase->loadMissing('items');

            if ($purchase->items->isEmpty()) {
                return;
            }

            $items = $purchase->items->map(fn ($item): array => [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
            ])->toArray();

            $this->replenishStock->execute($purchase, $items);
        });
    }

    public function deleting(PurchaseOrder $purchase): void
    {
        if (! $this->hasInboundMovement($purchase)) {
            return;
        }

        $purchase->loadMissing('items');

        if ($purchase->items->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($purchase): void {
            foreach ($purchase->items as $item) {
                $product = Product::query()->lockForUpdate()->find($item->product_id);

                if (! $product) {
                    throw new RuntimeException("Produk dengan ID {$item->product_id} tidak ditemukan atau sudah dihapus.");
                }

                if ($product->stock < $item->quantity) {
                    throw new RuntimeException(
                        "Tidak dapat menghapus pembelian {$purchase->po_number}: stok {$product->name} tidak mencukupi untuk rollback."
                    );
                }

                $stockBefore = $product->stock;
                $product->decrement('stock', $item->quantity);
                $product->update(['last_stock_update' => now()]);

                $actorId = auth()->id() ?? $purchase->created_by;
                if (! $actorId) {
                    throw new RuntimeException('Tidak dapat mencatat rollback stok tanpa user_id yang valid.');
                }

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'adjustment',
                    'direction' => 'out',
                    'quantity' => $item->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $product->fresh()->stock,
                    'reference_type' => PurchaseOrder::class,
                    'reference_id' => $purchase->id,
                    'user_id' => $actorId,
                    'notes' => 'Rollback stok karena transaksi pembelian dihapus.',
                ]);
            }
        });
    }

    private function hasInboundMovement(PurchaseOrder $purchase): bool
    {
        return StockMovement::query()
            ->where('reference_type', PurchaseOrder::class)
            ->where('reference_id', $purchase->id)
            ->where('type', 'purchase')
            ->where('direction', 'in')
            ->exists();
    }

    private function shouldAffectStock(PurchaseOrder $purchase): bool
    {
        return in_array($purchase->status, ['received', 'completed'], true);
    }
}
