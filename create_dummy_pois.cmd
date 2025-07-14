 
$apiUrl = "http://localhost:5000/api/pois"

# POI data within South Africa bounds (Lat: -22° to -35°, Long: 16° to 33°)
$pois = @(
    @{ name = "Table Mountain"; category = "Tourist Attraction"; lat = -33.9628; long = 18.4098 },
    @{ name = "Kruger National Park"; category = "National Park"; lat = -24.9964; long = 31.5881 },
    @{ name = "Gold Reef City"; category = "Theme Park"; lat = -26.2381; long = 27.8546 },
    @{ name = "V&A Waterfront"; category = "Shopping Mall"; lat = -33.9026; long = 18.4197 },
    @{ name = "Durban Beach"; category = "Beach"; lat = -29.8587; long = 31.0218 },
    @{ name = "Blyde River Canyon"; category = "Natural Wonder"; lat = -24.6461; long = 30.7918 },
    @{ name = "Robben Island"; category = "Historical Site"; lat = -33.8070; long = 18.3703 },
    @{ name = "Sun City Resort"; category = "Resort"; lat = -25.3408; long = 27.0917 },
    @{ name = "Kirstenbosch Gardens"; category = "Botanical Garden"; lat = -33.9883; long = 18.4319 },
    @{ name = "Drakensberg Mountains"; category = "Mountain Range"; lat = -28.7486; long = 29.2623 }
)

foreach ($poi in $pois) {
    $json = $poi | ConvertTo-Json -Compress
    Write-Host "Creating POI: $($poi.name)"
    
    try {
        $response = Invoke-WebRequest -Uri $apiUrl -Method POST -ContentType "application/json" -Body $json
        Write-Host "✓ Created successfully (Status: $($response.StatusCode))"
    }
    catch {
        Write-Host "✗ Failed to create: $($_.Exception.Message)"
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "Done creating POIs!"