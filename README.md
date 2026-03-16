# SaaS Platform

Multi-service SaaS platform for AI workflow automation — built with **Next.js** frontend and **FastAPI** microservices backend.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│            (TypeScript, Tailwind CSS)            │
├─────────────┬──────────┬──────────┬─────────────┤
│    Auth      │ Analytics│ Billing  │Notifications│
│   Service    │ Service  │ Service  │   Service   │
│  (FastAPI)   │(FastAPI) │(FastAPI) │  (FastAPI)  │
├─────────────┴──────────┴──────────┴─────────────┤
│              PostgreSQL + Redis                  │
└─────────────────────────────────────────────────┘
```

## Services

| Service | Description | Stack |
|---------|-------------|-------|
| **Auth** | JWT (RS256) authentication, user management | FastAPI, PostgreSQL |
| **Analytics** | Usage histograms, time-series data | FastAPI, PostgreSQL |
| **Billing** | Transaction management, API key auth | FastAPI, PostgreSQL |
| **Notifications** | Multi-channel alerts (functions, channels, integrations) | FastAPI, PostgreSQL |
| **Payment** | Payment processing integration | FastAPI |
| **Parser** | Data ingestion and transformation | FastAPI |

## Frontend

- **Next.js 14** with App Router
- **TypeScript** — strict mode
- **Middleware** — JWT validation, route protection
- **Components** — modular UI library

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), 6 microservices
- **Database**: PostgreSQL
- **Auth**: JWT RS256 (asymmetric keys)
- **Infrastructure**: Docker, Docker Compose
- **Testing**: 59 E2E tests (pytest)

## Quick Start

```bash
# Frontend
npm install && npm run dev

# Backend (via Docker)
docker compose up -d
```

## Testing

```bash
python3 -m pytest tests/ -v  # 59 tests, all passing
```

## License

MIT
