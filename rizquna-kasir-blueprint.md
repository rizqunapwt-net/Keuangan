# Rizquna Kasir — Enterprise Technical Blueprint
**Version:** 2.0 Production-Ready  
**Stack:** Laravel 12 · PHP 8.4 · React 19 (TypeScript) · SQLite · Ant Design · Tailwind CSS  
**Standard:** Double-Entry Bookkeeping · PSAK (Standar Akuntansi Indonesia) · PCI-DSS Aware  

---

## Daftar Isi
1. [Arsitektur Keseluruhan](#arsitektur)
2. [Pilar 1 — Inventory Tracking](#pilar-1)
3. [Pilar 2 — POS High-Speed UI](#pilar-2)
4. [Pilar 3 — Advanced Reporting](#pilar-3)
5. [Pilar 4 — Midtrans Payment Gateway](#pilar-4)
6. [Pilar 5 — Data Export (Excel + PDF)](#pilar-5)
7. [Security Hardening](#security)
8. [Testing Strategy](#testing)
9. [Deployment Checklist](#deployment)

---

## 1. Arsitektur Keseluruhan {#arsitektur}

```
app/
├── Domain/
│   ├── Finance/
│   │   ├── Actions/           ← Single-purpose business actions
│   │   │   ├── CreateSaleAction.php
│   │   │   ├── CreatePurchaseAction.php
│   │   │   └── RecordJournalEntryAction.php
│   │   ├── DataTransferObjects/
│   │   │   ├── SaleData.php
│   │   │   ├── SaleItemData.php
│   │   │   └── PaymentData.php
│   │   ├── Services/
│   │   │   ├── ReportService.php
│   │   │   ├── PaymentService.php        ← Midtrans
│   │   │   ├── InventoryService.php      ← NEW
│   │   │   └── ExportService.php         ← NEW
│   │   └── Contracts/
│   │       ├── PaymentGatewayInterface.php
│   │       └── ReportableInterface.php
│   └── Inventory/
│       ├── Actions/
│       │   ├── DeductStockAction.php
│       │   └── ReplenishStockAction.php
│       └── Services/
│           └── StockMovementService.php
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── SaleController.php
│   │   ├── ProductController.php
│   │   ├── ReportController.php
│   │   ├── PaymentController.php         ← Midtrans webhook
│   │   └── ExportController.php
│   ├── Requests/
│   │   ├── StoreSaleRequest.php
│   │   └── StorePaymentRequest.php
│   └── Resources/
│       ├── SaleResource.php
│       ├── ProductResource.php
│       └── ReportResource.php
├── Models/
│   ├── Sale.php
│   ├── SaleItem.php                      ← NEW
│   ├── Product.php
│   ├── StockMovement.php                 ← NEW
│   ├── AccountingAccount.php
│   └── AccountingJournal.php
└── Observers/
    ├── SaleObserver.php
    └── PurchaseObserver.php

admin-panel/src/
├── pages/
│   ├── pos/                              ← NEW — POS Module
│   │   ├── POSPage.tsx
│   │   ├── components/
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CartPanel.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   ├── BarcodeListener.tsx
│   │   │   └── ReceiptPreview.tsx
│   │   └── hooks/
│   │       ├── useCart.ts
│   │       ├── useProducts.ts
│   │       └── usePayment.ts
│   ├── reports/                          ← NEW — Reporting Module
│   │   ├── ReportsPage.tsx
│   │   ├── components/
│   │   │   ├── ProfitLossReport.tsx
│   │   │   ├── BalanceSheetReport.tsx
│   │   │   └── CashFlowReport.tsx
│   │   └── hooks/
│   │       └── useReports.ts
│   └── inventory/                        ← NEW — Inventory Module
│       ├── InventoryPage.tsx
│       └── components/
│           ├── StockTable.tsx
│           └── MovementLog.tsx
├── services/
│   ├── api.ts                            ← Axios instance + interceptors
│   └── midtrans.ts                       ← Snap.js wrapper
├── stores/
│   └── cartStore.ts                      ← Zustand global state
└── types/
    ├── sale.ts
    ├── product.ts
    └── report.ts
```

---

## 2. Pilar 1 — Inventory Tracking {#pilar-1}

### 2.1 Migrations

```php
// database/migrations/xxxx_create_sale_items_table.php
Schema::create('sale_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_id')->constrained()->restrictOnDelete();
    $table->integer('quantity');
    $table->decimal('unit_price', 15, 2);
    $table->decimal('discount_amount', 15, 2)->default(0);
    $table->decimal('subtotal', 15, 2)->storedAs('(quantity * unit_price) - discount_amount');
    $table->timestamps();
    $table->index(['sale_id', 'product_id']);
});

// database/migrations/xxxx_add_stock_columns_to_products.php
Schema::table('products', function (Blueprint $table) {
    $table->integer('stock_qty')->default(0)->after('price');
    $table->integer('stock_min_qty')->default(5)->after('stock_qty');    // low-stock alert
    $table->string('sku')->unique()->nullable()->after('name');
    $table->string('barcode')->unique()->nullable()->after('sku');
});

// database/migrations/xxxx_create_stock_movements_table.php
Schema::create('stock_movements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained();
    $table->enum('type', ['purchase', 'sale', 'adjustment', 'return', 'loss']);
    $table->enum('direction', ['in', 'out']);
    $table->integer('quantity');
    $table->integer('stock_before');
    $table->integer('stock_after');
    $table->nullableMorphs('reference');  // polymorphic: Sale, Purchase, etc.
    $table->foreignId('user_id')->constrained();
    $table->text('notes')->nullable();
    $table->timestamps();

    $table->index(['product_id', 'created_at']);
    $table->index(['reference_type', 'reference_id']);
});
```

### 2.2 Models

```php
// app/Models/SaleItem.php
class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'product_id', 'quantity', 'unit_price', 'discount_amount'];

    protected $casts = [
        'unit_price'       => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'subtotal'         => 'decimal:2',
    ];

    public function sale(): BelongsTo    { return $this->belongsTo(Sale::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
}

// app/Models/StockMovement.php
class StockMovement extends Model
{
    protected $fillable = [
        'product_id', 'type', 'direction',
        'quantity', 'stock_before', 'stock_after',
        'reference_type', 'reference_id',
        'user_id', 'notes'
    ];

    public function product(): BelongsTo   { return $this->belongsTo(Product::class); }
    public function reference(): MorphTo   { return $this->morphTo(); }
    public function user(): BelongsTo      { return $this->belongsTo(User::class); }
}

// app/Models/Product.php — tambahan
class Product extends Model
{
    // Scope: low stock
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock_qty', '<=', 'stock_min_qty');
    }

    // Check apakah stok cukup
    public function hasStock(int $qty): bool
    {
        return $this->stock_qty >= $qty;
    }

    public function saleItems(): HasMany { return $this->hasMany(SaleItem::class); }
    public function stockMovements(): HasMany { return $this->hasMany(StockMovement::class); }
}

// app/Models/Sale.php — tambahan relasi
public function items(): HasMany
{
    return $this->hasMany(SaleItem::class);
}
```

### 2.3 Domain Actions

```php
// app/Domain/Inventory/Actions/DeductStockAction.php
class DeductStockAction
{
    public function execute(Sale $sale): void
    {
        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);

                // Guard: stok tidak boleh minus
                if ($product->stock_qty < $item->quantity) {
                    throw new InsufficientStockException(
                        "Stok {$product->name} tidak cukup. " .
                        "Tersedia: {$product->stock_qty}, Diminta: {$item->quantity}"
                    );
                }

                $stockBefore = $product->stock_qty;
                $product->decrement('stock_qty', $item->quantity);

                StockMovement::create([
                    'product_id'     => $product->id,
                    'type'           => 'sale',
                    'direction'      => 'out',
                    'quantity'       => $item->quantity,
                    'stock_before'   => $stockBefore,
                    'stock_after'    => $product->fresh()->stock_qty,
                    'reference_type' => Sale::class,
                    'reference_id'   => $sale->id,
                    'user_id'        => auth()->id(),
                ]);
            }
        });
    }
}

// app/Domain/Inventory/Actions/ReplenishStockAction.php
class ReplenishStockAction
{
    public function execute(Purchase $purchase): void
    {
        DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                $product     = Product::lockForUpdate()->find($item->product_id);
                $stockBefore = $product->stock_qty;

                $product->increment('stock_qty', $item->quantity);

                StockMovement::create([
                    'product_id'     => $product->id,
                    'type'           => 'purchase',
                    'direction'      => 'in',
                    'quantity'       => $item->quantity,
                    'stock_before'   => $stockBefore,
                    'stock_after'    => $product->fresh()->stock_qty,
                    'reference_type' => Purchase::class,
                    'reference_id'   => $purchase->id,
                    'user_id'        => auth()->id(),
                ]);
            }
        });
    }
}
```

### 2.4 CreateSaleAction (Orchestrator)

```php
// app/Domain/Finance/Actions/CreateSaleAction.php
class CreateSaleAction
{
    public function __construct(
        private readonly DeductStockAction      $deductStock,
        private readonly RecordJournalEntryAction $recordJournal,
    ) {}

    public function execute(SaleData $data): Sale
    {
        return DB::transaction(function () use ($data) {
            // 1. Buat header Sale
            $sale = Sale::create([
                'user_id'         => auth()->id(),
                'customer_name'   => $data->customerName,
                'total_amount'    => $data->totalAmount,
                'payment_method'  => $data->paymentMethod,
                'payment_status'  => 'pending',
                'notes'           => $data->notes,
            ]);

            // 2. Buat item-item
            foreach ($data->items as $item) {
                $sale->items()->create([
                    'product_id'      => $item->productId,
                    'quantity'        => $item->quantity,
                    'unit_price'      => $item->unitPrice,
                    'discount_amount' => $item->discountAmount,
                ]);
            }

            // 3. Kurangi stok (dengan validasi & audit log)
            $this->deductStock->execute($sale);

            // 4. Catat jurnal Double-Entry otomatis
            $this->recordJournal->execute($sale);

            return $sale->fresh(['items.product']);
        });
    }
}
```

### 2.5 Custom Exception

```php
// app/Exceptions/InsufficientStockException.php
class InsufficientStockException extends \RuntimeException
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error'   => 'INSUFFICIENT_STOCK',
        ], 422);
    }
}
```

### 2.6 SaleObserver (Kompensasi saat Sale dihapus)

```php
// app/Observers/SaleObserver.php
class SaleObserver
{
    public function __construct(private readonly ReplenishStockAction $replenish) {}

    // Jika sale dibatalkan/dihapus → kembalikan stok
    public function deleting(Sale $sale): void
    {
        if ($sale->payment_status === 'paid') {
            throw new \LogicException('Sale yang sudah dibayar tidak bisa dihapus langsung. Gunakan fitur Refund.');
        }

        // Balik stok
        $sale->loadMissing('items');
        foreach ($sale->items as $item) {
            $product     = Product::lockForUpdate()->find($item->product_id);
            $stockBefore = $product->stock_qty;
            $product->increment('stock_qty', $item->quantity);

            StockMovement::create([
                'product_id'     => $product->id,
                'type'           => 'return',
                'direction'      => 'in',
                'quantity'       => $item->quantity,
                'stock_before'   => $stockBefore,
                'stock_after'    => $product->fresh()->stock_qty,
                'reference_type' => Sale::class,
                'reference_id'   => $sale->id,
                'user_id'        => auth()->id(),
                'notes'          => 'Auto-restock akibat pembatalan sale',
            ]);
        }
    }
}
```

### 2.7 StoreSaleRequest — Validasi Server-Side

```php
// app/Http/Requests/StoreSaleRequest.php
class StoreSaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_name'           => ['nullable', 'string', 'max:255'],
            'payment_method'          => ['required', Rule::in(['cash', 'qris', 'transfer', 'midtrans'])],
            'paid_amount'             => ['required', 'numeric', 'min:0'],
            'notes'                   => ['nullable', 'string', 'max:1000'],
            'items'                   => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id'      => ['required', 'exists:products,id'],
            'items.*.quantity'        => ['required', 'integer', 'min:1', 'max:9999'],
            'items.*.unit_price'      => ['required', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
```

---

## 3. Pilar 2 — POS High-Speed UI {#pilar-2}

### 3.1 Global Cart Store (Zustand)

```typescript
// admin-panel/src/stores/cartStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  stock_qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity' | 'discount'>) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  updateDiscount: (productId: number, discount: number) => void;
  clear: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  devtools((set, get) => ({
    items: [],

    addItem: (product) =>
      set((state) => {
        const existing = state.items.find((i) => i.product_id === product.product_id);
        if (existing) {
          // Guard: tidak melebihi stok
          if (existing.quantity >= product.stock_qty) return state;
          return {
            items: state.items.map((i) =>
              i.product_id === product.product_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          };
        }
        return { items: [...state.items, { ...product, quantity: 1, discount: 0 }] };
      }),

    removeItem: (productId) =>
      set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) })),

    updateQty: (productId, qty) =>
      set((state) => ({
        items:
          qty <= 0
            ? state.items.filter((i) => i.product_id !== productId)
            : state.items.map((i) =>
                i.product_id === productId ? { ...i, quantity: qty } : i
              ),
      })),

    updateDiscount: (productId, discount) =>
      set((state) => ({
        items: state.items.map((i) =>
          i.product_id === productId ? { ...i, discount } : i
        ),
      })),

    clear: () => set({ items: [] }),

    total: () =>
      get().items.reduce(
        (sum, i) => sum + i.price * i.quantity - i.discount * i.quantity,
        0
      ),

    itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  }))
);
```

### 3.2 Barcode/Keyboard Scanner Hook

```typescript
// admin-panel/src/pages/pos/hooks/useBarcodeScanner.ts
import { useEffect, useRef } from 'react';

/**
 * Hook untuk mendeteksi input barcode scanner (USB HID).
 * Scanner biasanya mengirim karakter cepat lalu Enter.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const buffer = useRef('');
  const timer  = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Abaikan jika user sedang focus di input manual
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.key === 'Enter') {
        const code = buffer.current.trim();
        if (code.length >= 3) onScan(code);
        buffer.current = '';
        clearTimeout(timer.current);
        return;
      }

      buffer.current += e.key;

      // Reset buffer jika tidak ada input selama 200ms (input manual)
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        buffer.current = '';
      }, 200);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onScan]);
}
```

### 3.3 useProducts Hook

```typescript
// admin-panel/src/pages/pos/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks'; // atau buat sendiri
import api from '@/services/api';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock_qty: number;
}

export function useProducts(search: string) {
  const [debounced] = useDebouncedValue(search, 200);

  return useQuery<Product[]>({
    queryKey: ['pos-products', debounced],
    queryFn: () =>
      api.get('/products', { params: { search: debounced, limit: 48, with_stock: true } })
         .then((r) => r.data.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // jaga agar grid tidak flicker
  });
}

export function useProductByBarcode(barcode: string | null) {
  return useQuery<Product | null>({
    queryKey: ['product-barcode', barcode],
    queryFn: () =>
      barcode
        ? api.get(`/products/barcode/${barcode}`).then((r) => r.data.data)
        : Promise.resolve(null),
    enabled: !!barcode,
  });
}
```

### 3.4 POSPage Layout

```tsx
// admin-panel/src/pages/pos/POSPage.tsx
import { useState, useCallback } from 'react';
import { Layout, Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import BarcodeListener from './components/BarcodeListener';
import { useCartStore } from '@/stores/cartStore';

const { Content, Sider } = Layout;

export default function POSPage() {
  const [payOpen, setPayOpen]     = useState(false);
  const [mobileSider, setMobile]  = useState(false);
  const { items, total, itemCount } = useCartStore();

  const handleSuccess = useCallback(() => {
    setPayOpen(false);
    setMobile(false);
  }, []);

  return (
    <Layout className="h-screen overflow-hidden bg-gray-50">
      {/* Barcode scanner listener global */}
      <BarcodeListener />

      <Content className="overflow-y-auto p-4">
        <ProductGrid />
      </Content>

      {/* Desktop: sider tetap */}
      <Sider
        width={400}
        className="hidden lg:flex flex-col bg-white shadow-2xl"
        style={{ overflow: 'hidden' }}
      >
        <CartPanel />
        <div className="p-4 border-t bg-gray-50">
          <Button
            type="primary"
            size="large"
            block
            disabled={items.length === 0}
            onClick={() => setPayOpen(true)}
            className="!h-14 !text-lg !font-bold !bg-green-600 !border-green-700"
          >
            Bayar — {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total())}
          </Button>
        </div>
      </Sider>

      {/* Mobile: floating button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Badge count={itemCount()} size="default">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => setMobile(true)}
            className="!w-16 !h-16 !bg-green-600 shadow-xl"
          />
        </Badge>
      </div>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
```

### 3.5 CartPanel

```tsx
// admin-panel/src/pages/pos/components/CartPanel.tsx
import { InputNumber, Button, Empty, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCartStore } from '@/stores/cartStore';

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function CartPanel() {
  const { items, updateQty, removeItem, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Empty description="Keranjang kosong" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.name}</p>
              <p className="text-xs text-gray-500">{IDR(item.price)} × {item.quantity}</p>
            </div>

            <InputNumber
              min={1}
              max={item.stock_qty}
              size="small"
              value={item.quantity}
              onChange={(v) => updateQty(item.product_id, v ?? 1)}
              className="!w-16"
            />

            <p className="text-sm font-bold text-green-700 w-20 text-right">
              {IDR(item.price * item.quantity)}
            </p>

            <Tooltip title="Hapus">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => removeItem(item.product_id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Tooltip>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-700">Total</span>
          <span className="text-2xl font-extrabold text-green-700">{IDR(total())}</span>
        </div>
      </div>
    </div>
  );
}
```

### 3.6 PaymentModal

```tsx
// admin-panel/src/pages/pos/components/PaymentModal.tsx
import { useEffect, useRef, useState } from 'react';
import { Modal, InputNumber, Radio, Button, Alert, Divider, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cartStore';
import api from '@/services/api';
import { loadMidtransSnap } from '@/services/midtrans';

type PaymentMethod = 'cash' | 'midtrans';

export default function PaymentModal({
  open, onClose, onSuccess
}: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { items, total, clear } = useCartStore();
  const [method, setMethod]     = useState<PaymentMethod>('cash');
  const [paid, setPaid]         = useState(0);
  const inputRef                = useRef<any>(null);

  const change = paid - total();

  // Auto-focus input bayar saat modal terbuka
  useEffect(() => {
    if (open) {
      setPaid(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        payment_method: method,
        paid_amount:    paid,
        items: items.map((i) => ({
          product_id:      i.product_id,
          quantity:        i.quantity,
          unit_price:      i.price,
          discount_amount: i.discount * i.quantity,
        })),
      };

      const { data } = await api.post('/sales', payload);
      return data;
    },

    onSuccess: async (data) => {
      if (method === 'midtrans') {
        const snap = await loadMidtransSnap();
        snap.pay(data.snap_token, {
          onSuccess: () => { clear(); onSuccess(); },
          onError:   (err: any) => message.error(`Pembayaran gagal: ${err.message}`),
          onClose:   () => message.info('Pembayaran dibatalkan'),
        });
      } else {
        // Cash: langsung cetak struk
        window.open(`/receipts/pos/${data.sale_id}?print=1`, '_blank');
        clear();
        onSuccess();
        message.success('Transaksi berhasil!');
      }
    },

    onError: (err: any) => {
      message.error(err.response?.data?.message ?? 'Transaksi gagal');
    },
  });

  const canSubmit = method === 'midtrans' ? items.length > 0 : paid >= total();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="💳 Proses Pembayaran"
      width={440}
      destroyOnClose
    >
      <div className="space-y-5 py-2">
        {/* Total */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Total Tagihan</p>
          <p className="text-4xl font-extrabold text-gray-900">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total())}
          </p>
        </div>

        {/* Metode */}
        <Radio.Group value={method} onChange={(e) => setMethod(e.target.value)} buttonStyle="solid" block>
          <Radio.Button value="cash">💵 Tunai</Radio.Button>
          <Radio.Button value="midtrans">📱 QRIS / Transfer</Radio.Button>
        </Radio.Group>

        {/* Cash input */}
        {method === 'cash' && (
          <>
            <InputNumber
              ref={inputRef}
              size="large"
              className="w-full"
              prefix="Rp"
              placeholder="Jumlah uang diterima"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(v) => Number(v!.replace(/\./g, ''))}
              value={paid || undefined}
              onChange={(v) => setPaid(v ?? 0)}
              min={0}
            />

            {/* Kembalian */}
            {paid > 0 && (
              <div className={`rounded-xl p-4 text-center ${change >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-sm text-gray-500">{change >= 0 ? 'Kembalian' : 'Kurang'}</p>
                <p className={`text-3xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(change))}
                </p>
              </div>
            )}

            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[10000, 20000, 50000, 100000].map((amt) => (
                <Button key={amt} size="small" onClick={() => setPaid(Math.ceil(total() / amt) * amt)}>
                  {amt >= 1000 ? `${amt / 1000}rb` : amt}
                </Button>
              ))}
            </div>
          </>
        )}

        {method === 'midtrans' && (
          <Alert
            type="info"
            message="Setelah klik Proses, halaman pembayaran Midtrans akan terbuka."
            showIcon
          />
        )}

        <Divider className="!my-3" />

        <Button
          type="primary"
          size="large"
          block
          loading={mutation.isPending}
          disabled={!canSubmit}
          onClick={() => mutation.mutate()}
          className="!h-14 !text-base !font-bold !bg-green-600 !border-green-700"
        >
          ✅ {method === 'cash' ? 'Bayar & Cetak Struk' : 'Proses Pembayaran'}
        </Button>
      </div>
    </Modal>
  );
}
```

### 3.7 BarcodeListener

```tsx
// admin-panel/src/pages/pos/components/BarcodeListener.tsx
import { useCallback } from 'react';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useCartStore } from '@/stores/cartStore';
import api from '@/services/api';

export default function BarcodeListener() {
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();

  const handleScan = useCallback(async (barcode: string) => {
    try {
      const { data } = await api.get(`/products/barcode/${barcode}`);
      addItem(data.data);
      message.success(`${data.data.name} ditambahkan`, 1);
    } catch {
      message.error(`Produk dengan barcode "${barcode}" tidak ditemukan`, 2);
    }
  }, [addItem]);

  useBarcodeScanner(handleScan);
  return null; // komponen non-visual
}
```

### 3.8 Midtrans Service Wrapper

```typescript
// admin-panel/src/services/midtrans.ts
declare global {
  interface Window { snap?: any; }
}

let loaded = false;

export async function loadMidtransSnap(): Promise<any> {
  if (window.snap) return window.snap;
  if (loaded) {
    // Tunggu load selesai
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (window.snap) { clearInterval(check); resolve(window.snap); }
      }, 100);
    });
  }

  loaded = true;
  return new Promise((resolve, reject) => {
    const script   = document.createElement('script');
    const isProd   = import.meta.env.VITE_MIDTRANS_ENV === 'production';
    script.src     = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.onload  = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.head.appendChild(script);
  });
}
```

---

## 4. Pilar 3 — Advanced Reporting {#pilar-3}

### 4.1 ReportService (Backend Lengkap)

```php
// app/Domain/Finance/Services/ReportService.php
class ReportService
{
    // ─── Laba Rugi ───────────────────────────────────────────────
    public function getProfitLoss(string $from, string $to): array
    {
        $revenues = $this->getAccountBalances('4-%', $from, $to);  // 4-xxxx Pendapatan
        $expenses = $this->getAccountBalances('5-%', $from, $to);  // 5-xxxx Beban

        $totalRevenue = $revenues->sum('balance');
        $totalExpense = $expenses->sum('balance');

        return [
            'period'        => compact('from', 'to'),
            'revenues'      => $revenues,
            'expenses'      => $expenses,
            'total_revenue' => $totalRevenue,
            'total_expense' => $totalExpense,
            'gross_profit'  => $totalRevenue - $this->getCogs($from, $to),
            'net_income'    => $totalRevenue - $totalExpense,
        ];
    }

    // ─── Neraca (Balance Sheet) ───────────────────────────────────
    public function getBalanceSheet(string $asOf): array
    {
        $assets      = $this->getAccountBalances('1-%', null, $asOf, 'debit');  // Aktiva
        $liabilities = $this->getAccountBalances('2-%', null, $asOf, 'credit'); // Kewajiban
        $equity      = $this->getAccountBalances('3-%', null, $asOf, 'credit'); // Ekuitas

        // Laba ditahan: net income s.d. tanggal tersebut
        $yearStart  = Carbon::parse($asOf)->startOfYear()->toDateString();
        $retainedEarnings = $this->getProfitLoss($yearStart, $asOf)['net_income'];

        $totalAssets      = $assets->sum('balance');
        $totalLiabilities = $liabilities->sum('balance');
        $totalEquity      = $equity->sum('balance') + $retainedEarnings;

        return [
            'as_of'               => $asOf,
            'assets'              => $assets->groupBy('category'),
            'liabilities'         => $liabilities->groupBy('category'),
            'equity'              => $equity,
            'retained_earnings'   => $retainedEarnings,
            'total_assets'        => $totalAssets,
            'total_liabilities'   => $totalLiabilities,
            'total_equity'        => $totalEquity,
            'balanced'            => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
        ];
    }

    // ─── Arus Kas (Cash Flow — Indirect Method) ──────────────────
    public function getCashFlow(string $from, string $to): array
    {
        $cashAccountId = AccountingAccount::where('code', '1-1100')->value('id'); // Kas

        // Operating: dari transaksi penjualan & beban operasional
        $cashFromSales = Sale::whereBetween('created_at', [$from, $to])
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $cashForExpenses = AccountingExpense::whereBetween('date', [$from, $to])
            ->where('paid', true)
            ->sum('amount');

        // Investing: pembelian aset tetap (3-xxxx dalam jurnal)
        $cashInvesting = AccountingJournal::whereBetween('date', [$from, $to])
            ->where('reference_type', 'asset_purchase')
            ->sum('amount');

        // Financing: pinjaman / modal disetor
        $cashFinancing = AccountingJournal::whereBetween('date', [$from, $to])
            ->whereIn('reference_type', ['loan_receipt', 'capital_injection'])
            ->sum('amount');

        $netOperating = $cashFromSales - $cashForExpenses;

        return [
            'period'          => compact('from', 'to'),
            'operating'       => [
                'cash_from_sales'     => $cashFromSales,
                'cash_for_expenses'   => $cashForExpenses,
                'net'                 => $netOperating,
            ],
            'investing'       => [
                'asset_purchases' => $cashInvesting,
                'net'             => -$cashInvesting,
            ],
            'financing'       => [
                'loans_received' => $cashFinancing,
                'net'            => $cashFinancing,
            ],
            'net_change'      => $netOperating - $cashInvesting + $cashFinancing,
        ];
    }

    // ─── Helper ───────────────────────────────────────────────────
    private function getAccountBalances(
        string $codePattern,
        ?string $from,
        string $to,
        string $normalBalance = 'credit'
    ): Collection {
        return AccountingAccount::where('code', 'like', $codePattern)
            ->get()
            ->map(function ($account) use ($from, $to, $normalBalance) {
                $query = $account->journalEntries()->where('date', '<=', $to);
                if ($from) $query->where('date', '>=', $from);

                $debit  = $query->sum('debit');
                $credit = $query->sum('credit');

                $balance = $normalBalance === 'debit'
                    ? $debit - $credit
                    : $credit - $debit;

                return [
                    'code'     => $account->code,
                    'name'     => $account->name,
                    'category' => $account->category,
                    'balance'  => max(0, $balance), // tidak tampilkan saldo negatif di laporan
                    'raw'      => $balance,
                ];
            })
            ->filter(fn($a) => $a['balance'] != 0);
    }

    private function getCogs(string $from, string $to): float
    {
        // Harga Pokok Penjualan dari akun 5-1000
        $cogsAccount = AccountingAccount::where('code', '5-1000')->first();
        if (!$cogsAccount) return 0;

        return $cogsAccount->journalEntries()
            ->whereBetween('date', [$from, $to])
            ->sum('debit');
    }
}
```

### 4.2 ReportController

```php
// app/Http/Controllers/Api/V1/ReportController.php
class ReportController extends Controller
{
    public function __construct(private readonly ReportService $service) {}

    public function profitLoss(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['required', 'date'],
            'to'   => ['required', 'date', 'after_or_equal:from'],
        ]);

        return response()->json($this->service->getProfitLoss($request->from, $request->to));
    }

    public function balanceSheet(Request $request): JsonResponse
    {
        $request->validate(['as_of' => ['required', 'date']]);
        return response()->json($this->service->getBalanceSheet($request->as_of));
    }

    public function cashFlow(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['required', 'date'],
            'to'   => ['required', 'date'],
        ]);
        return response()->json($this->service->getCashFlow($request->from, $request->to));
    }
}
```

### 4.3 ReportsPage (Frontend)

```tsx
// admin-panel/src/pages/reports/ReportsPage.tsx
import { useState } from 'react';
import { Tabs, DatePicker, Button, Space, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import ProfitLossReport from './components/ProfitLossReport';
import BalanceSheetReport from './components/BalanceSheetReport';
import CashFlowReport from './components/CashFlowReport';
import { useReports } from './hooks/useReports';

const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('pl');
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

  const from  = range[0].format('YYYY-MM-DD');
  const to    = range[1].format('YYYY-MM-DD');

  const { pl, bs, cf, isLoading } = useReports({ from, to, activeTab });

  const handleExport = (type: string, format: 'xlsx' | 'pdf') => {
    const params = new URLSearchParams({ from, to, as_of: to, format });
    window.open(`/api/v1/reports/export/${type}?${params}`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        <Space>
          <RangePicker
            value={range}
            onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
            presets={[
              { label: 'Bulan Ini', value: [dayjs().startOf('month'), dayjs()] },
              { label: 'Bulan Lalu', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              { label: 'Tahun Ini', value: [dayjs().startOf('year'), dayjs()] },
            ]}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport(activeTab === 'pl' ? 'profit-loss' : activeTab === 'bs' ? 'balance-sheet' : 'cash-flow', 'xlsx')}
          >
            Export Excel
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport(activeTab === 'pl' ? 'profit-loss' : 'balance-sheet', 'pdf')}
          >
            Export PDF
          </Button>
        </Space>
      </div>

      <Spin spinning={isLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'pl', label: 'Laba Rugi',   children: <ProfitLossReport  data={pl} /> },
            { key: 'bs', label: 'Neraca',       children: <BalanceSheetReport data={bs} /> },
            { key: 'cf', label: 'Arus Kas',     children: <CashFlowReport    data={cf} /> },
          ]}
        />
      </Spin>
    </div>
  );
}
```

---

## 5. Pilar 4 — Midtrans Payment Gateway {#pilar-4}

### 5.1 Install & Konfigurasi

```bash
composer require midtrans/midtrans-php
```

```php
// config/services.php
'midtrans' => [
    'server_key'    => env('MIDTRANS_SERVER_KEY'),
    'client_key'    => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized'  => true,
    'is_3ds'        => true,
    'snap_url'      => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
],
```

```env
# .env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_IS_PRODUCTION=false

VITE_MIDTRANS_CLIENT_KEY="${MIDTRANS_CLIENT_KEY}"
VITE_MIDTRANS_ENV=sandbox
```

### 5.2 PaymentService

```php
// app/Domain/Finance/Services/PaymentService.php
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentService
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function createSnapToken(Sale $sale): string
    {
        $params = [
            'transaction_details' => [
                'order_id'     => $this->generateOrderId($sale),
                'gross_amount' => (int) $sale->total_amount,
            ],
            'item_details' => $sale->items->map(fn($item) => [
                'id'       => $item->product_id,
                'price'    => (int) $item->unit_price,
                'quantity' => $item->quantity,
                'name'     => Str::limit($item->product->name, 50),
            ])->toArray(),
            'customer_details' => [
                'first_name' => $sale->customer_name ?? 'Pelanggan',
            ],
            'enabled_payments' => [
                'gopay', 'shopeepay', 'qris',
                'bca_va', 'bni_va', 'bri_va', 'permata_va',
                'credit_card',
            ],
            'expiry' => [
                'unit'     => 'minutes',
                'duration' => 30,
            ],
        ];

        $token = Snap::getSnapToken($params);

        // Simpan token untuk referensi
        $sale->update(['midtrans_snap_token' => $token]);

        return $token;
    }

    public function handleWebhook(array $payload): void
    {
        // 1. Verifikasi signature
        $this->verifySignature($payload);

        // 2. Verifikasi order ID ada di database kita
        [$prefix, $saleId, $timestamp] = explode('-', $payload['order_id']);
        $sale = Sale::findOrFail($saleId);

        // 3. Update status berdasarkan notifikasi
        $status = match ($payload['transaction_status']) {
            'settlement', 'capture' => 'paid',
            'pending'               => 'pending',
            'deny', 'cancel', 'expire' => 'failed',
            default                 => 'unknown',
        };

        if ($status !== 'unknown' && $sale->payment_status !== 'paid') {
            $sale->update([
                'payment_status'       => $status,
                'midtrans_transaction' => $payload['transaction_id'],
                'paid_at'              => $status === 'paid' ? now() : null,
            ]);

            // Catat jurnal penerimaan kas jika sudah lunas
            if ($status === 'paid') {
                app(RecordJournalEntryAction::class)->executeForPayment($sale);
            }
        }
    }

    private function verifySignature(array $payload): void
    {
        $expected = hash('sha512',
            $payload['order_id'] .
            $payload['status_code'] .
            $payload['gross_amount'] .
            config('services.midtrans.server_key')
        );

        if ($expected !== ($payload['signature_key'] ?? '')) {
            Log::warning('Midtrans webhook: invalid signature', ['order_id' => $payload['order_id']]);
            throw new \InvalidArgumentException('Invalid signature key', 403);
        }
    }

    private function generateOrderId(Sale $sale): string
    {
        return 'RZQ-' . $sale->id . '-' . time();
    }
}
```

### 5.3 PaymentController (Webhook)

```php
// app/Http/Controllers/Api/V1/PaymentController.php
class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    // POST /api/v1/sales/{sale}/snap-token
    public function snapToken(Sale $sale): JsonResponse
    {
        // Pastikan sale belum dibayar
        abort_if($sale->payment_status === 'paid', 422, 'Transaksi sudah dibayar.');

        $token = $this->paymentService->createSnapToken($sale);
        return response()->json(['snap_token' => $token]);
    }

    // POST /api/v1/payments/midtrans/webhook
    // ⚠️ Route ini HARUS dikecualikan dari CSRF & auth middleware
    public function webhook(Request $request): JsonResponse
    {
        try {
            $this->paymentService->handleWebhook($request->all());
            return response()->json(['status' => 'ok']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            Log::error('Midtrans webhook error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Server error'], 500);
        }
    }
}
```

### 5.4 Routes — Exclude CSRF untuk Webhook

```php
// routes/api.php
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    // ... route lain

    Route::post('/sales/{sale}/snap-token', [PaymentController::class, 'snapToken']);

    // Laporan
    Route::prefix('reports')->group(function () {
        Route::get('/profit-loss',   [ReportController::class, 'profitLoss']);
        Route::get('/balance-sheet', [ReportController::class, 'balanceSheet']);
        Route::get('/cash-flow',     [ReportController::class, 'cashFlow']);
        Route::get('/export/{type}', [ExportController::class, 'export']);
    });
});

// Webhook Midtrans: TANPA auth & TANPA CSRF
Route::post(
    '/v1/payments/midtrans/webhook',
    [PaymentController::class, 'webhook']
)->withoutMiddleware(['auth:sanctum', 'csrf']);

// Alternatif: tambahkan di bootstrap/app.php
// $middleware->validateCsrfTokens(except: ['api/v1/payments/midtrans/webhook']);
```

---

## 6. Pilar 5 — Data Export {#pilar-5}

### 6.1 Install

```bash
composer require maatwebsite/excel
composer require barryvdh/laravel-dompdf
```

### 6.2 Export Classes

```php
// app/Exports/ProfitLossExport.php
use Maatwebsite\Excel\Concerns\{
    FromCollection, WithHeadings, WithTitle,
    WithStyles, WithColumnWidths, WithEvents
};
use PhpOffice\PhpSpreadsheet\Style\{Fill, Alignment, Border};
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProfitLossExport implements
    FromCollection, WithHeadings, WithTitle,
    WithStyles, WithColumnWidths
{
    public function __construct(
        private readonly array  $data,
        private readonly string $from,
        private readonly string $to
    ) {}

    public function collection(): Collection
    {
        $rows = collect();

        $rows->push(['LAPORAN LABA RUGI', '', '', '']);
        $rows->push(["Periode: {$this->from} s.d. {$this->to}", '', '', '']);
        $rows->push(['', '', '', '']);
        $rows->push(['PENDAPATAN', '', '', '']);

        foreach ($this->data['revenues'] as $r) {
            $rows->push(['', $r['code'], $r['name'], $r['balance']]);
        }
        $rows->push(['', '', 'Total Pendapatan', $this->data['total_revenue']]);
        $rows->push(['', '', '', '']);

        $rows->push(['BEBAN', '', '', '']);
        foreach ($this->data['expenses'] as $e) {
            $rows->push(['', $e['code'], $e['name'], $e['balance']]);
        }
        $rows->push(['', '', 'Total Beban', $this->data['total_expense']]);
        $rows->push(['', '', '', '']);
        $rows->push(['', '', 'LABA BERSIH', $this->data['net_income']]);

        return $rows;
    }

    public function headings(): array
    {
        return ['Kategori', 'Kode Akun', 'Keterangan', 'Jumlah (Rp)'];
    }

    public function title(): string { return 'Laba Rugi'; }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 15,
            'C' => 40,
            'D' => 20,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 14]],
            5    => ['font' => ['bold' => true], 'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'E8F4FD']]],
            'D'  => ['numberFormat' => ['formatCode' => '#,##0']],
        ];
    }
}

// app/Exports/BalanceSheetExport.php — ikuti pola yang sama
// app/Exports/CashFlowExport.php     — ikuti pola yang sama
```

### 6.3 PDF Export (via Blade + DomPDF)

```php
// resources/views/reports/profit-loss-pdf.blade.php
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; }
    h1 { text-align: center; color: #1a1a2e; }
    .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a1a2e; color: white; padding: 8px; text-align: left; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; }
    .section-header { background: #f0f7ff; font-weight: bold; }
    .total-row td { font-weight: bold; border-top: 2px solid #1a1a2e; }
    .net-income td { background: #1a1a2e; color: white; font-weight: bold; font-size: 14px; }
    .amount { text-align: right; }
  </style>
</head>
<body>
  <h1>LAPORAN LABA RUGI</h1>
  <p class="subtitle">{{ $data['period']['from'] }} — {{ $data['period']['to'] }}</p>

  <table>
    <thead>
      <tr>
        <th>Kode</th>
        <th>Keterangan</th>
        <th class="amount">Jumlah (Rp)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-header">
        <td colspan="3">PENDAPATAN</td>
      </tr>
      @foreach ($data['revenues'] as $r)
      <tr>
        <td>{{ $r['code'] }}</td>
        <td>{{ $r['name'] }}</td>
        <td class="amount">{{ number_format($r['balance'], 0, ',', '.') }}</td>
      </tr>
      @endforeach
      <tr class="total-row">
        <td colspan="2">Total Pendapatan</td>
        <td class="amount">{{ number_format($data['total_revenue'], 0, ',', '.') }}</td>
      </tr>

      <tr class="section-header">
        <td colspan="3">BEBAN</td>
      </tr>
      @foreach ($data['expenses'] as $e)
      <tr>
        <td>{{ $e['code'] }}</td>
        <td>{{ $e['name'] }}</td>
        <td class="amount">{{ number_format($e['balance'], 0, ',', '.') }}</td>
      </tr>
      @endforeach
      <tr class="total-row">
        <td colspan="2">Total Beban</td>
        <td class="amount">{{ number_format($data['total_expense'], 0, ',', '.') }}</td>
      </tr>

      <tr class="net-income">
        <td colspan="2">LABA BERSIH</td>
        <td class="amount">Rp {{ number_format($data['net_income'], 0, ',', '.') }}</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
```

### 6.4 ExportController

```php
// app/Http/Controllers/Api/V1/ExportController.php
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function __construct(private readonly ReportService $service) {}

    public function export(Request $request, string $type): mixed
    {
        $request->validate([
            'format' => ['required', Rule::in(['xlsx', 'pdf'])],
            'from'   => ['required_unless:type,balance-sheet', 'date'],
            'to'     => ['required_unless:type,balance-sheet', 'date'],
            'as_of'  => ['required_if:type,balance-sheet', 'date'],
        ]);

        $format = $request->format;
        $from   = $request->from ?? now()->startOfMonth()->toDateString();
        $to     = $request->to   ?? now()->toDateString();
        $asOf   = $request->as_of ?? $to;

        return match ($type) {
            'profit-loss' => $this->exportReport(
                fn() => $this->service->getProfitLoss($from, $to),
                ProfitLossExport::class,
                'reports.profit-loss-pdf',
                "laba-rugi-{$from}-{$to}",
                $format
            ),
            'balance-sheet' => $this->exportReport(
                fn() => $this->service->getBalanceSheet($asOf),
                BalanceSheetExport::class,
                'reports.balance-sheet-pdf',
                "neraca-{$asOf}",
                $format
            ),
            'cash-flow' => $this->exportReport(
                fn() => $this->service->getCashFlow($from, $to),
                CashFlowExport::class,
                'reports.cash-flow-pdf',
                "arus-kas-{$from}-{$to}",
                $format
            ),
            default => abort(404, 'Tipe laporan tidak ditemukan'),
        };
    }

    private function exportReport(
        callable $getData,
        string   $exportClass,
        string   $view,
        string   $filename,
        string   $format
    ): mixed {
        $data = $getData();

        if ($format === 'xlsx') {
            return Excel::download(
                new $exportClass($data, ...array_values($data['period'] ?? [])),
                "{$filename}.xlsx",
                \Maatwebsite\Excel\Excel::XLSX
            );
        }

        return Pdf::loadView($view, ['data' => $data])
            ->setPaper('a4', 'portrait')
            ->download("{$filename}.pdf");
    }
}
```

---

## 7. Security Hardening {#security}

### 7.1 API Layer

```php
// app/Http/Middleware/SecureApiHeaders.php
class SecureApiHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        return $response
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('X-Frame-Options', 'DENY')
            ->header('X-XSS-Protection', '1; mode=block')
            ->header('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }
}

// bootstrap/app.php — daftarkan middleware
$middleware->appendToGroup('api', SecureApiHeaders::class);
```

```php
// app/Http/Controllers/Api/V1/SaleController.php — Rate Limiting
Route::middleware(['auth:sanctum', 'throttle:pos'])->group(function () {
    Route::post('/sales', [SaleController::class, 'store']);
});

// app/Providers/AppServiceProvider.php
RateLimiter::for('pos', function (Request $request) {
    return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
});
```

### 7.2 Input Sanitization

```php
// Semua SaleRequest — tambahkan di StoreSaleRequest
protected function prepareForValidation(): void
{
    // Pastikan items adalah array yang bersih
    if ($this->has('items')) {
        $this->merge([
            'items' => collect($this->items)->map(fn($item) => [
                'product_id'      => (int) ($item['product_id'] ?? 0),
                'quantity'        => (int) ($item['quantity']   ?? 0),
                'unit_price'      => (float) ($item['unit_price'] ?? 0),
                'discount_amount' => (float) ($item['discount_amount'] ?? 0),
            ])->toArray(),
        ]);
    }
}
```

### 7.3 Audit Log

```php
// database/migrations/xxxx_create_audit_logs.php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('action');               // created, updated, deleted, login, export
    $table->string('model_type')->nullable();
    $table->unsignedBigInteger('model_id')->nullable();
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->string('user_agent')->nullable();
    $table->timestamps();
    $table->index(['model_type', 'model_id']);
    $table->index(['user_id', 'created_at']);
});

// app/Traits/Auditable.php — apply ke model penting
trait Auditable
{
    public static function bootAuditable(): void
    {
        foreach (['created', 'updated', 'deleted'] as $event) {
            static::$event(function (Model $model) use ($event) {
                AuditLog::create([
                    'user_id'    => auth()->id(),
                    'action'     => $event,
                    'model_type' => get_class($model),
                    'model_id'   => $model->getKey(),
                    'old_values' => $event === 'updated' ? $model->getOriginal() : null,
                    'new_values' => $event !== 'deleted'  ? $model->getAttributes() : null,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            });
        }
    }
}

// Gunakan di model kritis:
// class Sale extends Model { use Auditable; ... }
// class AccountingJournal extends Model { use Auditable; ... }
```

### 7.4 Webhook Security (Midtrans)

```php
// Pastikan webhook hanya bisa diakses dari IP Midtrans
// app/Http/Middleware/MidtransIpWhitelist.php
class MidtransIpWhitelist
{
    private const ALLOWED_IPS = [
        '103.208.23.0/24',  // Midtrans production IP range
        '103.208.23.6',
        '103.208.23.7',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (app()->isProduction()) {
            $clientIp = $request->ip();
            $allowed  = collect(self::ALLOWED_IPS)->some(function ($range) use ($clientIp) {
                return $this->ipInRange($clientIp, $range);
            });

            if (!$allowed) {
                Log::warning("Midtrans webhook blocked from IP: {$clientIp}");
                abort(403);
            }
        }

        return $next($request);
    }

    private function ipInRange(string $ip, string $range): bool
    {
        if (!str_contains($range, '/')) return $ip === $range;
        [$subnet, $bits] = explode('/', $range);
        $ip     = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask   = -1 << (32 - (int) $bits);
        return ($ip & $mask) === ($subnet & $mask);
    }
}
```

---

## 8. Testing Strategy {#testing}

### 8.1 Struktur Test

```
tests/
├── Unit/
│   ├── Domain/
│   │   ├── Finance/
│   │   │   ├── CreateSaleActionTest.php
│   │   │   └── ReportServiceTest.php
│   │   └── Inventory/
│   │       ├── DeductStockActionTest.php
│   │       └── ReplenishStockActionTest.php
│   └── Services/
│       └── PaymentServiceTest.php
├── Feature/
│   ├── Api/
│   │   ├── SaleControllerTest.php
│   │   ├── ReportControllerTest.php
│   │   └── PaymentWebhookTest.php
│   └── Exports/
│       └── ExportControllerTest.php
└── Browser/ (Laravel Dusk — opsional)
    └── POSFlowTest.php
```

### 8.2 Contoh Test Kritis

```php
// tests/Unit/Domain/Inventory/DeductStockActionTest.php
class DeductStockActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_deducts_stock_correctly(): void
    {
        $product = Product::factory()->create(['stock_qty' => 10]);
        $sale    = Sale::factory()
            ->has(SaleItem::factory()->state(['product_id' => $product->id, 'quantity' => 3]))
            ->create();

        app(DeductStockAction::class)->execute($sale);

        expect($product->fresh()->stock_qty)->toBe(7);
        expect(StockMovement::where('reference_id', $sale->id)->count())->toBe(1);
    }

    public function test_throws_when_insufficient_stock(): void
    {
        $product = Product::factory()->create(['stock_qty' => 2]);
        $sale    = Sale::factory()
            ->has(SaleItem::factory()->state(['product_id' => $product->id, 'quantity' => 5]))
            ->create();

        expect(fn() => app(DeductStockAction::class)->execute($sale))
            ->toThrow(InsufficientStockException::class);

        // Stok tidak berubah
        expect($product->fresh()->stock_qty)->toBe(2);
    }
}

// tests/Feature/Api/PaymentWebhookTest.php
class PaymentWebhookTest extends TestCase
{
    public function test_rejects_invalid_signature(): void
    {
        $response = $this->postJson('/api/v1/payments/midtrans/webhook', [
            'order_id'       => 'RZQ-1-12345',
            'status_code'    => '200',
            'gross_amount'   => '100000.00',
            'signature_key'  => 'invalid_signature',
        ]);

        $response->assertStatus(403);
    }

    public function test_updates_sale_on_settlement(): void
    {
        $sale      = Sale::factory()->create(['payment_status' => 'pending', 'total_amount' => 100000]);
        $orderId   = "RZQ-{$sale->id}-12345";
        $signature = hash('sha512', $orderId . '200' . '100000.00' . config('services.midtrans.server_key'));

        $this->postJson('/api/v1/payments/midtrans/webhook', [
            'order_id'           => $orderId,
            'status_code'        => '200',
            'gross_amount'       => '100000.00',
            'transaction_status' => 'settlement',
            'transaction_id'     => 'TRX-ABC-123',
            'signature_key'      => $signature,
        ])->assertOk();

        expect($sale->fresh()->payment_status)->toBe('paid');
    }
}
```

---

## 9. Deployment Checklist {#deployment}

### 9.1 Environment

```bash
# .env Production (checklist)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database — SQLite untuk single-server; pertimbangkan MySQL jika multi-server
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/rizquna/database/database.sqlite

# Keamanan
SESSION_DRIVER=database
SESSION_LIFETIME=480
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

# Queue (untuk journal async)
QUEUE_CONNECTION=database

# Cache
CACHE_DRIVER=file   # atau redis jika tersedia

MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-xxxx  # tanpa SB-
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
```

### 9.2 Post-Deploy Commands

```bash
# Deploy standar
php artisan migrate --force
php artisan db:seed --class=AccountingAccountSeeder --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Queue worker (gunakan Supervisor di production)
php artisan queue:work --tries=3 --timeout=90

# Supervisor config: /etc/supervisor/conf.d/rizquna-worker.conf
[program:rizquna-worker]
command=php /var/www/rizquna/artisan queue:work --tries=3 --timeout=90
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/rizquna-worker.log
```

### 9.3 SQLite — Permission & Backup

```bash
# Permission file SQLite (kritis!)
chown www-data:www-data database/database.sqlite
chmod 664 database/database.sqlite
chmod 775 database/

# Cron backup harian (tambahkan di crontab)
0 2 * * * cp /var/www/rizquna/database/database.sqlite \
  /backups/rizquna/database-$(date +\%Y\%m\%d).sqlite

# Tambahkan di app/Console/Kernel.php atau routes/console.php
Schedule::command('backup:run')->daily()->at('02:00');
```

### 9.4 Checklist Sebelum Go-Live

```
BACKEND
[ ] Semua migration dijalankan di production
[ ] AccountingAccountSeeder (COA standar) sudah dirun
[ ] MIDTRANS_IS_PRODUCTION=true
[ ] APP_DEBUG=false
[ ] Queue worker aktif (Supervisor)
[ ] Storage link dibuat: php artisan storage:link
[ ] Webhook Midtrans terdaftar di dashboard Midtrans
[ ] IP whitelist Midtrans aktif di production

FRONTEND
[ ] VITE_MIDTRANS_ENV=production
[ ] VITE_MIDTRANS_CLIENT_KEY menggunakan key production (bukan SB-)
[ ] Build production: npm run build
[ ] .env.production terkonfigurasi

SECURITY
[ ] HTTPS aktif (SSL certificate)
[ ] Rate limiting aktif
[ ] Audit log berjalan
[ ] File permission database SQLite benar (664)

TESTING
[ ] Test transaksi cash berhasil + struk tercetak
[ ] Test QRIS/Transfer via Midtrans sandbox
[ ] Test export Excel + PDF semua laporan
[ ] Test barcode scanner
[ ] Test low-stock alert
[ ] Test webhook Midtrans (gunakan ngrok untuk local)
```

---

*Dokumen ini adalah blueprint teknis penuh Rizquna Kasir v2.0.*  
*Setiap pilar berdiri sendiri dan bisa diimplementasikan secara bertahap.*  
*Standard: PSAK, Double-Entry Bookkeeping, PCI-DSS Aware.*
