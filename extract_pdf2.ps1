Add-Type -AssemblyName System.IO.Compression

$pdf = [System.IO.File]::ReadAllBytes("CV_Axel_KOUAME_Alt.pdf")

function FindBytes($data, $start, $pattern) {
    for ($i = $start; $i -le $data.Length - $pattern.Length; $i++) {
        $match = $true
        for ($j = 0; $j -lt $pattern.Length; $j++) {
            if ($data[$i+$j] -ne $pattern[$j]) { $match = $false; break }
        }
        if ($match) { return $i }
    }
    return -1
}

$streamMarker = @(115, 116, 114, 101, 97, 109, 10)  # "stream\n"
$endMarker = @(101, 110, 100, 115, 116, 114, 101, 97, 109)  # "endstream"

$allReadable = @()
$pos = 0
$streamNum = 0

while ($pos -lt $pdf.Length - 20) {
    $sPos = FindBytes $pdf $pos $streamMarker
    if ($sPos -eq -1) { break }
    
    $dataStart = $sPos + 7  # after "stream\n"
    
    # Find endstream
    $ePos = FindBytes $pdf $dataStart @(101, 110, 100, 115, 116, 114, 101, 97, 109)
    if ($ePos -eq -1) { $pos = $dataStart; continue }
    
    # Account for possible \r before endstream
    $dataEnd = $ePos
    if ($dataEnd -gt 0 -and $pdf[$dataEnd-1] -eq 13) { $dataEnd-- }
    if ($dataEnd -gt 0 -and $pdf[$dataEnd-1] -eq 10) { $dataEnd-- }
    
    $streamData = $pdf[$dataStart..($dataEnd-1)]
    $streamNum++
    
    # Try deflate
    try {
        $ms = New-Object System.IO.MemoryStream(,$streamData)
        $ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
        $outMs = New-Object System.IO.MemoryStream
        $ds.CopyTo($outMs)
        $decompressed = $outMs.ToArray()
        
        # Try UTF-8 first
        $text = [System.Text.Encoding]::UTF8.GetString($decompressed)
        
        if ($text.Length -gt 10) {
            $readable = [regex]::Matches($text, '([A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ\s\-,.:/()\''0-9]{6,})')
            $vals = ($readable | ForEach-Object { $_.Value.Trim() } | Where-Object { $_ -match '[aeiouAEIOUàâéèêëîïôùûü]' -and $_.Length -gt 5 })
            if ($vals.Count -gt 0) {
                Write-Host "=== Stream $streamNum at pos $sPos ==="
                $vals | Select-Object -First 50 | ForEach-Object { Write-Host $_ }
            }
        }
    } catch {
        # silent
    }
    
    # Try UTF-16 LE
    try {
        $ms2 = New-Object System.IO.MemoryStream(,$streamData)
        $ds2 = New-Object System.IO.Compression.DeflateStream($ms2, [System.IO.Compression.CompressionMode]::Decompress)
        $outMs2 = New-Object System.IO.MemoryStream
        $ds2.CopyTo($outMs2)
        $decompressed2 = $outMs2.ToArray()
        $text2 = [System.Text.Encoding]::Unicode.GetString($decompressed2)
        
        if ($text2 -match '[A-Za-z]{5,}') {
            $readable2 = [regex]::Matches($text2, '([A-Za-zÀ-ÿ][a-zA-ZÀ-ÿ\s\-,.:/()\''0-9]{6,})')
            $vals2 = ($readable2 | ForEach-Object { $_.Value.Trim() } | Where-Object { $_ -match '[aeiouAEIOU]' -and $_.Length -gt 5 })
            if ($vals2.Count -gt 0) {
                Write-Host "=== Stream $streamNum (UTF16) at pos $sPos ==="
                $vals2 | Select-Object -First 50 | ForEach-Object { Write-Host $_ }
            }
        }
    } catch {}
    
    $pos = $ePos + 9
    if ($streamNum -ge 15) { break }
}

Write-Host "`nProcessed $streamNum streams"
