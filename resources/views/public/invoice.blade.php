<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->kodeinvoice }} - RIZQUNA</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', Helvetica, sans-serif; 
            color: #000; 
            background: #f8fafc; 
            display: flex;
            justify-content: center;
            padding: 40px 20px;
        }

        .invoice-card {
            background: #fff;
            width: 100%;
            max-width: 780px;
            padding: 40px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            position: relative;
            border-radius: 8px;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .invoice-card { box-shadow: none; padding: 15px 20px; border-radius: 0; max-width: 100%; }
            .no-print { display: none; }
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-top: 1px solid #000; border-bottom: 1px solid #000; }
        th { padding: 6px 8px; text-align: left; font-size: 13px; font-weight: 700; border-bottom: 1px solid #000; }
        td { padding: 8px; font-size: 13px; border-right: 1px solid #000; }
        td:last-child { border-right: none; }
        
        .stamp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-18deg);
            z-index: 10;
            pointer-events: none;
            opacity: 0.7;
        }
        .stamp-inner {
            border: 5px solid;
            border-radius: 12px;
            padding: 8px 32px;
            position: relative;
        }
        .stamp-border {
            position: absolute;
            inset: 3px;
            border: 2px solid;
            border-radius: 8px;
        }
        .stamp-text {
            font-size: 36px;
            font-weight: 900;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-align: center;
            line-height: 1.2;
            padding: 4px 0;
        }

        .btn-print {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #0fb9b1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(15, 185, 177, 0.4);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 100;
        }
        .btn-print:hover { background: #0da49d; }
    </style>
</head>
<body>
    <button class="btn-print no-print" onclick="window.print()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        CETAK INVOICE
    </button>

    <div class="invoice-card">
        <!-- Logo & Header -->
        <div style="text-align: center; margin-bottom: 10px;">
            <img src="/admin/logo-nre.png" alt="Logo" style="max-height: 85px; max-width: 100%; object-fit: contain; margin-bottom: 6px;">
            <div style="font-size: 13px; color: #000; font-weight: 500;">
                <span style="color: #0000FF; text-decoration: underline;">www.rizquna.id</span> | cv.rizquna@gmail.com | IG: <span style="color: #0000FF;">@penerbit_rizquna</span>
            </div>
        </div>

        <div style="border-top: 2px solid #000; margin-bottom: 8px;"></div>

        <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; font-weight: 600;">
            <span>Kode Invoice : {{ $invoice->kodeinvoice }}</span>
            <span>Tanggal order: {{ $invoice->date ? $invoice->date->format('d/m/Y') : '-' }}</span>
        </div>

        <div style="margin-bottom: 16px; font-size: 13px;">
            <div style="font-weight: 800;">Kepada Yth: {{ $invoice->client_name }}</div>
            <div>berikut adalah Detail Order Anda:</div>
        </div>

        <!-- Stamp Section -->
        @php
            $status = $invoice->status;
            $stamp = [
                'paid' => ['text' => 'LUNAS', 'color' => '#16a34a'],
                'unpaid' => ['text' => 'BELUM LUNAS', 'color' => '#dc2626'],
                'partial' => ['text' => 'CICILAN', 'color' => '#ea580c']
            ][$status] ?? ['text' => 'BELUM LUNAS', 'color' => '#dc2626'];
        @endphp
        <div class="stamp">
            <div class="stamp-inner" style="border-color: {{ $stamp['color'] }};">
                <div class="stamp-border" style="border-color: {{ $stamp['color'] }};"></div>
                <div class="stamp-text" style="color: {{ $stamp['color'] }};">{{ $stamp['text'] }}</div>
            </div>
        </div>

        <!-- Table Items -->
        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">No.</th>
                    <th>Pemesanan</th>
                    <th style="text-align: center; width: 60px;">Jumlah</th>
                    <th style="text-align: center; width: 60px;">satuan</th>
                    <th style="text-align: right; width: 100px;">Harga @</th>
                    <th style="text-align: right; width: 80px;">Disc</th>
                    <th style="text-align: right; width: 110px;">Sub Total</th>
                </tr>
            </thead>
            <tbody>
                @php $items = is_array($invoice->items) ? $invoice->items : (json_decode($invoice->items, true) ?: []); @endphp
                @foreach($items as $idx => $item)
                    <tr>
                        <td>{{ $idx + 1 }}</td>
                        <td>{{ $item['nama_produk'] ?? $item['nama'] ?? 'Produk' }}</td>
                        <td style="text-align: center;">{{ $item['jumlah'] }}</td>
                        <td style="text-align: center;">{{ $item['satuan'] ?? 'Pcs' }}</td>
                        <td style="text-align: right;">Rp{{ number_format($item['harga'] ?? 0, 0, ',', '.') }}</td>
                        <td style="text-align: right;">{{ isset($item['diskon']) && $item['diskon'] > 0 ? 'Rp'.number_format($item['diskon'], 0, ',', '.') : 'Rp.0' }}</td>
                        <td style="text-align: right;">Rp{{ number_format((($item['harga'] ?? 0) * ($item['jumlah'] ?? 0)) - ($item['diskon'] ?? 0), 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr style="border-top: 1px solid #000; font-weight: 800;">
                    <td colspan="6" style="padding: 8px; text-align: left; border-right: 1px solid #000;">TOTAL</td>
                    <td style="padding: 8px; text-align: right;">Rp{{ number_format($invoice->amount, 0, ',', '.') }}</td>
                </tr>
            </tfoot>
        </table>

        <!-- Footer Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 13px;">
            <div style="flex: 1;">
                <div style="font-size: 11px; color: #666;">
                    @if($status === 'paid')
                        <div style="font-weight: 700; color: #16a34a;">✅ Invoice ini sudah LUNAS. Terima kasih.</div>
                    @else
                        <div style="font-weight: 700;">Pembayaran via:</div>
                        <div>Bank BTPN / SMBC (kode 213) Account: 902-4013-3956 a.n FITRIANTO</div>
                        @if($status === 'partial')
                            <div style="margin-top: 4px; font-weight: 600; color: #ea580c;">
                                Sisa tagihan: Rp{{ number_format($invoice->amount - $invoice->paid_amount, 0, ',', '.') }}
                            </div>
                        @endif
                    @endif
                </div>
            </div>

            <div style="position: relative; text-align: center; width: 220px;">
                <div style="font-weight: 700; margin-bottom: 4px;">Direktur,</div>
                <div style="height: 90px; display: flex; align-items: center; justify-content: center; padding: 5px 0;">
                    @php $qrUrl = "https://invoice.rizquna.id/v/inv/" . $invoice->kodeinvoice; @endphp
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ urlencode($qrUrl) }}" alt="Digital Signature" style="width: 85px; height: 85px; opacity: 0.9;">
                </div>
                <div style="font-weight: 800; text-transform: uppercase; border-top: 1px solid #000; padding-top: 2px;">SUDARYONO</div>
                <div style="font-size: 7px; color: #888; margin-top: 2px; letter-spacing: 0.5px;">DIGITALLY SIGNED & VERIFIED</div>
            </div>
        </div>

        <div style="margin-top: 12px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 8px;">
            Invoice ini diterbitkan secara elektronik dan sah sesuai sistem keuangan RIZQUNA.
        </div>
    </div>
</body>
</html>
