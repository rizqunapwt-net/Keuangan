<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 20px; font-bold: bold; margin-bottom: 5px; }
        .subtitle { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .section-title { background-color: #f9fafb; font-weight: bold; padding: 8px 10px; }
        .total-row { background-color: #f3f4f6; font-weight: bold; }
        .net-profit { font-size: 16px; margin-top: 20px; padding: 15px; background-color: #ecfdf5; border: 1px solid #10b981; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">LAPORAN LABA RUGI</div>
        <div class="subtitle">Rizquna Kasir</div>
        <div class="subtitle">Periode: {{ $data['period']['start'] }} s/d {{ $data['period']['end'] }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Keterangan Akun</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr class="section-title"><td colspan="2">PENDAPATAN</td></tr>
            @foreach($data['revenues']['items'] as $item)
            <tr>
                <td>{{ $item['name'] }} ({{ $item['code'] }})</td>
                <td class="text-right">Rp {{ number_format($item['balance'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>TOTAL PENDAPATAN</td>
                <td class="text-right">Rp {{ number_format($data['revenues']['total'], 0, ',', '.') }}</td>
            </tr>

            <tr class="section-title"><td colspan="2">BIAYA & BEBAN</td></tr>
            @foreach($data['expenses']['items'] as $item)
            <tr>
                <td>{{ $item['name'] }} ({{ $item['code'] }})</td>
                <td class="text-right">Rp {{ number_format($item['balance'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>TOTAL BIAYA</td>
                <td class="text-right">Rp {{ number_format($data['expenses']['total'], 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="net-profit">
        LABA (RUGI) BERSIH: 
        <span style="color: {{ $data['net_profit'] >= 0 ? '#059669' : '#dc2626' }}">
            Rp {{ number_format($data['net_profit'], 0, ',', '.') }}
        </span>
    </div>

    <div style="margin-top: 50px; text-align: right;">
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>
