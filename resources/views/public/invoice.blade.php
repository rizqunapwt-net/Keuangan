<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->kodeinvoice }} - RIZQUNA</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', Helvetica, sans-serif; 
            color: #000; 
            background: #fff; 
            display: flex;
            justify-content: center;
            padding: 20px;
        }

        .invoice-card {
            background: #fff;
            width: 100%;
            max-width: 720px;
            padding: 20px;
            position: relative;
        }

        @media print {
            body { padding: 0; }
            .invoice-card { padding: 10px; max-width: 100%; }
            .no-print { display: none; }
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-top: 2px solid #000; border-bottom: 2px solid #000; }
        th { padding: 8px; text-align: left; font-size: 13px; font-weight: 700; border-bottom: 1px solid #000; }
        td { padding: 8px; font-size: 13px; border-right: 1px solid #000; border-bottom: 1px solid #eee; }
        td:last-child { border-right: none; }
        tr:last-child td { border-bottom: none; }
        
        .stamp {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            z-index: 10;
            pointer-events: none;
            opacity: 0.6;
        }
        .stamp-inner {
            border: 6px solid;
            border-radius: 12px;
            padding: 10px 40px;
            position: relative;
        }
        .stamp-border {
            position: absolute;
            inset: 3px;
            border: 2px solid;
            border-radius: 8px;
        }
        .stamp-text {
            font-size: 42px;
            font-weight: 900;
            letter-spacing: 5px;
            text-transform: uppercase;
            text-align: center;
            line-height: 1.1;
        }

        .btn-print {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #fff;
            color: #0fb9b1;
            border: 2px solid #0fb9b1;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 100;
            transition: all 0.2s;
        }
        .btn-print:hover { background: #0fb9b1; color: #fff; }
    </style>
</head>
<body>


    <div class="invoice-card">
        @php
            $settings = \App\Models\Setting::first();
            $companyLogo = $settings->company_logo ?? '/admin/logo-nre.png';
            $companyWebsite = $settings->company_website ?? 'www.rizquna.id';
            $companyEmail = $settings->company_email ?? 'cv.rizquna@gmail.com';
            $companyIG = $settings->company_ig ?? '@penerbit_rizquna';
        @endphp
        <!-- Logo & Header (Matched to PDF) -->
        <div style="text-align: center; margin-bottom: 12px;">
            <img src="{{ $companyLogo }}" alt="Logo" style="max-height: 85px; max-width: 100%; object-fit: contain; margin-bottom: 8px;">
            <div style="font-size: 13px; color: #000; font-weight: 500;">
                <span style="color: #0000FF; text-decoration: underline;">{{ $companyWebsite }}</span> | {{ $companyEmail }} | IG: <span style="color: #0000FF; text-decoration: none;">{{ $companyIG }}</span>
            </div>
        </div>

        <div style="border-top: 2px solid #000; margin-bottom: 8px;"></div>

        <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; display: flex; justify-content: space-between; margin-bottom: 18px; font-size: 14px; font-weight: 700;">
            <span>Kode Invoice : {{ $invoice->kodeinvoice }}</span>
            <span>Tanggal order: {{ $invoice->date ? $invoice->date->format('d/m/Y') : '-' }}</span>
        </div>

        <div style="margin-bottom: 18px; font-size: 14px;">
            <div style="font-weight: 800; text-transform: uppercase;">Kepada Yth: {{ $invoice->client_name }}</div>
            <div style="font-size: 13px; margin-top: 2px;">berikut adalah Detail Order Anda:</div>
        </div>

        <!-- Stamp Section -->
        @php
            $status = $invoice->status;
            $stamp = [
                'paid' => ['text' => 'LUNAS', 'color' => '#16a34a', 'border' => '#16a34a'],
                'unpaid' => ['text' => "BELUM\nLUNAS", 'color' => '#dc2626', 'border' => '#dc2626'],
                'partial' => ['text' => 'CICILAN', 'color' => '#ea580c', 'border' => '#ea580c']
            ][$status] ?? ['text' => 'BELUM LUNAS', 'color' => '#dc2626', 'border' => '#dc2626'];
        @endphp
        <div class="stamp">
            <div class="stamp-inner" style="border-color: {{ $stamp['border'] }};">
                <div class="stamp-border" style="border-color: {{ $stamp['border'] }};"></div>
                <div class="stamp-text" style="color: {{ $stamp['color'] }}; white-space: pre-wrap;">{{ $stamp['text'] }}</div>
            </div>
        </div>

        <!-- Table Items -->
        <table>
            <thead>
                <tr>
                    <th style="width: 45px; text-align: center;">No.</th>
                    <th>Pemesanan</th>
                    <th style="text-align: center; width: 65px;">Jumlah</th>
                    <th style="text-align: center; width: 65px;">satuan</th>
                    <th style="text-align: center; width: 110px;">Harga @</th>
                    <th style="text-align: center; width: 90px;">Disc</th>
                    <th style="text-align: center; width: 120px;">Sub Total</th>
                </tr>
            </thead>
            <tbody>
                @php $items = is_array($invoice->items) ? $invoice->items : (json_decode($invoice->items, true) ?: []); @endphp
                @foreach($items as $idx => $item)
                    <tr>
                        <td style="text-align: center;">{{ $idx + 1 }}</td>
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
                <tr style="border-top: 2px solid #000; font-weight: 800;">
                    <td colspan="6" style="padding: 8px; text-align: left; border-right: 1px solid #000;">TOTAL</td>
                    <td style="padding: 8px; text-align: right; background: #fafafa;">Rp{{ number_format($invoice->amount, 0, ',', '.') }}</td>
                </tr>
            </tfoot>
        </table>

        <!-- Footer Section (Matched to PDF) -->
        @php
            $settings = \App\Models\Setting::first();
            $directorName = $settings->director_name ?? 'SUDARYONO';
            $directorTitle = $settings->director_title ?? 'Direktur';
            $bankInfo = ($settings->invoice_bank_name ?? 'Bank BTPN / SMBC (kode 213)') . ' Account: ' . ($settings->invoice_bank_account ?? '902-4013-3956') . ' a.n ' . ($settings->invoice_bank_holder ?? 'FITRIANTO');
            $companyName = $settings->company_name ?? 'RIZQUNA';
            $companyLogo = $settings->company_logo ?? '/admin/logo-nre.png';
            $footerNote = $settings->footer_note ?? 'Invoice ini diterbitkan secara elektronik dan sah sesuai sistem keuangan RIZQUNA.';
        @endphp
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 35px; font-size: 13px;">
            <div style="flex: 1;">
                <div style="font-size: 12px; color: #444;">
                    <div style="font-weight: 700; color: #000; margin-bottom: 2px;">Pembayaran via:</div>
                    <div>{{ $bankInfo }}</div>
                    @if($status === 'partial')
                        <div style="margin-top: 5px; font-weight: 700; color: #ea580c; font-size: 13px;">
                            SISA TAGIHAN: Rp{{ number_format($invoice->amount - $invoice->paid_amount, 0, ',', '.') }}
                        </div>
                    @endif
                    @if($status === 'paid')
                        <div style="margin-top: 5px; font-weight: 800; color: #16a34a; font-size: 13px;">✅ LUNAS. Terima kasih.</div>
                    @endif
                </div>
            </div>

            <div style="text-align: center; width: 220px;">
                <div style="font-weight: 700; margin-bottom: 5px; font-size: 14px;">{{ $directorTitle }},</div>
                <div style="height: 100px; display: flex; align-items: center; justify-content: center; padding: 5px 0;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data={{ urlencode('https://invoice.rizquna.id/v/inv/' . $invoice->kodeinvoice) }}" alt="Digital Signature" style="width: 95px; height: 95px; opacity: 0.95;">
                </div>
                <div style="border-top: 1.5px solid #000; padding-top: 3px;">
                    <div style="font-weight: 800; text-transform: uppercase; font-size: 14px;">{{ $directorName }}</div>
                    <div style="font-size: 8px; color: #666; margin-top: 1px; letter-spacing: 0.8px; font-weight: 600;">DIGITALLY SIGNED & VERIFIED</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">
            {{ $footerNote }}
        </div>
    </div>
</body>
</html>
