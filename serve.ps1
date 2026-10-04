# SpendWise - local development server (PowerShell)
#
# The app is built with ES modules, and browsers block modules from loading
# over the file:// protocol. This serves the folder over http instead.
#
# PowerShell ships with Windows, so nothing needs to be installed.
#
#   Run:      .\serve.ps1
#   Port:     .\serve.ps1 8080
#   Stop:     Ctrl+C
#
# If PowerShell blocks the script, allow it once with:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# then run .\serve.ps1 again.

param(
    [int]$Port = 5500
)

# Folder this script lives in. Every file is served from here.
$Root = $PSScriptRoot

# The browser only executes a module if it is sent as JavaScript.
# A wrong or missing content type makes the page fail silently, so this map matters.
$ContentTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".csv"  = "text/csv; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".gif"  = "image/gif"
    ".ico"  = "image/x-icon"
}

# Loopback only, so the folder is not exposed to your network.
$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")
$Listener.Start()

Write-Host ""
Write-Host "  SpendWise is running at http://localhost:$Port" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

while ($Listener.IsListening) {
    $Context = $Listener.GetContext()

    # Turn the request into a file path, e.g. / -> /index.html
    $Path = [Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath)
    if ($Path.EndsWith("/")) { $Path += "index.html" }

    # Keep requests inside this folder, so ../ cannot read other files.
    $Full = [IO.Path]::GetFullPath((Join-Path $Root $Path.TrimStart("/")))
    if (-not $Full.StartsWith([IO.Path]::GetFullPath($Root))) {
        $Context.Response.StatusCode = 403
        $Context.Response.Close()
        continue
    }

    if (-not (Test-Path -LiteralPath $Full -PathType Leaf)) {
        $Context.Response.StatusCode = 404
        $Context.Response.Close()
        continue
    }

    $Extension = [IO.Path]::GetExtension($Full).ToLower()
    $Context.Response.ContentType = $ContentTypes[$Extension]
    $Bytes = [IO.File]::ReadAllBytes($Full)
    $Context.Response.ContentLength64 = $Bytes.Length
    $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    $Context.Response.Close()
}