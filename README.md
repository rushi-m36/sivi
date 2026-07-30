# Sivi - YouTube Client MVP

Sivi is a lightweight, responsive YouTube client MVP designed with a scalable, feature-based architecture.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS (REST API)
- **API Integration**: YouTube Data API v3

---

## Project Structure

```
Sivi/
├── client/               # Next.js Frontend Application
│   ├── app/                # App Router Routes & Pages
│   │   ├── page.tsx        # Search / Home Page
│   │   ├── watch/
│   │   │   └── [id]/
│   │   │       └── page.tsx # Video Player / Detail Page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/         # Reusable Components (by feature)
│   │   ├── search/         # Search components (e.g. SearchBar)
│   │   ├── video/          # Video components (e.g. VideoGrid, VideoCard)
│   │   ├── layout/         # Shell / Global layouts
│   │   └── ui/             # shadcn/ui base elements (buttons, inputs)
│   ├── lib/                # Utility modules (fetchers, formatters)
│   │   ├── api.ts          # Backend API client
│   │   ├── youtube.ts      # Youtube helper utilities
│   │   └── utils.ts        # shadcn style merger helper
│   ├── hooks/              # Custom React hooks
│   ├── types/              # Frontend TypeScript definitions
│   ├── public/             # Static assets
│   └── package.json
│
├── server/                # NestJS Backend Application
│   ├── src/
│   │   ├── youtube/        # Youtube Feature Module
│   │   │   ├── controllers/# REST Endpoints
│   │   │   ├── services/   # Business Logic & API calls
│   │   │   ├── dto/        # Validation transfer objects
│   │   │   ├── interfaces/ # Backend TypeScript definitions
│   │   │   └── youtube.module.ts
│   │   ├── common/         # Shared filters/guards/interceptors
│   │   ├── config/         # System configuration schema
│   │   ├── app.module.ts   # Root Nest Module
│   │   └── main.ts         # Server Entry Point
│   ├── test/               # Testing files
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── .gitignore              # Root Git exclusions
├── README.md               # Project documentation
└── docker-compose.yml      # Containerized deployment settings
```

---

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

Runs at: [http://localhost:3001/api](http://localhost:3001/api)

#### 2. Running the Frontend

```bash
cd client
npm run dev
```

Runs at: [http://localhost:3000](http://localhost:3000)

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
