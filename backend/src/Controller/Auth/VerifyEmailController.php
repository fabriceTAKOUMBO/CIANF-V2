<?php

namespace App\Controller\Auth;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class VerifyEmailController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    #[Route('/api/auth/verify-email/{token}', name: 'api_auth_verify_email', methods: ['GET'])]
    public function __invoke(string $token): JsonResponse
    {
        if (empty($token)) {
            return $this->json(['message' => 'Token invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findOneByEmailVerificationToken($token);

        if (!$user) {
            return $this->json([
                'message' => 'Token de vérification invalide ou déjà utilisé.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Activer le compte
        $user->setIsVerified(true);
        $user->setEmailVerificationToken(null);

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Adresse email vérifiée avec succès. Votre compte est maintenant actif.',
        ], Response::HTTP_OK);
    }
}
