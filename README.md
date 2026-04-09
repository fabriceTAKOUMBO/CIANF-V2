# CINAF V2

Plateforme de streaming audiovisuel dédiée aux productions africaines et indépendantes.

## Structure du projet

- `backend/` : API Symfony 7 + API Platform
- `frontend/` : Next.js 14 + Bootstrap 5
- `docker-compose.yml` : Orchestration des services (Database, Backend, Frontend)

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- PHP 8.3 + Composer (pour le développement local hors Docker)
- Node.js 20+ (pour le développement local hors Docker)

### Avec Docker

1. Construire et démarrer les services :
   ```bash
   docker compose up --build
   ```
2. L'API sera accessible sur `http://localhost:8000`
3. Le frontend sera accessible sur `http://localhost:3000`

### Sans Docker (Développement local)

#### Backend
```bash
cd backend
composer install
symfony server:start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Technologies

- **Backend** : PHP 8.3, Symfony 7, API Platform, PostgreSQL 16
- **Frontend** : Next.js 14, React, Bootstrap 5, TypeScript
- **Infrastructure** : Docker, Caddy (via FrankenPHP)
mise a jours de la platefome de streaming cinaf objectif TFE et MVP
