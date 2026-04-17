<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:load-test-users',
    description: 'Crée les 20 utilisateurs de test définis dans doc/testApp.md',
)]
class LoadTestUsersCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $usersData = [
            ['email' => 'superadmin@cianf.local', 'password' => 'password123', 'firstName' => 'Admin', 'lastName' => 'Principal', 'roles' => ['ROLE_SUPER_ADMIN'], 'verified' => true],
            ['email' => 'manager@cianf.local', 'password' => 'password123', 'firstName' => 'Content', 'lastName' => 'Manager', 'roles' => ['ROLE_MANAGER'], 'verified' => true],
            ['email' => 'moderateur@cianf.local', 'password' => 'password123', 'firstName' => 'Modérateur', 'lastName' => 'Sécurité', 'roles' => ['ROLE_MODERATOR'], 'verified' => true],
            ['email' => 'support@cianf.local', 'password' => 'password123', 'firstName' => 'Support', 'lastName' => 'Client', 'roles' => ['ROLE_SUPPORT'], 'verified' => true],
            ['email' => 'creator_pro@cianf.local', 'password' => 'password123', 'firstName' => 'Creator', 'lastName' => 'Pro', 'roles' => ['ROLE_CREATOR'], 'verified' => true],
            ['email' => 'creator_new@cianf.local', 'password' => 'password123', 'firstName' => 'Creator', 'lastName' => 'Novice', 'roles' => ['ROLE_CREATOR'], 'verified' => true],
            ['email' => 'premium1@cianf.local', 'password' => 'password123', 'firstName' => 'Premium', 'lastName' => 'Actif', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'premium2@cianf.local', 'password' => 'password123', 'firstName' => 'Premium', 'lastName' => 'New', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'premium3@cianf.local', 'password' => 'password123', 'firstName' => 'Premium', 'lastName' => 'Expired', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'standard1@cianf.local', 'password' => 'password123', 'firstName' => 'Standard', 'lastName' => 'Actif', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'standard2@cianf.local', 'password' => 'password123', 'firstName' => 'Standard', 'lastName' => 'Inactif', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'student@student.edu.local', 'password' => 'password123', 'firstName' => 'Standard', 'lastName' => 'Étudiant', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'standard_2fa@cianf.local', 'password' => 'password123', 'firstName' => 'Standard', 'lastName' => 'Securise', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'pending@cianf.local', 'password' => 'password123', 'firstName' => 'Pending', 'lastName' => 'User', 'roles' => ['ROLE_USER'], 'verified' => false],
            ['email' => 'banned@cianf.local', 'password' => 'password123', 'firstName' => 'Banned', 'lastName' => 'User', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'forgot@cianf.local', 'password' => 'password123', 'firstName' => 'Forgot', 'lastName' => 'Password', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'qaui@cianf.local', 'password' => 'password123', 'firstName' => 'QA', 'lastName' => 'Interface', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'qaperf@cianf.local', 'password' => 'password123', 'firstName' => 'QA', 'lastName' => 'Perf', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'demo@cianf.local', 'password' => 'demo', 'firstName' => 'Demo', 'lastName' => 'User', 'roles' => ['ROLE_USER'], 'verified' => true],
            ['email' => 'intl@cianf.local', 'password' => 'password123', 'firstName' => 'User', 'lastName' => 'International', 'roles' => ['ROLE_USER'], 'verified' => true],
        ];

        $userRepository = $this->entityManager->getRepository(User::class);

        foreach ($usersData as $data) {
            $existingUser = $userRepository->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                $user = $existingUser;
                $io->note(sprintf('Utilisateur %s existe déjà, mise à jour...', $data['email']));
            } else {
                $user = new User();
                $io->note(sprintf('Création de l\'utilisateur %s...', $data['email']));
            }

            $user->setEmail($data['email']);
            $user->setFirstName($data['firstName']);
            $user->setLastName($data['lastName']);
            $user->setRoles($data['roles']);
            $user->setIsVerified($data['verified']);

            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                $data['password']
            );
            $user->setPassword($hashedPassword);

            $this->entityManager->persist($user);
        }

        $this->entityManager->flush();

        $io->success('Les 20 utilisateurs de test ont été créés/mis à jour avec succès.');

        return Command::SUCCESS;
    }
}
