<?php

namespace App\Controller\Auth;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

class ForgotPasswordController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
    ) {}

    #[Route('/api/auth/forgot-password', name: 'api_auth_forgot_password', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = trim($data['email'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'message' => 'Veuillez fournir une adresse email valide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Toujours retourner 200 pour ne pas révéler si l'email existe
        $user = $this->userRepository->findOneByEmail($email);

        if ($user) {
            // Générer le token de réinitialisation
            $resetToken = Uuid::v4()->toRfc4122();
            $expiresAt = new \DateTimeImmutable('+1 hour');

            $user->setPasswordResetToken($resetToken);
            $user->setPasswordResetTokenExpiresAt($expiresAt);

            $this->entityManager->flush();

            // Simuler l'envoi d'email (logger)
            $this->logger->info('Email de réinitialisation de mot de passe envoyé', [
                'to' => $email,
                'reset_link' => sprintf('http://localhost:3000/reset-password?token=%s', $resetToken),
                'expires_at' => $expiresAt->format(\DateTimeInterface::ATOM),
            ]);
        }

        return $this->json([
            'message' => 'Si un compte correspond à cette adresse email, un lien de réinitialisation a été envoyé.',
        ], Response::HTTP_OK);
    }
}
