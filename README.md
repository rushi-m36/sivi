# Sivi - YouTube Client MVP

Sivi is a lightweight, distraction free YouTube client designed for those who want to use YouTube instead of YouTube using them.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS (REST API)
- **Authentication**: Clerk
- **Database**: Neon Postgres
- **API Integration**: YouTube Data API v3

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm

### Initialization Commands

1. **Frontend Initialization** (already generated):

   ```bash
   npx -y create-next-app@latest client --ts --tailwind --eslint --app --import-alias "@/*" --use-npm --disable-git
   ```

2. **Backend Initialization** (already generated):
   ```bash
   npx -y @nestjs/cli new server --package-manager npm --skip-git
   ```

### Running Locally

#### 1. Running the Backend

```bash
cd server
npm run start:dev
```

Runs at: [http://localhost:3001/api]

#### 2. Running the Frontend

```bash
cd client
npm run dev
```

Runs at: [http://localhost:3000]

---

## Recommended Dependencies (MVP Only)

### Frontend

- `lucide-react`: Icon library.
- `clsx` & `tailwind-merge`: Required for shadcn/ui styles helper merging.
- `@tanstack/react-query`: To cache and fetch API results cleanly.

### Backend

- `@nestjs/config`: Environment variable loading.
- `class-validator` & `class-transformer`: Runtime query validations.
- `googleapis`: Official Google SDK (provides YouTube Data API wrappers).
