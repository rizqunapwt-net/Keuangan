<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt #{{ $sale->id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10px;
            line-height: 1.4;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .company {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .receipt-title {
            font-size: 12px;
            margin-bottom: 4px;
        }
        .datetime {
            font-size: 9px;
            color: #666;
        }
        .divider {
            border-bottom: 1px dashed #000;
            margin: 8px 0;
        }
        .divider-double {
            border-bottom: 2px dashed #000;
            margin: 8px 0;
        }
        .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
        }
        .row.items-header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
            margin-bottom: 4px;
        }
        .item-name {
            flex: 2;
        }
        .item-qty {
            flex: 0.5;
            text-align: center;
        }
        .item-price {
            flex: 1;
            text-align: right;
        }
        .item-subtotal {
            flex: 1;
            text-align: right;
            font-weight: bold;
        }
        .total-section {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
        }
        .total-row.grand-total {
            font-size: 12px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 8px;
            margin-top: 8px;
        }
        .payment-info {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #000;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 9px;
        }
        .footer-line {
            margin: 3px 0;
        }
        .thank-you {
            font-size: 11px;
            font-weight: bold;
            margin: 8px 0;
        }
        .barcode {
            margin-top: 10px;
            text-align: center;
        }
        .transaction-id {
            font-size: 8px;
            color: #666;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company">{{ $company ?? config('app.name') }}</div>
        <div class="receipt-title">STRUK BELANJA</div>
        <div class="datetime">{{ $sale->created_at->format('d/m/Y H:i') }}</div>
    </div>

    <div class="divider"></div>

    <div class="row items-header">
        <span class="item-name">ITEM</span>
        <span class="item-qty">QTY</span>
        <span class="item-price">HARGA</span>
        <span class="item-subtotal">TOTAL</span>
    </div>

    @foreach($sale->items as $item)
    <div class="row">
        <span class="item-name">{{ $item->product->name ?? 'Product #' . $item->product_id }}</span>
        <span class="item-qty">{{ $item->quantity }}</span>
        <span class="item-price">{{ number_format($item->unit_price, 0, ',', '.') }}</span>
        <span class="item-subtotal">{{ number_format($item->subtotal, 0, ',', '.') }}</span>
    </div>
    @if(!empty($item->discount_amount) && $item->discount_amount > 0)
    <div class="row" style="font-size: 8px; color: #666; margin-left: 5px;">
        <span>Disc: {{ number_format($item->discount_amount, 0, ',', '.') }}</span>
    </div>
    @endif
    @endforeach

    <div class="divider"></div>

    <div class="total-section">
        <div class="total-row">
            <span>Subtotal</span>
            <span>Rp {{ number_format($sale->items->sum('subtotal'), 0, ',', '.') }}</span>
        </div>
        @if($sale->items->sum('discount_amount') > 0)
        <div class="total-row">
            <span>Total Diskon</span>
            <span>-Rp {{ number_format($sale->items->sum('discount_amount'), 0, ',', '.') }}</span>
        </div>
        @endif
        <div class="total-row grand-total">
            <span>TOTAL</span>
            <span>Rp {{ number_format($sale->total_amount, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="payment-info">
        <div class="total-row">
            <span>Metode Pembayaran</span>
            <span>{{ ucfirst(str_replace('_', ' ', $sale->payment_method)) }}</span>
        </div>
        <div class="total-row">
            <span>Status</span>
            <span>{{ ucfirst($sale->payment_status) }}</span>
        </div>
        @if($sale->payment_status === 'paid' && $sale->paid_at)
        <div class="total-row">
            <span>Tanggal Bayar</span>
            <span>{{ $sale->paid_at->format('d/m/Y H:i') }}</span>
        </div>
        @endif
        @if(!empty($sale->customer_name))
        <div class="total-row">
            <span>Pelanggan</span>
            <span>{{ $sale->customer_name }}</span>
        </div>
        @endif
    </div>

    <div class="divider-double"></div>

    <div class="footer">
        <div class="thank-you">TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
        <div class="footer-line">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</div>
        <div class="footer-line">Simpan struk ini sebagai bukti pembayaran yang sah</div>
        @if(!empty($sale->metadata['cashier_name']))
        <div class="footer-line" style="margin-top: 8px;">Kasir: {{ $sale->metadata['cashier_name'] }}</div>
        @endif
        <div class="transaction-id">#{{ $sale->id }} | {{ $sale->created_at->format('YmdHis') }}</div>
    </div>

    @if(config('services.midtrans.qr_string'))
    <div class="barcode">
        <div style="font-size: 8px; margin-bottom: 4px;">Scan untuk pembayaran</div>
        <div style="width: 100px; height: 100px; margin: 0 auto; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc;">
            <span style="font-size: 8px;">QR Code</span>
        </div>
    </div>
    @endif
</body>
</html>
