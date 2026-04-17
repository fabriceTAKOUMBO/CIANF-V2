# Script d'installation du module Auth - CINAF v2
# Exécuter depuis le dossier backend/ avec PowerShell :
#   cd "C:\Users\Admin\OneDrive\Documents\ISL 2023 - 2024\TFE 2026\CIANF-V2\backend"
#   .\setup-auth.ps1

$ErrorActionPreference = "Stop"
$backendDir = "C:\Users\Admin\OneDrive\Documents\ISL 2023 - 2024\TFE 2026\CIANF-V2\backend"
Set-Location $backendDir

Write-Host "=== CINAF v2 - Installation du module Authentification ===" -ForegroundColor Cyan

# 1. Installer les packages
Write-Host "`n[1/6] Installation des packages Composer..." -ForegroundColor Yellow
composer require lexik/jwt-authentication-bundle --no-interaction
composer require gesdinet/jwt-refresh-token-bundle --no-interaction

# Vérifier symfony/mailer
$mailerInstalled = composer show symfony/mailer 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation de symfony/mailer..." -ForegroundColor Yellow
    composer require symfony/mailer --no-interaction
}

# 2. Générer les clés JWT
Write-Host "`n[2/6] Génération des clés JWT..." -ForegroundColor Yellow
php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction

# 3. Vider le cache
Write-Host "`n[3/6] Vidage du cache..." -ForegroundColor Yellow
php bin/console cache:clear

# 4. Créer la migration
Write-Host "`n[4/6] Création de la migration..." -ForegroundColor Yellow
php bin/console make:migration

# 5. Appliquer la migration
Write-Host "`n[5/6] Application de la migration..." -ForegroundColor Yellow
php bin/console doctrine:migrations:migrate --no-interaction

# 6. Lancer le serveur et tester
Write-Host "`n[6/6] Démarrage du serveur Symfony..." -ForegroundColor Yellow
symfony server:start -d

Start-Sleep -Seconds 3

Write-Host "`n=== Tests des endpoints ===" -ForegroundColor Cyan

# Test Register
Write-Host "`n[TEST] POST /api/auth/register" -ForegroundColor Green
$registerBody = '{"email":"test@cinaf.tv","password":"Test1234!","firstName":"Test","lastName":"User"}'
$registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody
Write-Host "Réponse: $($registerResponse | ConvertTo-Json)"

# Test Login
Write-Host "`n[TEST] POST /api/auth/login" -ForegroundColor Green
$loginBody = '{"email":"test@cinaf.tv","password":"Test1234!"}'
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    Write-Host "Réponse: $($loginResponse | ConvertTo-Json)"
    $token = $loginResponse.token
    $userId = $loginResponse.user.id

    # Test Profil
    if ($token -and $userId) {
        Write-Host "`n[TEST] GET /api/users/$userId" -ForegroundColor Green
        $profileResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/users/$userId" `
            -Method GET `
            -Headers @{ Authorization = "Bearer $token" }
        Write-Host "Réponse: $($profileResponse | ConvertTo-Json)"
    }
} catch {
    Write-Host "Erreur login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Installation et tests terminés ! ===" -ForegroundColor Cyan
Write-Host "Arrêter le serveur avec : symfony server:stop" -ForegroundColor Gray
