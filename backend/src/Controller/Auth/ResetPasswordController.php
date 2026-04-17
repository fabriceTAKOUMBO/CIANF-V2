<?php

namespace App\Controller\Auth;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class ResetPasswordController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {}

    #[Route('/api/auth/reset-password', name: 'api_auth_reset_password', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = trim($data['token'] ?? '');
        $newPassword = $data['password'] ?? '';

        if (empty($token) || empty($newPassword)) {
            return $this->json([
                'message' => 'Le token et le nouveau mot de passe sont obligatoires.',
            ], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 8) {
            return $this->json([
                'message' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findOneByPasswordResetToken($token);

        if (!$user) {
            return $this->json([
                'message' => 'Token invalide ou expiré.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que le token n'est pas expiré
        $expiresAt = $user->getPasswordResetTokenExpiresAt();
        if (!$expiresAt || $expiresAt < new \DateTimeImmutable()) {
            return $this->json([
                'message' => 'Token invalide ou expiré.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Hasher et mettre à jour le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        // Invalider le token de réinitialisation
        $user->setPasswordResetToken(null);
        $user->setPasswordResetTokenExpiresAt(null);

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ], Response::HTTP_OK);
    }
}
