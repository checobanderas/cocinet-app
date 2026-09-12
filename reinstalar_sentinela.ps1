# PowerShell Helper para Reinstalación Limpia de COCINET Print Sentinel
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🚀 REINSTALADOR AUTOMÁTICO DE COCINET PRINT SENTINEL" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Detener procesos residuales
Write-Host "⏳ [1/4] Cerrando procesos de pythonservice y Python residuales..." -ForegroundColor Gray
taskkill /F /IM pythonservice.exe 2>$null
taskkill /F /IM mmc.exe 2>$null

# 2. Instalar dependencias requeridas (incluyendo flask-sock y simple-websocket)
Write-Host "⏳ [2/4] Verificando e instalando paquetes de Python (flask-sock, pywin32, etc.)..." -ForegroundColor Gray
python -m pip install --upgrade pywin32 Flask flask-cors flask-sock simple-websocket pillow

# 3. Ejecutar el instalador interactivo
Write-Host "⏳ [3/4] Lanzando instalador interactivo..." -ForegroundColor Green
$scriptPath = Join-Path $PSScriptRoot "instalador_sentinela.py"
if (-not (Test-Path $scriptPath)) {
    $scriptPath = "public\Cocinet_Windows_App\instalador_sentinela.py"
}

python $scriptPath
