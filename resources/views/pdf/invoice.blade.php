<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice Royalti {{ $invoiceNumber }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111827; }
        .header { margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
        .right { text-align: right; }
    </style>
</head>
<body>
<div class="header">
    <div class="title">Invoice Pembayaran Royalti</div>
    <div>Nomor Invoice: {{ $invoiceNumber }}</div>
    <div>Tanggal: {{ $generatedAt->format('d-m-Y') }}</div>
    <div>Periode: {{ $calculation->period_month }}</div>
    <div>Penulis: {{ $calculation->author->name }}</div>
</div>

<table>
    <thead>
    <tr>
        <th>Judul Buku</th>
        <th class="right">Qty</th>
        <th class="right">Net Price</th>
        <th class="right">Royalti %</th>
        <th class="right">Jumlah</th>
    </tr>
    </thead>
    <tbody>
    @foreach($calculation->items as $item)
        <tr>
            <td>{{ $item->book->title }}</td>
            <td class="right">{{ $item->quantity }}</td>
            <td class="right">Rp {{ number_format($item->net_price, 0, ',', '.') }}</td>
            <td class="right">{{ number_format($item->royalty_percentage, 2) }}%</td>
            <td class="right">Rp {{ number_format($item->amount, 0, ',', '.') }}</td>
        </tr>
    @endforeach
    </tbody>
    <tfoot>
    <tr>
        <th colspan="4" class="right">Total</th>
        <th class="right">Rp {{ number_format($calculation->total_amount, 0, ',', '.') }}</th>
    </tr>
    </tfoot>
</table>
</body>
</html>
