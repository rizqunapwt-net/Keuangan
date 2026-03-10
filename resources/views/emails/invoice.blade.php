<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #0fb9b1; margin: 0; }
        .content { margin-bottom: 30px; }
        .details { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .details p { margin: 5px 0; }
        .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #0fb9b1; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rizquna.ID</h1>
            <p>Invoice Tagihan Baru</p>
        </div>
        
        <div class="content">
            <p>Halo <strong>{{ $contactName }}</strong>,</p>
            <p>Berikut adalah rincian tagihan Anda yang baru saja diterbitkan:</p>
            
            <div class="details">
                <p><strong>Nomor Invoice:</strong> {{ $invoiceNumber }}</p>
                <p><strong>Tanggal Jatuh Tempo:</strong> {{ $dueDate }}</p>
                <p><strong>Total Tagihan:</strong> Rp{{ number_format($amount, 0, ',', '.') }}</p>
                <p><strong>Keterangan:</strong> {{ $debt->description }}</p>
            </div>
            
            <p>Harap melakukan pembayaran sebelum tanggal jatuh tempo. Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
        </div>
        
        <div class="footer">
            <p>Terima kasih atas kepercayaan Anda.</p>
            <p>&copy; {{ date('Y') }} Rizquna.ID. All rights reserved.</p>
        </div>
    </div>
</body>
</html>