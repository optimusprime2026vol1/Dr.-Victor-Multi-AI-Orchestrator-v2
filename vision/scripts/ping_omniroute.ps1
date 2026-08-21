# Vision — ping OmniRoute Super Hero (run on your PC while omniroute is up)
$base = "http://localhost:20128"
Write-Host "Vision → OmniRoute Super Hero check..." -ForegroundColor Cyan
try {
  $h = Invoke-WebRequest -Uri "$base/api/monitoring/health" -Method Get -TimeoutSec 15
  Write-Host "Health: $($h.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Health failed: $_" -ForegroundColor Red
  Write-Host "Start server: omniroute --log" -ForegroundColor Yellow
  exit 1
}
try {
  $m = Invoke-RestMethod -Uri "$base/v1/models" -Method Get -TimeoutSec 30
  $n = @($m.data).Count
  Write-Host "Models visible: $n" -ForegroundColor Green
  if ($n -eq 0) {
    Write-Host "Connect Providers in dashboard (Gemini/DeepSeek/free)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Models failed (login/key may be required): $_" -ForegroundColor Yellow
}
Write-Host "Dashboard: $base" -ForegroundColor Cyan
Write-Host "API base for Vision: $base/v1" -ForegroundColor Cyan
