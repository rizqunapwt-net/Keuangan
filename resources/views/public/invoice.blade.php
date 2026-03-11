<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->kodeinvoice }} - Rizquna Publishing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; }
        @media print {
            .no-print { display: none; }
            body { background: white; }
            .print-shadow-none { box-shadow: none !important; border: 1px solid #eee; }
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen py-10 px-4">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print-shadow-none">
        
        <!-- Header Section -->
        <div class="bg-slate-900 px-8 py-10 text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">INVOICE</h1>
                <p class="text-slate-400 mt-1">#{{ $invoice->kodeinvoice }}</p>
                @if($invoice->status === 'paid')
                    <span class="inline-block mt-4 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-semibold uppercase tracking-wider">LUNAS</span>
                @else
                    <span class="inline-block mt-4 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-sm font-semibold uppercase tracking-wider">BELUM LUNAS</span>
                @endif
            </div>
            <div class="text-center md:text-right">
                <h2 class="text-xl font-bold">PT. Rizquna Publishing</h2>
                <p class="text-sm text-slate-400 mt-2">Jl. Raya Purwokerto - No. 123</p>
                <p class="text-sm text-slate-400">Jawa Tengah, Indonesia</p>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ditujukan Kepada</p>
                <h3 class="text-lg font-bold text-slate-800">{{ $invoice->client_name }}</h3>
                <p class="text-slate-500 mt-1">{{ $invoice->description ?: 'No description provided.' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Transaksi</p>
                    <p class="font-semibold text-slate-800">{{ $invoice->date ? $invoice->date->format('d M Y') : '-' }}</p>
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jatuh Tempo</p>
                    <p class="font-semibold text-slate-800">{{ $invoice->due_date ? $invoice->due_date->format('d M Y') : '-' }}</p>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="px-8 pb-8">
            <div class="overflow-x-auto rounded-xl border border-slate-100">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <th class="py-4 px-6">Produk / Layanan</th>
                            <th class="py-4 px-2 text-center">Jumlah</th>
                            <th class="py-4 px-2 text-right">Harga Satuan</th>
                            <th class="py-4 px-6 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 italic">
                        @php $items = is_array($invoice->items) ? $invoice->items : json_decode($invoice->items, true) ?: []; @endphp
                        @forelse($items as $item)
                            <tr class="text-slate-700">
                                <td class="py-4 px-6">
                                    <div class="font-semibold">{{ $item['nama_produk'] }}</div>
                                </td>
                                <td class="py-4 px-2 text-center text-slate-500">{{ $item['jumlah'] }} {{ $item['satuan'] }}</td>
                                <td class="py-4 px-2 text-right">Rp{{ number_format($item['harga'], 0, ',', '.') }}</td>
                                <td class="py-4 px-6 text-right font-bold text-slate-900 italic">Rp{{ number_format(($item['harga'] * $item['jumlah']) - ($item['diskon'] ?? 0), 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="4" class="py-10 text-center text-slate-400">No items found.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Summary & Footer -->
        <div class="p-8 bg-slate-50 flex flex-col md:flex-row justify-between gap-8 border-t border-slate-100">
            <!-- QR Code Section -->
            <div class="flex items-center gap-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-fit">
                @php $qrUrl = route('public.invoice', ['kodeinvoice' => $invoice->kodeinvoice]); @endphp
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ urlencode($qrUrl) }}" alt="QR Code" class="w-24 h-24">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Verifikasi Digital</p>
                    <p class="text-[9px] text-slate-400 mt-1 max-w-[120px]">Pindai untuk memverifikasi keaslian invoice ini secara online.</p>
                </div>
            </div>

            <!-- Totals -->
            <div class="md:w-64 space-y-3">
                <div class="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span class="font-semibold text-slate-800 italic">Rp{{ number_format($invoice->amount, 0, ',', '.') }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                    <span>Terbayar</span>
                    <span class="font-semibold text-emerald-600 italic">Rp{{ number_format($invoice->paid_amount, 0, ',', '.') }}</span>
                </div>
                <div class="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span class="font-bold text-slate-900 uppercase tracking-wider text-sm">Sisa Tagihan</span>
                    <span class="text-2xl font-bold text-slate-900 italic">Rp{{ number_format($invoice->amount - $invoice->paid_amount, 0, ',', '.') }}</span>
                </div>
            </div>
        </div>

        <div class="p-8 text-center border-t border-slate-100">
            <p class="text-xs text-slate-400 tracking-wide">&copy; {{ date('Y') }} PT. Rizquna Publishing. Terima kasih atas kepercayaan Anda.</p>
            <div class="mt-6 no-print">
                <button onclick="window.print()" class="px-6 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">Cetak Invoice</button>
            </div>
        </div>
    </div>
</body>
</html>
