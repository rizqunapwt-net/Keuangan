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
        .net-flow { font-size: 16px; margin-top: 20px; padding: 15px; background-color: #eff6ff; border: 1px solid #3b82f6; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">LAPORAN ARUS KAS</div>
        <div class="subtitle">Rizquna Kasir</div>
        <div class="subtitle">Periode: {{ $data['period']['start'] ?? $start }} s/d {{ $data['period']['end'] ?? $end }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Keterangan</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr class="section-title"><td colspan="2">AKTIVITAS OPERASI</td></tr>
            @foreach($data['operating']['items'] ?? [] as $item)
            <tr>
                <td>{{ $item['description'] ?? $item['reference'] ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($item['amount'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>Total Operasi</td>
                <td class="text-right">Rp {{ number_format($data['operating']['total'] ?? 0, 0, ',', '.') }}</td>
            </tr>

            <tr class="section-title"><td colspan="2">AKTIVITAS INVESTASI</td></tr>
            @foreach($data['investing']['items'] ?? [] as $item)
            <tr>
                <td>{{ $item['description'] ?? $item['reference'] ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($item['amount'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>Total Investasi</td>
                <td class="text-right">Rp {{ number_format($data['investing']['total'] ?? 0, 0, ',', '.') }}</td>
            </tr>

            <tr class="section-title"><td colspan="2">AKTIVITAS PENDANAAN</td></tr>
            @foreach($data['financing']['items'] ?? [] as $item)
            <tr>
                <td>{{ $item['description'] ?? $item['reference'] ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($item['amount'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>Total Pendanaan</td>
                <td class="text-right">Rp {{ number_format($data['financing']['total'] ?? 0, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="net-flow">
        ARUS KAS BERSIH:
        <span style="color: {{ ($data['net_cash_flow'] ?? 0) >= 0 ? '#059669' : '#dc2626' }}">
            Rp {{ number_format($data['net_cash_flow'] ?? 0, 0, ',', '.') }}
        </span>
    </div>

    <div style="margin-top: 50px; text-align: right;">
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>
