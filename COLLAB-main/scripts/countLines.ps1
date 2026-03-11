$ErrorActionPreference = "SilentlyContinue"

$root = "E:\Desktop\COLLAB-main\collab-main"
$excludePattern = "\\node_modules\\|\\dist\\|\\build\\|\\coverage\\|\\.git\\|\\.vite\\|\\.next\\|\\out\\"

$files = Get-ChildItem $root -Recurse -File | Where-Object {
  $_.FullName -notmatch $excludePattern -and $_.Length -lt 5MB
}

$totalLines = 0
$byExt = @{}
$failures = @()

foreach ($f in $files) {
  try {
    $lineCount = (Get-Content -LiteralPath $f.FullName -ErrorAction Stop).Count
    $totalLines += $lineCount

    $ext = if ($f.Extension) { $f.Extension.ToLower() } else { "(noext)" }
    if (-not $byExt.ContainsKey($ext)) { $byExt[$ext] = @{ Lines = 0; Files = 0 } }
    $byExt[$ext].Lines += $lineCount
    $byExt[$ext].Files += 1
  } catch {
    $failures += [PSCustomObject]@{
      File = $f.FullName
      Error = $_.Exception.Message
    }
  }
}

$top = $byExt.GetEnumerator() |
  Sort-Object { $_.Value.Lines } -Descending |
  Select-Object -First 15 |
  ForEach-Object {
    [PSCustomObject]@{
      Ext   = $_.Key
      Files = $_.Value.Files
      Lines = $_.Value.Lines
    }
  }

Write-Host ("Root: " + $root)
Write-Host ("Total files counted: " + $files.Count)
Write-Host ("Total lines counted: " + $totalLines)
Write-Host ("Failed files: " + $failures.Count)
if ($failures.Count -gt 0) {
  Write-Host ""
  Write-Host "First failures:"
  $failures | Select-Object -First 5 | Format-Table -AutoSize
}
Write-Host ""
$top | Format-Table -AutoSize
