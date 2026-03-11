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
        
        <!-- Header Section (Matched to Admin style) -->
        <div class="px-8 py-10 text-center border-b-2 border-slate-900">
            <div class="mb-4">
                <img src="/admin/logo-nre.png" alt="Logo" class="max-h-24 mx-auto object-contain mb-3">
                <div class="text-xs font-semibold text-slate-600 tracking-wide">
                    <span class="text-blue-600 underline">www.rizquna.id</span> | cv.rizquna@gmail.com | IG: <span class="text-blue-600">@penerbit_rizquna</span>
                </div>
            </div>
        </div>

        <div class="px-8 py-4 flex flex-col md:flex-row justify-between items-center bg-slate-50 border-b border-slate-200">
            <h1 class="text-xl font-bold text-slate-800">INVOICE : {{ $invoice->kodeinvoice }}</h1>
            <p class="text-sm font-semibold text-slate-500">Tanggal: {{ $invoice->date ? $invoice->date->format('d/m/Y') : '-' }}</p>
        </div>

        <!-- Info Grid -->
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pelanggan Yth:</p>
                <h3 class="text-lg font-bold text-slate-800">{{ $invoice->client_name }}</h3>
                <p class="text-slate-500 mt-1 text-sm leading-relaxed">{{ $invoice->description ?: 'Detail tagihan pesanan Anda.' }}</p>
            </div>
            <div class="flex flex-col justify-end items-end space-y-2">
                @if($invoice->status === 'paid')
                    <div class="px-6 py-2 border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl rotate-[-12deg] opacity-70 rounded-lg">LUNAS</div>
                @elseif($invoice->status === 'unpaid')
                    <div class="px-6 py-2 border-4 border-red-500 text-red-500 font-extrabold text-2xl rotate-[-12deg] opacity-70 rounded-lg whitespace-nowrap">BELUM LUNAS</div>
                @else
                    <div class="px-6 py-2 border-4 border-orange-500 text-orange-500 font-extrabold text-2xl rotate-[-12deg] opacity-70 rounded-lg">CICILAN</div>
                @endif
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
                        @php $items = is_array($invoice->items) ? $invoice->items : (json_decode($invoice->items, true) ?: []); @endphp
                        @forelse($items as $item)
                            <tr class="text-slate-700">
                                <td class="py-4 px-6">
                                    <div class="font-semibold">{{ $item['nama_produk'] ?? $item['nama'] ?? 'Produk' }}</div>
                                </td>
                                <td class="py-4 px-2 text-center text-slate-500">{{ $item['jumlah'] }} {{ $item['satuan'] ?? 'Pcs' }}</td>
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
        <div class="p-8 bg-slate-50 flex flex-col md:flex-row justify-between items-end gap-8 border-t border-slate-100">
            <!-- Totals (Left) -->
            <div class="md:w-72 space-y-3 order-2 md:order-1">
                <div class="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span class="font-semibold text-slate-800 italic">Rp{{ number_format($invoice->amount, 0, ',', '.') }}</span>
                </div>
                <div class="flex justify-between text-slate-500 text-sm">
                    <span>Sudah Dibayar</span>
                    <span class="font-semibold text-emerald-600 italic">Rp{{ number_format($invoice->paid_amount, 0, ',', '.') }}</span>
                </div>
                <div class="pt-3 border-t border-slate-300 flex justify-between items-center">
                    <span class="font-bold text-slate-900 uppercase tracking-wider text-xs">Sisa Tagihan</span>
                    <span class="text-xl font-black text-slate-900 italic">Rp{{ number_format(max(0, $invoice->amount - $invoice->paid_amount), 0, ',', '.') }}</span>
                </div>
                
                @if($invoice->status !== 'paid')
                <div class="mt-6 p-4 bg-white rounded-lg border border-slate-200 text-[10px] text-slate-500">
                    <p class="font-bold text-slate-700 mb-1 tracking-tight">INFO PEMBAYARAN:</p>
                    <p>Bank BTPN / SMBC (kode 213)</p>
                    <p class="font-semibold text-slate-900">Acc: 902-4013-3956</p>
                    <p>a.n FITRIANTO</p>
                </div>
                @endif
            </div>

            <!-- Signature (Right) Section -->
            <div class="text-center w-64 order-1 md:order-2">
                <p class="text-sm font-bold text-slate-800 mb-2">Direktur,</p>
                <div class="flex justify-center items-center py-2">
                    @php $qrUrl = "https://invoice.rizquna.id/v/inv/" . $invoice->kodeinvoice; @endphp
                    <div class="relative">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ urlencode($qrUrl) }}" alt="Digital Signature" class="w-20 h-20 opacity-90">
                    </div>
                </div>
                <div class="mt-2 border-t border-slate-800 pt-1">
                    <p class="text-xs font-black uppercase tracking-widest text-slate-900">SUDARYONO</p>
                    <p class="text-[7px] text-slate-400 mt-1 tracking-[0.2em]">DIGITALLY SIGNED & VERIFIED</p>
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
