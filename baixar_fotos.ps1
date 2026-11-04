$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlFile = Join-Path $root 'index.html'
$html = [System.IO.File]::ReadAllText($htmlFile, [System.Text.Encoding]::UTF8)
$targets = @(
  @{ File = 'banho-servico-real.jpg'; Url = 'https://images.pexels.com/photos/19145883/pexels-photo-19145883.jpeg?auto=compress&cs=tinysrgb&w=1280&q=82' },
  @{ File = 'consulta-servico-real.jpg'; Url = 'https://images.pexels.com/photos/6235120/pexels-photo-6235120.jpeg?auto=compress&cs=tinysrgb&w=1280&q=82' },
  @{ File = 'produtos-servico-real.jpg'; Url = 'https://images.pexels.com/photos/796584/pexels-photo-796584.jpeg?auto=compress&cs=tinysrgb&w=1280&q=82' },
  @{ File = 'galeria-banho-real.jpg'; Url = 'https://images.pexels.com/photos/19145881/pexels-photo-19145881.jpeg?auto=compress&cs=tinysrgb&w=1600&q=82' },
  @{ File = 'galeria-tosa-real.jpg'; Url = 'https://images.pexels.com/photos/19145898/pexels-photo-19145898.jpeg?auto=compress&cs=tinysrgb&w=1600&q=82' },
  @{ File = 'galeria-vet-real.jpg'; Url = 'https://images.pexels.com/photos/6235230/pexels-photo-6235230.jpeg?auto=compress&cs=tinysrgb&w=1600&q=82' },
  @{ File = 'galeria-produtos-real.jpg'; Url = 'https://images.pexels.com/photos/23692911/pexels-photo-23692911.jpeg?auto=compress&cs=tinysrgb&w=1600&q=82' }
)
$failures = 0
foreach ($target in $targets) {
  $destination = Join-Path $root ('assets\' + $target.File)
  try {
    Invoke-WebRequest -Uri $target.Url -OutFile $destination -UseBasicParsing
    if ((Get-Item $destination).Length -lt 20000) { throw "Arquivo incompleto" }
    $local = 'assets/' + $target.File
    $html = $html.Replace($target.Url, $local)
    Write-Host ("OK: " + $target.File) -ForegroundColor Green
  } catch {
    $failures++
    Write-Host ("Falhou: " + $target.File + " - " + $_.Exception.Message) -ForegroundColor Yellow
  }
}
[System.IO.File]::WriteAllText($htmlFile, $html, (New-Object System.Text.UTF8Encoding($false)))
if ($failures -eq 0) { Write-Host "Fotos baixadas! O site agora utiliza arquivos locais." -ForegroundColor Green }
else { Write-Host "Algumas fotos nao foram baixadas; as nao baixadas continuam com URL online." -ForegroundColor Yellow }
