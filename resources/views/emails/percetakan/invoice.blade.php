<!DOCTYPE html>
<html>
<head>
    <title>Invoice Pesanan #{{ $order->order_number }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Halo, {{ $order->customer->name }}!</h2>
    <p>Terima kasih telah mempercayakan kebutuhan cetak Anda kepada <strong>Rizquna Percetakan</strong>.</p>
    <p>Bersama email ini, kami melampirkan detail invoice untuk pesanan Anda dengan nomor <strong>#{{ $order->order_number }}</strong>.</p>
    
    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #0fb9b1; margin-bottom: 20px;">
        <strong>Total Tagihan:</strong> Rp {{ number_format($order->total_amount, 0, ',', '.') }}<br>
        <strong>Status Pembayaran:</strong> <span style="color: {{ $order->balance_due > 0 ? '#e74c3c' : '#27ae60' }}">{{ $order->balance_due > 0 ? 'BELUM LUNAS' : 'LUNAS' }}</span>
    </div>

    @if($order->balance_due > 0)
    <p>Untuk menyelesaikan pembayaran, silakan transfer ke rekening yang tertera di dalam dokumen invoice terlampir.</p>
    @endif

    <p>Jika ada pertanyaan, jangan ragu untuk membalas email ini atau menghubungi CS kami.</p>
    
    <p>Salam hangat,<br><strong>Tim Rizquna Kasir</strong></p>
</body>
</html>
