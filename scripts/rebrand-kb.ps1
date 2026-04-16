$kbPath = "C:\Users\fnass\TechSupport-AI\knowledge-bases"

Get-ChildItem -Path $kbPath -Recurse -Filter *.md | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'CareerPilot AI', 'Dlyn AI'
    $newContent = $newContent -replace 'CareerPilot', 'Dlyn'
    $newContent = $newContent -replace 'careerpilot', 'dlyn'
    Set-Content -Path $_.FullName -Value $newContent -NoNewline
    Write-Host "Updated: $($_.Name)"
}

Write-Host "Done!"
