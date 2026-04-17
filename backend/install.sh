#!/bin/bash
# Script d'installation du module Auth - CINAF v2
# Exécuter depuis le dossier backend/

set -e

echo "=== Installation des packages Composer ==="
composer require lexik/jwt-authentication-bundle --no-interaction
composer require gesdinet/jwt-refresh-token-bundle --no-interaction
composer require symfony/uid --no-interaction

# Vérifier si symfony/mailer est déjà installé
if ! composer show symfony/mailer 2>/dev/null; then
    composer require symfony/mailer --no-interaction
fi

echo "=== Génération des clés JWT ==="
php bin/console lexik:jwt:generate-keypair --overwrite

echo "=== Vider le cache ==="
php bin/console cache:clear

echo "=== Génération des migrations ==="
php bin/console make:migration

echo "=== Application des migrations ==="
php bin/console doctrine:migrations:migrate --no-interaction

echo "=== Installation terminée ! ==="
echo ""
echo "Pour lancer le serveur :"
echo "  symfony server:start -d"
echo ""
echo "Pour tester l'inscription :"
echo "  curl -X POST http://localhost:8000/api/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@cinaf.tv\",\"password\":\"Test1234!\",\"firstName\":\"Test\",\"lastName\":\"User\"}'"
