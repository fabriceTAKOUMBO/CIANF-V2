<?php

namespace App\Controller\User;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Uid\Uuid;

#[IsGranted('ROLE_USER')]
class UserExportController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly Security $security,
    ) {}

    #[Route('/api/users/{id}/export', name: 'api_users_export', methods: ['GET'])]
    public function __invoke(string $id): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->security->getUser();

        if (!$currentUser) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier que l'utilisateur demande ses propres données
        try {
            $uuid = Uuid::fromString($id);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['message' => 'Identifiant invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if ($currentUser->getId()->toRfc4122() !== $uuid->toRfc4122()) {
            return $this->json([
                'message' => 'Vous ne pouvez exporter que vos propres données.',
            ], Response::HTTP_FORBIDDEN);
        }

        $user = $this->userRepository->find($uuid);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        // Données RGPD - portabilité
        $exportData = [
            'id' => $user->getId()->toRfc4122(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'roles' => $user->getRoles(),
            'isVerified' => $user->isVerified(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'updatedAt' => $user->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'exportedAt' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ];

        return $this->json($exportData, Response::HTTP_OK, [
            'Content-Disposition' => sprintf('attachment; filename="user-data-%s.json"', $id),
        ]);
    }
}
