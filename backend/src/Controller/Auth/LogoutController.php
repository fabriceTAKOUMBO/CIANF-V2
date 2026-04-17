<?php

namespace App\Controller\Auth;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class LogoutController extends AbstractController
{
    public function __construct(
        private readonly Security $security,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    #[Route('/api/auth/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->security->getUser();

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Invalider le refresh token depuis le corps de la requête
        $data = json_decode($request->getContent(), true);
        $refreshToken = $data['refresh_token'] ?? null;

        if ($refreshToken) {
            // Chercher et supprimer le refresh token en BDD via le repository du bundle
            $refreshTokenRepository = $this->entityManager->getRepository(
                \Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken::class
            );
            $token = $refreshTokenRepository->findOneBy(['refreshToken' => $refreshToken]);
            if ($token) {
                $this->entityManager->remove($token);
                $this->entityManager->flush();
            }
        }

        return $this->json(['message' => 'Déconnexion réussie.'], Response::HTTP_OK);
    }
}
