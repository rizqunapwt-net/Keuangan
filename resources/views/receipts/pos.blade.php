<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Pembayaran - {{ $payment->invoice_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000;
            width: 80mm; /* Standar kertas kasir termal */
            margin: 0 auto;
            padding: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        .w-100 { width: 100%; }
        
        @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="text-center">
        <h2 style="margin: 0;">RIZQUNA KASIR</h2>
        <p style="margin: 5px 0;">Jl. Contoh Kasir No. 123<br>Telp: 0812-3456-7890</p>
    </div>

    <div class="divider"></div>

    <table class="w-100">
        <tr>
            <td>No. Transaksi</td>
            <td>: {{ $payment->invoice_number }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ $payment->created_at->format('d/m/Y H:i') }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td>: {{ $payment->user ? $payment->user->name : 'Admin' }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <table class="w-100">
        <!-- Rincian Item (Mockup karena saat ini tabel Payment berdiri sendiri) -->
        <tr>
            <td colspan="3" class="font-bold">Pembayaran Tagihan / Item</td>
        </tr>
        <tr>
            <td>1 x</td>
            <td>{{ $payment->description ?? 'Pembayaran Umum' }}</td>
            <td class="text-right">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <table class="w-100 font-bold">
        <tr>
            <td>TOTAL</td>
            <td class="text-right">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>METODE</td>
            <td class="text-right">{{ strtoupper($payment->payment_method ?? 'CASH') }}</td>
        </tr>
        <tr>
            <td>STATUS</td>
            <td class="text-right">{{ strtoupper($payment->status) }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <div class="text-center">
        <p>Terima Kasih<br>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        <p style="font-size: 10px;">Powered by Rizquna ERP</p>
    </div>

    <script>
        // Otomatis trigger print saat halaman dibuka
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
