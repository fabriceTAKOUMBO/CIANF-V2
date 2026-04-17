<?php

namespace App\Controller\Auth;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegisterController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly UserRepository $userRepository,
        private readonly LoggerInterface $logger,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('/api/auth/register', name: 'api_auth_register', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['message' => 'Données JSON invalides.'], Response::HTTP_BAD_REQUEST);
        }

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $firstName = trim($data['firstName'] ?? '');
        $lastName = trim($data['lastName'] ?? '');

        // Validation basique
        if (empty($email) || empty($password) || empty($firstName) || empty($lastName)) {
            return $this->json([
                'message' => 'Les champs email, password, firstName et lastName sont obligatoires.',
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($password) < 8) {
            return $this->json([
                'message' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'email est déjà utilisé
        $existingUser = $this->userRepository->findOneByEmail($email);
        if ($existingUser) {
            return $this->json([
                'message' => 'Un compte avec cette adresse email existe déjà.',
            ], Response::HTTP_CONFLICT);
        }

        // Créer le nouvel utilisateur
        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);

        // Hasher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        // Générer le token de vérification email
        $verificationToken = Uuid::v4()->toRfc4122();
        $user->setEmailVerificationToken($verificationToken);

        // Persister en BDD
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Simuler l'envoi d'email (logger)
        $this->logger->info('Email de vérification envoyé', [
            'to' => $email,
            'verification_link' => sprintf('http://localhost:8000/api/auth/verify-email/%s', $verificationToken),
        ]);

        return $this->json([
            'message' => 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
            'userId' => $user->getId()->toRfc4122(),
        ], Response::HTTP_CREATED);
    }
}
