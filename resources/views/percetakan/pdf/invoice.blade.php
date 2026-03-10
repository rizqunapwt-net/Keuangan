<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $order->order_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; }
        .header { display: table; width: 100%; border-bottom: 2px solid #0fb9b1; padding-bottom: 20px; margin-bottom: 20px; }
        .header-left { display: table-cell; width: 50%; }
        .header-right { display: table-cell; width: 50%; text-align: right; }
        .title { font-size: 32px; font-weight: bold; color: #0fb9b1; margin: 0; text-transform: uppercase; }
        .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .info-table { width: 100%; margin-bottom: 30px; }
        .info-table td { padding: 5px; vertical-align: top; }
        .label { font-weight: bold; width: 100px; display: inline-block; color: #555; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background-color: #0fb9b1; color: white; padding: 10px; text-align: left; }
        .items-table td { border-bottom: 1px solid #ddd; padding: 10px; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        
        .summary-box { width: 40%; float: right; }
        .summary-table { width: 100%; border-collapse: collapse; }
        .summary-table td { padding: 8px 10px; }
        .summary-table tr.border-top td { border-top: 2px solid #333; font-weight: bold; }
        .summary-table tr.total td { background-color: #f9f9f9; font-size: 16px; color: #0fb9b1; }
        
        .footer { clear: both; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 4px; font-weight: bold; text-transform: uppercase; border: 2px solid; }
        .status-paid { color: #27ae60; border-color: #27ae60; }
        .status-unpaid { color: #e74c3c; border-color: #e74c3c; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="company-name">RIZQUNA PERCETAKAN</div>
            Jl. Contoh Industri No. 123, Kota Kreatif<br>
            Telp: (021) 1234-5678<br>
            Email: billing@rizquna.com
        </div>
        <div class="header-right">
            <h1 class="title">INVOICE</h1>
            <p>
                <strong>#{{ $order->order_number }}</strong><br>
                Tanggal: {{ $order->order_date->format('d M Y') }}
            </p>
            @if($order->balance_due <= 0)
                <div class="status-badge status-paid">LUNAS</div>
            @else
                <div class="status-badge status-unpaid">BELUM LUNAS</div>
            @endif
        </div>
    </div>

    <table class="info-table">
        <tr>
            <td width="50%">
                <div style="color: #777; margin-bottom: 5px;">Ditagihkan Kepada:</div>
                <strong style="font-size: 16px;">{{ $order->customer->name }}</strong><br>
                {{ $order->customer->company_name }}<br>
                {{ $order->customer->phone }}<br>
                {{ $order->customer->email }}
            </td>
            <td width="50%" class="text-right">
                <div style="color: #777; margin-bottom: 5px;">Detail Pembayaran:</div>
                <div class="label">Jatuh Tempo:</div> {{ $order->deadline ? $order->deadline->format('d M Y') : '-' }}<br>
                <div class="label">Kasir:</div> {{ $order->sales->name ?? 'Admin' }}
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Deskripsi Produk</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $order->product->name ?? 'Custom Cetak' }}</strong>
                    <div style="font-size: 12px; color: #555; margin-top: 4px;">
                        @if($order->width_cm && $order->height_cm)
                            Ukuran: {{ $order->width_cm }}x{{ $order->height_cm }} cm ({{ $order->area_m2 }} m&sup2;)<br>
                        @endif
                        @if($order->paper_size) Kertas: {{ $order->paper_size }} <br>@endif
                        @if($order->print_method) Metode: {{ strtoupper($order->print_method) }} <br>@endif
                    </div>
                </td>
                <td class="text-center">{{ $order->quantity }}</td>
                <td class="text-right">Rp {{ number_format($order->unit_price, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($order->unit_price * $order->quantity, 0, ',', '.') }}</td>
            </tr>
            
            @if($order->finishing_details && is_array($order->finishing_details))
                @foreach($order->finishing_details as $key => $val)
                    <tr>
                        <td colspan="3" style="font-size: 12px; color: #555; padding-left: 20px;">
                            + Extra Finishing ({{ $key }})
                        </td>
                        <td class="text-right">
                            @if(is_numeric($val))
                                Rp {{ number_format($val, 0, ',', '.') }}
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>

    <div class="summary-box">
        <table class="summary-table">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
            </tr>
            @if($order->discount_amount > 0)
            <tr>
                <td style="color: #e74c3c;">Diskon</td>
                <td class="text-right" style="color: #e74c3c;">- Rp {{ number_format($order->discount_amount, 0, ',', '.') }}</td>
            </tr>
            @endif
            @if($order->tax_amount > 0)
            <tr>
                <td>PPN (11%)</td>
                <td class="text-right">Rp {{ number_format($order->tax_amount, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr class="border-top total">
                <td><strong>TOTAL TAGIHAN</strong></td>
                <td class="text-right"><strong>Rp {{ number_format($order->total_amount, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td>DP / Dibayar</td>
                <td class="text-right">Rp {{ number_format($order->deposit_amount, 0, ',', '.') }}</td>
            </tr>
            <tr class="border-top">
                <td>SISA TAGIHAN</td>
                <td class="text-right" style="color: {{ $order->balance_due > 0 ? '#e74c3c' : '#27ae60' }};">
                    <strong>Rp {{ number_format($order->balance_due, 0, ',', '.') }}</strong>
                </td>
            </tr>
        </table>
    </div>

    <div style="clear: both; margin-top: 30px;">
        <strong>Informasi Pembayaran:</strong><br>
        Silakan transfer pembayaran ke rekening berikut:<br>
        BCA: 123-456-7890 a/n PT Rizquna Kasir<br>
        Mandiri: 098-765-4321 a/n PT Rizquna Kasir
    </div>

    <div class="footer">
        Terima kasih atas kepercayaan Anda menggunakan jasa kami. Dokumen ini sah dan di-generate oleh sistem.
    </div>
</body>
</html>
