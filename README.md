<<<<<<< HEAD
# Ugnay

A  full-stack task and project management system built with a Modular Monolith
architecture, demonstrating a real-world Agile/Scrum-inspired SDLC.


## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Axios, DnD Kit, Recharts
- **Backend:** Node.js, TypeScript, Express, PostgreSQL, Prisma, JWT, bcrypt, Zod, Swagger/OpenAPI, Jest, Supertest
- **Infra:** Docker, Docker Compose, GitHub Actions

## Repository layout

```
TaskFlow/
├── webapp/        # React + Vite frontend
├── server/        # Express + TypeScript backend
├── database/      # ERD, seed scripts, SQL exports
├── docs/          # Requirements, architecture, API, deployment docs
├── docker/        # Dockerfiles
├── postman/       # Exported Postman collection
├── scripts/       # Dev helper scripts
├── screenshots/   # README/demo images
├── .github/       # CI workflows
└── docker-compose.yml
```

## Getting started (local development)

### Prerequisites
- Node.js LTS
- Docker Desktop
- Git

### 1. Clone and configure environment

```bash
git clone <your-repo-url>
cd TaskFlow
cp .env.example .env
cp server/.env.example server/.env
cp webapp/.env.example webapp/.env
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Install dependencies

```bash
cd server && npm install
cd ../webapp && npm install
```

### 4. Run the backend

```bash
cd server
npm run dev
```

Visit `http://localhost:4000/health` — should return `{"status":"ok"}`.

### 5. Run the frontend

```bash
cd webapp
npm run dev
```

Visit `http://localhost:5173`.

## Documentation

See `docs/` for requirements, architecture, database design, API reference, and
deployment notes as they're written.

## License

See `LICENSE`.
=======
# Ugnay
>>>>>>> b5948adfdd8de475070516a0eae4ef7fc87d7d3c
