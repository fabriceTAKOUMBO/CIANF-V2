<?php

namespace App\Controller\Auth;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Ce controller n'est jamais atteint en pratique.
 * La route /api/auth/login est interceptée par le firewall Symfony (json_login)
 * qui délègue à LexikJWTAuthenticationBundle pour générer le token.
 */
#[Route('/api/auth/login', name: 'api_auth_login_fallback', methods: ['POST'])]
class LoginController
{
    public function __invoke(): JsonResponse
    {
        // Ce code ne devrait jamais être atteint.
        // Si c'est le cas, le firewall json_login n'est pas correctement configuré.
        return new JsonResponse(['error' => 'Authentication error'], 500);
    }
}
