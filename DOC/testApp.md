# Données de Test Utilisateurs (CIANF-V2)

Ce document recense 20 profils d'utilisateurs fictifs pour vous permettre de réaliser des tests complets sur la plateforme. Ils couvrent un large panel de cas d'utilisation (rôles différents, statuts variés).

## Administrateurs et Staff
1. **Super Admin**
   - **Nom :** Admin Principal
   - **Email :** superadmin@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_SUPER_ADMIN`
   - **Cas d'utilisation :** Accès total à la plateforme, gestion des autres administrateurs, configuration globale.

2. **Manager de Contenu**
   - **Nom :** Content Manager
   - **Email :** manager@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_MANAGER`
   - **Cas d'utilisation :** Ajout, modification, et suppression de vidéos ou articles, sans accès à la configuration système.

3. **Modérateur**
   - **Nom :** Modérateur Sécurité
   - **Email :** moderateur@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_MODERATOR`
   - **Cas d'utilisation :** Modération des commentaires, blocage/déblocage d'utilisateurs signalés.

4. **Agent de Support**
   - **Nom :** Support Client
   - **Email :** support@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_SUPPORT`
   - **Cas d'utilisation :** Accès en lecture seule aux informations des utilisateurs pour résoudre les tickets et problèmes.

## Créateurs de Contenu
5. **Créateur Prolifique**
   - **Nom :** Creator Pro
   - **Email :** creator_pro@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_CREATOR`
   - **Cas d'utilisation :** Plus de 50 vidéos en ligne, vérification des statistiques de vue et de la monétisation.

6. **Nouveau Créateur**
   - **Nom :** Creator Novice
   - **Email :** creator_new@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_CREATOR`
   - **Cas d'utilisation :** Vient de créer son compte, aucune vidéo téléchargée, test de l'assistant d'onboarding.

## Utilisateurs Premium
7. **Premium Actif**
   - **Nom :** Premium Actif
   - **Email :** premium1@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_USER` (Abonnement Premium Actif)
   - **Cas d'utilisation :** Accès à tout le contenu sans publicité, regarde des vidéos quotidiennement.

8. **Premium Récemment Souscrit**
   - **Nom :** Premium New
   - **Email :** premium2@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_USER` (Abonnement Premium Actif)
   - **Cas d'utilisation :** Abonnement d'essai gratuit en cours, test de la facturation et mise à niveau.

9. **Premium Expiré**
   - **Nom :** Premium Expired
   - **Email :** premium3@cianf.local
   - **Mot de passe :** password123
   - **Rôle :** `ROLE_USER` (Abonnement Expiré)
   - **Cas d'utilisation :** L'abonnement a expiré il y a 2 jours, vérification des messages de relance et du blocage de l'accès premium.

## Utilisateurs Standard (Gratuits)
10. **Standard Très Actif**
    - **Nom :** Standard Actif
    - **Email :** standard1@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Regarde du contenu gratuit régulièrement, voit les publicités.

11. **Standard Inactif (6 mois)**
    - **Nom :** Standard Inactif
    - **Email :** standard2@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Ne se s'est pas connecté depuis 6 mois, utile pour tester des e-mails de reconquête.

12. **Standard Étudiant**
    - **Nom :** Standard Étudiant
    - **Email :** student@student.edu.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Inscription avec une adresse .edu, vérification de l'application potentielle de promotions étudiantes.

13. **Standard Double A2F**
    - **Nom :** Standard Securise
    - **Email :** standard_2fa@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** L'authentification à double facteur (2FA) est activée sur ce profil.

## Utilisateurs avec Statuts Spécifiques / Erreurs
14. **Utilisateur Non Vérifié**
    - **Nom :** Pending User
    - **Email :** pending@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** N'a pas encore cliqué sur le lien de vérification par e-mail. Test des restrictions d'accès pour comptes non vérifiés.

15. **Utilisateur Banni**
    - **Nom :** Banned User
    - **Email :** banned@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER` (Statut: Suspendu)
    - **Cas d'utilisation :** Compte bloqué pour violation des CGU. Doit recevoir un message d'erreur lors de la tentative de connexion.

16. **Oubli de Mot de Passe**
    - **Nom :** Forgot Password 
    - **Email :** forgot@cianf.local
    - **Mot de passe :** N/A (en cours de reset)
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** A initié une procédure de réinitialisation de mot de passe.

## Utilisateurs de Test & QA
17. **Testeur QA UI**
    - **Nom :** QA Interface
    - **Email :** qaui@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Utilisé pour réaliser les tests d'interfaces et E2E (End-to-End).

18. **Testeur QA Performance**
    - **Nom :** QA Perf
    - **Email :** qaperf@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Utilisé pour exécuter des scripts de test de charge (flood).

19. **Compte de Démonstration**
    - **Nom :** Demo User
    - **Email :** demo@cianf.local
    - **Mot de passe :** demo
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Profil "sandbox" que les utilisateurs externes peuvent utiliser pour découvrir l'interface publiquement.

20. **Profil International (Timezone/Langue différents)**
    - **Nom :** User International
    - **Email :** intl@cianf.local
    - **Mot de passe :** password123
    - **Rôle :** `ROLE_USER`
    - **Cas d'utilisation :** Profil configuré en langue anglaise (EN) et Timezone UTC-5 pour tester l'i18n et les conversions de dates.

---
*Généré lors de la mise en place de la stratégie de test. (Fabrice TAKOUMBO)*
