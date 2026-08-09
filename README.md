# Sivi - YouTube Client

Sivi is a lightweight, distraction-free YouTube client designed for learners and intentional video consumption.

## Features

- Search and watch YouTube videos
- No distracting home feed
- No Shorts
- Lightweight and minimal UI
  & many more coming soon...


## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NestJS (REST API)
- **Authentication:** Clerk
- **Database:** Neon Postgres
- **ORM:** Prisma
- **API Integration:** YouTube Data API v3

## Project Structure

```text
sivi/
├── client/                         # Next.js frontend
│   ├── app/                        # Application routes
│   │   ├── channel/
│   │   ├── search/
│   │   ├── subscriptions/
│   │   └── watch/
│   ├── components/                 # Reusable UI components
│   │   ├── channel/
│   │   ├── layout/
│   │   ├── search/
│   │   └── video/
│   ├── lib/                        # API helpers and utilities
│   ├── public/                     # Static assets
│   └── types/                      # TypeScript types
│
├── server/                         # NestJS backend
│   ├── src/
│   │   ├── auth/
│   │   ├── channel/
│   │   ├── config/
│   │   ├── subscriptions/
│   │   └── videos/
│   ├── prisma/                     # Database schema and migrations
│   └── test/                       # Backend tests
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- YouTube Data API v3 credentials
- Clerk credentials
- Neon PostgreSQL database

### Initialization

The frontend was initialized with:

```bash
npx -y create-next-app@latest client --ts --tailwind --eslint --app --import-alias "@/*" --use-npm --disable-git
```

The backend was initialized with:

```bash
npx -y @nestjs/cli new server --package-manager npm --skip-git
```

### Running Locally

#### Backend

```bash
cd server
npm run start:dev
```

Backend:

`http://localhost:3001/api`

#### Frontend

```bash
cd client
npm run dev
```

Frontend:

`http://localhost:3000`

## Dependencies

### Frontend

- `lucide-react` — Icon library
- `clsx` — Conditional class names
- `tailwind-merge` — Tailwind class merging
- `@tanstack/react-query` — Server-state management and caching

### Backend

- `@nestjs/config` — Environment configuration
- `class-validator` — Request validation
- `class-transformer` — DTO transformation
- `googleapis` — YouTube Data API integration
- `prisma` — Database ORM

## Environment Variables

Create the required environment files in both `client` and `server`.

Refer to the environment variable examples provided with the project and never commit secrets to the repository.

## License

See the `LICENSE` file for licensing terms.
