<?php
use App\Models\Debt;
$inv = new Debt();
$inv->type = "receivable";
$inv->client_name = "TOKO SEMBAKO (BUATAN ADMIN WEB 8000)";
$inv->amount = 350000;
$inv->paid_amount = 0;
$inv->status = "unpaid";
$inv->date = now()->toDateString();
$inv->description = "Simulasi Tes Kode Invoice INV-";
$inv->items = json_encode([["nama" => "Cetak Buku", "jumlah" => 1, "harga" => 350000]]);
$inv->save();
echo "SUKSES MEMBUAT INVOICE: " . $inv->kodeinvoice . "
";

