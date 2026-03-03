<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
        .text-right { text-align: right; }
        .section-title { background-color: #f9fafb; font-weight: bold; padding: 8px 10px; }
        .total-row { background-color: #f3f4f6; font-weight: bold; }
        .balance-status { font-size: 16px; margin-top: 20px; padding: 15px; text-align: center; }
        .balanced { background-color: #ecfdf5; border: 1px solid #10b981; }
        .unbalanced { background-color: #fef2f2; border: 1px solid #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">LAPORAN POSISI KEUANGAN (NERACA)</div>
        <div class="subtitle">Rizquna Kasir</div>
        <div class="subtitle">Per Tanggal: {{ $asOf }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Keterangan Akun</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr class="section-title"><td colspan="2">ASET</td></tr>
            @foreach($data['assets']['items'] as $item)
            <tr>
                <td>{{ $item['name'] }} ({{ $item['code'] }})</td>
                <td class="text-right">Rp {{ number_format($item['balance'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>TOTAL ASET</td>
                <td class="text-right">Rp {{ number_format($data['assets']['total'], 0, ',', '.') }}</td>
            </tr>

            <tr class="section-title"><td colspan="2">KEWAJIBAN</td></tr>
            @foreach($data['liabilities']['items'] as $item)
            <tr>
                <td>{{ $item['name'] }} ({{ $item['code'] }})</td>
                <td class="text-right">Rp {{ number_format($item['balance'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>TOTAL KEWAJIBAN</td>
                <td class="text-right">Rp {{ number_format($data['liabilities']['total'], 0, ',', '.') }}</td>
            </tr>

            <tr class="section-title"><td colspan="2">MODAL (EKUITAS)</td></tr>
            @foreach($data['equity']['items'] as $item)
            <tr>
                <td>{{ $item['name'] }} ({{ $item['code'] }})</td>
                <td class="text-right">Rp {{ number_format($item['balance'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr>
                <td>Laba Berjalan</td>
                <td class="text-right">Rp {{ number_format($data['equity']['current_earnings'], 0, ',', '.') }}</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL MODAL</td>
                <td class="text-right">Rp {{ number_format($data['equity']['total'], 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @php
        $totalLiabEquity = $data['liabilities']['total'] + $data['equity']['total'];
        $isBalanced = abs($data['assets']['total'] - $totalLiabEquity) < 1;
    @endphp

    <div class="balance-status {{ $isBalanced ? 'balanced' : 'unbalanced' }}">
        Total Kewajiban + Modal: Rp {{ number_format($totalLiabEquity, 0, ',', '.') }}
        <br>
        @if($isBalanced)
            <strong style="color: #059669;">BALANCE (Aset = Kewajiban + Modal)</strong>
        @else
            <strong style="color: #dc2626;">TIDAK BALANCE - Periksa jurnal entry</strong>
        @endif
    </div>

    <div style="margin-top: 50px; text-align: right;">
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>
