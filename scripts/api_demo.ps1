# API demo script for PowerShell (Windows PowerShell / PowerShell Core)
# Uses Invoke-RestMethod; no external dependencies.
param(
    [string]$BaseUrl = 'http://127.0.0.1:8000'
)

# Start a transcript so runs are captured to a log file under scripts/
$scriptDir = Split-Path -Parent $PSCommandPath
$logFile = Join-Path $scriptDir 'api_demo_ps.log'
Start-Transcript -Path $logFile -Force
Write-Host "Logging to $logFile"

function Register-User($User,$Pass,$Email,$Role){
    Write-Host "--- Registering $User ---"
    $body = @{ username=$User; password=$Pass; email=$Email; role=$Role } | ConvertTo-Json
    try{
        $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/auth/register/" -Body $body -ContentType 'application/json'
        Write-Host "HTTP 200"
        $resp | ConvertTo-Json -Depth 5
    } catch [System.Net.WebException] {
        $res = $_.Exception.Response
        if($res -and $res.StatusCode -eq 400){
            Write-Host "HTTP 400 - user may already exist; treating as success."
        } else {
            throw
        }
    }
}

function Login($User,$Pass){
    Write-Host "--- Logging in $User ---"
    $body = @{ username=$User; password=$Pass } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/auth/login/" -Body $body -ContentType 'application/json'
    if(-not $resp.access){ throw "Login did not return access token" }
    return $resp.access
}

function Create-Service($Token,$Title,$Desc,$Category,$Price){
    Write-Host "--- Creating service: $Title ---"
    if(-not $Token){ throw "ERROR: empty token" }
    if(-not $Token.StartsWith('Bearer ')){ $auth = "Bearer $Token" } else { $auth = $Token }
    $headers = @{ Authorization = $auth }
    $body = @{ title=$Title; description=$Desc; category=$Category; price=$Price } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/services/" -Body $body -Headers $headers -ContentType 'application/json'
    $resp | ConvertTo-Json -Depth 5
}

function Create-Booking($Token,$ServiceId,$ClientId,$IsoDate){
    Write-Host "--- Creating booking ---"
    if(-not $Token){ throw "ERROR: empty token" }
    $auth = $Token.StartsWith('Bearer ') ? $Token : "Bearer $Token"
    $headers = @{ Authorization = $auth }
    $body = @{ service=$ServiceId; client=$ClientId; date=$IsoDate } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/bookings/" -Body $body -Headers $headers -ContentType 'application/json'
    $resp | ConvertTo-Json -Depth 5
}

function Set-Status($Token,$BookingId,$Status){
    Write-Host "--- Setting booking $BookingId status -> $Status ---"
    $auth = $Token.StartsWith('Bearer ') ? $Token : "Bearer $Token"
    $headers = @{ Authorization = $auth }
    $body = @{ status = $Status } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Put -Uri "$BaseUrl/api/bookings/$BookingId/status/" -Body $body -Headers $headers -ContentType 'application/json'
    $resp | ConvertTo-Json -Depth 5
}

function Post-Message($Token,$BookingId,$Text){
    Write-Host "--- Posting message for booking $BookingId ---"
    $auth = $Token.StartsWith('Bearer ') ? $Token : "Bearer $Token"
    $headers = @{ Authorization = $auth }
    $body = @{ text = $Text } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/bookings/$BookingId/messages/" -Body $body -Headers $headers -ContentType 'application/json'
    $resp | ConvertTo-Json -Depth 5
}

function List-Messages($Token,$BookingId){
    Write-Host "--- Listing messages for booking $BookingId ---"
    $auth = $Token.StartsWith('Bearer ') ? $Token : "Bearer $Token"
    $headers = @{ Authorization = $auth }
    $resp = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/bookings/$BookingId/messages/" -Headers $headers
    $resp | ConvertTo-Json -Depth 5
}

# Flow
Register-User -User 'maya' -Pass 'Pass123!@#' -Email 'maya@example.com' -Role 'creative'
Register-User -User 'chris' -Pass 'Pass123!@#' -Email 'chris@example.com' -Role 'client'

$mayaToken = Login -User 'maya' -Pass 'Pass123!@#'
if(-not $mayaToken){ throw 'Maya token empty' }
Write-Host "MAYA_TOKEN length: $($mayaToken.Length)"
if(($mayaToken -split '\.').Length -lt 3){ throw 'ERROR: token does not contain two dots' }

Create-Service -Token $mayaToken -Title 'Logo Design' -Desc 'Clean minimal logo' -Category 'design' -Price 199.00

$chrisToken = Login -User 'chris' -Pass 'Pass123!@#'
if(-not $chrisToken){ throw 'Chris token empty' }

Create-Booking -Token $chrisToken -ServiceId 1 -ClientId 2 -IsoDate '2030-01-01T10:00:00Z'

Set-Status -Token $mayaToken -BookingId 1 -Status 'approved'

Post-Message -Token $chrisToken -BookingId 1 -Text 'Looking forward to this!'

List-Messages -Token $chrisToken -BookingId 1

Write-Host '--- Demo complete ---'

# Stop transcript
Stop-Transcript
