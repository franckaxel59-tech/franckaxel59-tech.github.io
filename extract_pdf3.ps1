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

$pos = 0
$streamNum = 0

while ($pos -lt $pdf.Length - 20) {
    $sPos = FindBytes $pdf $pos $streamMarker
    if ($sPos -eq -1) { break }
    
    $dataStart = $sPos + 7  # after "stream\n"
    
    # Find endstream
    $ePos = FindBytes $pdf $dataStart @(101, 110, 100, 115, 116, 114, 101, 97, 109)
    if ($ePos -eq -1) { $pos = $dataStart; continue }
    
    $dataEnd = $ePos
    if ($dataEnd -gt 0 -and $pdf[$dataEnd-1] -eq 13) { $dataEnd-- }
    if ($dataEnd -gt 0 -and $pdf[$dataEnd-1] -eq 10) { $dataEnd-- }
    
    if ($dataEnd -gt $dataStart + 2) {
        $streamData = $pdf[$dataStart..($dataEnd-1)]
        $streamNum++
        
        # Try zlib: skip first 2 bytes (zlib header) then deflate
        if ($streamData.Length -gt 2) {
            $deflateData = $streamData[2..($streamData.Length-1)]
            try {
                $ms = New-Object System.IO.MemoryStream(,$deflateData)
                $ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
                $outMs = New-Object System.IO.MemoryStream
                $ds.CopyTo($outMs)
                $decompressed = $outMs.ToArray()
                
                if ($decompressed.Length -gt 20) {
                    $text = [System.Text.Encoding]::UTF8.GetString($decompressed)
                    # Check for readable content
                    if ($text -match '[A-Za-zÀ-ÿ]{4,}') {
                        Write-Host "=== Stream $streamNum at pos $sPos, decompressed size $($decompressed.Length) ==="
                        # Extract Tj text operators
                        $tjMatches = [regex]::Matches($text, '\(([^\)]{1,150})\)\s*Tj')
                        if ($tjMatches.Count -gt 0) {
                            Write-Host "Tj strings:"
                            $tjMatches | ForEach-Object { Write-Host "  >> $($_.Groups[1].Value)" }
                        } else {
                            # Just show readable text
                            $readable = [regex]::Matches($text, '[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-,.:/''()0-9]{5,}')
                            $readable | Select-Object -First 30 | ForEach-Object { 
                                $v = $_.Value.Trim()
                                if ($v.Length -gt 5) { Write-Host "  $v" }
                            }
                        }
                    }
                }
            } catch { }
        }
    }
    
    $pos = $ePos + 9
    if ($streamNum -ge 20) { break }
}

Write-Host "`nTotal streams processed: $streamNum"
