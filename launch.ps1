$BackendDir = "backend"
$FrontendDir = "frontend"

if (Test-Path $BackendDir) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $BackendDir; uv sync; .\.venv\Scripts\activate; python main.py"
}
else {
    Write-Warning "Backend directory '$BackendDir' not found. Skipping."
}

if (Test-Path $FrontendDir) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $FrontendDir; bun i; bun run dev"
}
else {
    Write-Warning "Frontend directory '$FrontendDir' not found. Skipping."
}