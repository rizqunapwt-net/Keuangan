<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Perintah Kerja - {{ $order->order_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #0fb9b1; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #0fb9b1; margin: 0; text-transform: uppercase; }
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { padding: 5px; vertical-align: top; }
        .specs-box { border: 1px solid #ddd; padding: 15px; background: #f9f9f9; border-radius: 5px; margin-bottom: 20px; }
        .specs-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .label { font-weight: bold; width: 150px; display: inline-block; }
        .notes-box { border: 1px dashed #e74c3c; padding: 15px; background: #fff5f5; border-radius: 5px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
        .qr-code { float: right; width: 100px; height: 100px; border: 1px solid #ccc; text-align: center; line-height: 100px; color: #aaa; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">SURAT PERINTAH KERJA (SPK)</h1>
        <p style="margin: 5px 0;">No. Order: <strong>{{ $order->order_number }}</strong> | Tgl Masuk: {{ $order->order_date->format('d M Y') }}</p>
    </div>

    <table class="info-table">
        <tr>
            <td width="50%">
                <div class="label">Pelanggan:</div> {{ $order->customer->name }}<br>
                <div class="label">Sales/Kasir:</div> {{ $order->sales->name ?? 'Admin' }}<br>
                <div class="label">Deadline Selesai:</div> <strong style="color: #e74c3c;">{{ $order->deadline ? $order->deadline->format('d M Y') : 'ASAP' }}</strong>
            </td>
            <td width="50%">
                <div class="label">Prioritas:</div> <span style="text-transform: uppercase; font-weight: bold; color: {{ $order->priority == 'high' ? 'red' : 'black' }}">{{ $order->priority }}</span><br>
                <div class="label">Link File Desain:</div>
                @if($order->design_link)
                    <a href="{{ $order->design_link }}" target="_blank">Akses File Desain</a>
                @else
                    <i>- (Tunggu instruksi admin)</i>
                @endif
            </td>
        </tr>
    </table>

    <div class="specs-box">
        <div class="specs-title">SPESIFIKASI PRODUKSI</div>
        <p><div class="label">Produk Cetak:</div> <strong>{{ $order->product->name ?? 'Produk Custom' }}</strong></p>
        <p><div class="label">Kuantitas (Qty):</div> <strong>{{ $order->quantity }}</strong></p>
        
        @if($order->width_cm && $order->height_cm)
            <p><div class="label">Ukuran (PxL):</div> {{ $order->width_cm }} cm x {{ $order->height_cm }} cm</p>
            <p><div class="label">Total Area:</div> {{ rtrim(rtrim(number_format($order->area_m2, 4), '0'), '.') }} m&sup2;</p>
        @endif

        @if($order->paper_size)
            <p><div class="label">Ukuran Kertas:</div> {{ $order->paper_size }}</p>
        @endif

        @if($order->print_method)
            <p><div class="label">Metode Cetak:</div> <span style="text-transform:uppercase;">{{ $order->print_method }}</span></p>
        @endif

        @if($order->print_sides)
            <p><div class="label">Sisi Cetak:</div> {{ str_replace('_', ' ', $order->print_sides) }}</p>
        @endif

        @if($order->finishing_details)
            <p>
                <div class="label">Instruksi Finishing:</div> 
                <ul style="margin: 0; padding-left: 150px; list-style-type: square;">
                    @foreach($order->finishing_details as $key => $val)
                        @if(is_array($val))
                           - Multiple Finishings applied.
                        @else
                           <li>{{ strtoupper(str_replace('_', ' ', $key)) }}: {{ $val }}</li>
                        @endif
                    @endforeach
                </ul>
            </p>
        @endif
    </div>

    @if($order->customer_notes || $order->production_notes)
    <div class="notes-box">
        <div class="specs-title" style="border-color: #f5b7b1; color: #c0392b;">CATATAN OPERATOR</div>
        @if($order->customer_notes)
            <p><strong>Permintaan Pelanggan:</strong><br>{!! nl2br(e($order->customer_notes)) !!}</p>
        @endif
        @if($order->production_notes)
            <p><strong>Catatan Produksi:</strong><br>{!! nl2br(e($order->production_notes)) !!}</p>
        @endif
    </div>
    @endif

    <table width="100%" style="margin-top: 40px; text-align: center;">
        <tr>
            <td width="33%">Disiapkan Oleh,<br><br><br><br>__________________<br>Kasir / CS</td>
            <td width="33%">Desain / Pracetak,<br><br><br><br>__________________<br>Operator Setting</td>
            <td width="33%">Selesai Cetak Oleh,<br><br><br><br>__________________<br>Operator Mesin</td>
        </tr>
    </table>

    <div class="footer">
        Dihasilkan otomatis oleh Sistem Rizquna Kasir &bull; {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
