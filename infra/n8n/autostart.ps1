$logFile = "e:\THOLIB\Projek\Rizkuna\autostart.log"
function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $message" | Out-File -FilePath $logFile -Append
}

Write-Log "Starting Rizquna Auto-Start Sequence..."

# Wait for Docker to be ready
$maxRetries = 30
$retryCount = 0
$dockerReady = $false

while (-not $dockerReady -and $retryCount -lt $maxRetries) {
    try {
        docker ps > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Log "Docker Engine is ready."
        }
        else {
            throw "Docker not ready"
        }
    }
    catch {
        $retryCount++
        Write-Log "Waiting for Docker Engine (Retry $retryCount/$maxRetries)..."
        Start-Sleep -Seconds 10
    }
}

if ($dockerReady) {
    Write-Log "Starting containers via Docker Compose..."
    Set-Location "e:\THOLIB\Projek\Rizkuna"
    docker-compose up -d 2>&1 | Out-File -FilePath $logFile -Append
    Write-Log "Auto-start sequence completed."
}
else {
    Write-Log "CRITICAL: Docker Engine failed to start within timeout."
}
