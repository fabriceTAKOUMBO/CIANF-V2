<?php

namespace App\Controller\User;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Uid\Uuid;

#[IsGranted('ROLE_USER')]
class UserDeleteController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {}

    #[Route('/api/users/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    public function __invoke(string $id): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->security->getUser();

        if (!$currentUser) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier que l'utilisateur supprime son propre compte
        try {
            $uuid = Uuid::fromString($id);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['message' => 'Identifiant invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if ($currentUser->getId()->toRfc4122() !== $uuid->toRfc4122()) {
            return $this->json([
                'message' => 'Vous ne pouvez supprimer que votre propre compte.',
            ], Response::HTTP_FORBIDDEN);
        }

        $user = $this->userRepository->find($uuid);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        // Invalider les refresh tokens en BDD
        try {
            $refreshTokenRepository = $this->entityManager->getRepository(
                \Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken::class
            );
            $refreshTokens = $refreshTokenRepository->findBy(['username' => $user->getUserIdentifier()]);
            foreach ($refreshTokens as $token) {
                $this->entityManager->remove($token);
            }
        } catch (\Exception $e) {
            // Si le bundle n'est pas configuré, on ignore
        }

        // Supprimer l'utilisateur (RGPD - droit à l'oubli)
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Votre compte a été supprimé avec succès. Toutes vos données personnelles ont été effacées.',
        ], Response::HTTP_OK);
    }
}
