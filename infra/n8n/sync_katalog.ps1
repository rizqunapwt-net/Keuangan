$excelFile = "e:\THOLIB\Projek\Rizkuna\Katalog Rizquna.xlsx"
$dbUser = "rizquna"
$dbName = "n8n"
$containerName = "n8n-postgres"

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wb = $excel.Workbooks.Open($excelFile)
    $ws = $wb.Sheets.Item(1)
    $lastRow = $ws.UsedRange.Rows.Count
    
    Write-Host "Syncing $lastRow rows..."
    
    # Start from row 4 (data start)
    for ($r = 4; $r -le $lastRow; $r++) {
        $sku = $ws.Cells.Item($r, 1).Text.Trim()
        if ($sku -eq "") { continue }
        
        $judul = $ws.Cells.Item($r, 2).Text.Replace("'", "''").Trim()
        $penulis = $ws.Cells.Item($r, 3).Text.Replace("'", "''").Trim()
        $isbn = $ws.Cells.Item($r, 4).Text.Trim()
        $tahun = $ws.Cells.Item($r, 5).Text.Trim()
        $penerbit = $ws.Cells.Item($r, 6).Text.Replace("'", "''").Trim()
        $kategori = $ws.Cells.Item($r, 7).Text.Trim()
        $ukuran = $ws.Cells.Item($r, 8).Text.Trim()
        $hal = $ws.Cells.Item($r, 9).Text.Trim()
        $cetak = $ws.Cells.Item($r, 10).Text.Trim()
        $kertas = $ws.Cells.Item($r, 12).Text.Trim() # Skip collinear empty
        $finishing = $ws.Cells.Item($r, 14).Text.Trim()
        
        # Parse Price (clean digits only)
        $hargaRaw = $ws.Cells.Item($r, 15).Text -replace '[^\d]', ''
        if ($hargaRaw -eq "") { $harga = 0 } else { $harga = [decimal]$hargaRaw }

        $sql = "INSERT INTO products (sku, judul, penulis, isbn, tahun, penerbit, kategori, ukuran, hal, cetak, kertas, finishing, harga) VALUES ('$sku', '$judul', '$penulis', '$isbn', '$tahun', '$penerbit', '$kategori', '$ukuran', '$hal', '$cetak', '$kertas', '$finishing', $harga) ON CONFLICT (sku) DO UPDATE SET judul = EXCLUDED.judul, harga = EXCLUDED.harga, penulis = EXCLUDED.penulis;"
        
        # Run SQL via Docker exec
        $cmd = "docker exec -i $containerName psql -U $dbUser -d $dbName -c `"$sql`""
        Invoke-Expression $cmd | Out-Null
        
        if ($r % 50 -eq 0) { Write-Host "Processed $r rows..." }
    }
    Write-Host "Sync Completed!"
}
finally {
    if ($wb) { $wb.Close($false) }
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
