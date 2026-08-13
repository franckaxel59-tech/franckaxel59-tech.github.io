Add-Type -AssemblyName System.IO.Compression

$pdfPath = "CV_Axel_KOUAME_Alt.pdf"
$pdf = [System.IO.File]::ReadAllBytes($pdfPath)

Write-Host "PDF size: $($pdf.Length) bytes"

# Try to find stream markers and decompress them
$streamStart = [System.Text.Encoding]::ASCII.GetBytes("stream`r`n")
$streamEnd = [System.Text.Encoding]::ASCII.GetBytes("`r`nendstream")

$allText = ""
$pos = 0
$streamCount = 0

while ($pos -lt $pdf.Length - 20) {
    # Find "stream\r\n"
    $found = $false
    for ($i = $pos; $i -lt [Math]::Min($pos + 100000, $pdf.Length - 8); $i++) {
        if ($pdf[$i] -eq 115 -and $pdf[$i+1] -eq 116 -and $pdf[$i+2] -eq 114 -and $pdf[$i+3] -eq 101 -and $pdf[$i+4] -eq 97 -and $pdf[$i+5] -eq 109 -and $pdf[$i+6] -eq 13 -and $pdf[$i+7] -eq 10) {
            # Found "stream\r\n"
            $streamDataStart = $i + 8
            
            # Find endstream
            $endPos = -1
            for ($j = $streamDataStart; $j -lt [Math]::Min($streamDataStart + 500000, $pdf.Length - 11); $j++) {
                if ($pdf[$j] -eq 13 -and $pdf[$j+1] -eq 10 -and $pdf[$j+2] -eq 101 -and $pdf[$j+3] -eq 110 -and $pdf[$j+4] -eq 100 -and $pdf[$j+5] -eq 115 -and $pdf[$j+6] -eq 116 -and $pdf[$j+7] -eq 114 -and $pdf[$j+8] -eq 101 -and $pdf[$j+9] -eq 97 -and $pdf[$j+10] -eq 109) {
                    $endPos = $j
                    break
                }
            }
            
            if ($endPos -gt $streamDataStart) {
                $streamData = $pdf[$streamDataStart..($endPos-1)]
                $streamCount++
                
                # Try deflate decompression
                try {
                    $ms = New-Object System.IO.MemoryStream(,$streamData)
                    $ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
                    $outMs = New-Object System.IO.MemoryStream
                    $ds.CopyTo($outMs)
                    $decompressed = $outMs.ToArray()
                    $text = [System.Text.Encoding]::UTF8.GetString($decompressed)
                    
                    if ($text -match '[a-zA-ZÀ-ÿ]{5,}') {
                        Write-Host "=== Stream $streamCount (decompressed) ==="
                        # Extract readable strings
                        $readable = [regex]::Matches($text, '[a-zA-ZÀ-ÿ\s,.\-:/()\'']{8,}')
                        foreach ($r in $readable | Select-Object -First 30) {
                            $val = $r.Value.Trim()
                            if ($val.Length -gt 5) {
                                Write-Host $val
                            }
                        }
                    }
                } catch {
                    # Try as raw UTF-16
                    try {
                        $text = [System.Text.Encoding]::Unicode.GetString($streamData)
                        if ($text -match '[a-zA-Z]{5,}') {
                            Write-Host "=== Stream $streamCount (unicode) ==="
                            $readable = [regex]::Matches($text, '[a-zA-ZÀ-ÿ\s,.\-:/()\'']{8,}')
                            foreach ($r in $readable | Select-Object -First 20) {
                                $val = $r.Value.Trim()
                                if ($val.Length -gt 5) { Write-Host $val }
                            }
                        }
                    } catch {}
                }
                
                $pos = $endPos + 11
                $found = $true
                break
            }
        }
    }
    
    if (-not $found) {
        $pos += 50000
    }
    
    if ($streamCount -ge 30) { break }
}

Write-Host "Total streams found: $streamCount"
