$ErrorActionPreference = "Stop"

$root = "C:\Dasieloski\Habaluna\HABANALUNA-master\HABANALUNA-master\frontend"
$pay = Join-Path $root "public\payments"
$flags = Join-Path $root "public\flags"

New-Item -ItemType Directory -Force -Path $pay | Out-Null
New-Item -ItemType Directory -Force -Path $flags | Out-Null

$items = @(
  @{ Url = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/visa.svg"; Out = (Join-Path $pay "visa.svg") },
  @{ Url = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/mastercard.svg"; Out = (Join-Path $pay "mastercard.svg") },
  @{ Url = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/paypal.svg"; Out = (Join-Path $pay "paypal.svg") },
  @{ Url = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/applepay.svg"; Out = (Join-Path $pay "applepay.svg") },
  @{ Url = "https://flagcdn.com/w40/cu.png"; Out = (Join-Path $flags "cuba.png") }
)

foreach ($it in $items) {
  Write-Host ("Downloading " + $it.Url)
  Invoke-WebRequest -Uri $it.Url -OutFile $it.Out -UseBasicParsing
}

Write-Host "Done."

