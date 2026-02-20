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
    
    Write-Host "Re-Syncing $lastRow rows with safety mode..."
    
    for ($r = 4; $r -le $lastRow; $r++) {
        $sku = $ws.Cells.Item($r, 1).Value2
        if (!$sku) { continue }
        
        $judul = [string]$ws.Cells.Item($r, 2).Value2
        $penulis = [string]$ws.Cells.Item($r, 3).Value2
        $isbn = [string]$ws.Cells.Item($r, 4).Value2
        $tahun = [string]$ws.Cells.Item($r, 5).Value2
        $penerbit = [string]$ws.Cells.Item($r, 6).Value2
        $kategori = [string]$ws.Cells.Item($r, 7).Value2
        $hargaRaw = [string]$ws.Cells.Item($r, 15).Text -replace '[^\d]', ''
        if ($hargaRaw -eq "") { $harga = 0 } else { $harga = [decimal]$hargaRaw }

        # SQL File approach to handle special characters better
        $sql = "INSERT INTO products (sku, judul, penulis, isbn, tahun, penerbit, kategori, harga) VALUES ($r, '$($judul.Replace("'","''"))', '$($penulis.Replace("'","''"))', '$isbn', '$tahun', '$($penerbit.Replace("'","''"))', '$kategori', $harga) ON CONFLICT (sku) DO UPDATE SET judul = EXCLUDED.judul, harga = EXCLUDED.harga;"
        
        $tempSqlFile = "e:\THOLIB\Projek\Rizkuna\tmp_insert.sql"
        $sql | Out-File -FilePath $tempSqlFile -Encoding utf8
        
        # Copy to container and execute
        docker cp $tempSqlFile "${containerName}:/tmp/insert.sql" | Out-Null
        docker exec -i $containerName psql -U $dbUser -d $dbName -f /tmp/insert.sql | Out-Null
        
        if ($r % 20 -eq 0) { Write-Host "Success: $r rows migrated..." }
    }
    Write-Host "FINAL SYNC COMPLETED!"
}
finally {
    if ($wb) { $wb.Close($false) }
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
