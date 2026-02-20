$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wb = $excel.Workbooks.Open("e:\THOLIB\Projek\Rizkuna\Katalog Rizquna.xlsx")
    $ws = $wb.Sheets.Item(1)
    $lastCol = $ws.UsedRange.Columns.Count
    $rowData = @()
    for ($c = 1; $c -le $lastCol; $c++) {
        $rowData += $ws.Cells.Item(3, $c).Text
    }
    Write-Host "Headers: $($rowData -join ' | ')"
}
finally {
    if ($wb) { $wb.Close($false) }
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
