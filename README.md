# TracePlay

An AI-powered educational SaaS platform that transforms images into interactive tracing and learning experiences. Features include shape recognition, adaptive quizzes, curriculum management, and real-time classroom sessions.

## Architecture

TracePlay is built as a monorepo using pnpm workspaces with the following structure:

```
traceplay/
├── apps/
│   ├── web/          # Next.js frontend (React, Tailwind, Zustand)
│   ├── game/         # Phaser 3 tracing game
│   ├── backend/      # NestJS API (PostgreSQL, Redis, WebSockets)
│   └── worker/       # BullMQ job processing
├── packages/
│   ├── runtime/      # Event-driven kernel for shared state
│   ├── vector/       # OpenCV pipeline for image processing
│   ├── annotation/   # Shape semantics and labeling
│   ├── curriculum/   # Module and skill graph engine
│   ├── quiz/         # Quiz generator with AI distractors
│   ├── ui/           # React design system
│   └── embed-sdk/    # Embeddable client SDK
├── prisma/           # Database schema
└── infrastructure/   # Docker and deployment configs
```

## Tech Stack

### Frontend
- **Next.js 14** - React framework for the web app
- **Phaser 3** - WebGL game engine for tracing
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **@traceplay/ui** - Custom design system

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM for PostgreSQL
- **Redis** - Caching and job queue
- **BullMQ** - Job processing
- **Socket.IO** - Real-time classroom sessions

### Packages
- **@traceplay/runtime** - Event-driven state management
- **@traceplay/vector** - OpenCV.js for contour extraction
- **@traceplay/annotation** - Shape labeling
- **@traceplay/curriculum** - Skill graph and progression
- **@traceplay/quiz** - AI quiz generation
- **@traceplay/embed-sdk** - Iframe embed for third-party sites

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- Redis 7+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FranekJemiolo/traceplay.git
cd traceplay
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
```

### Running Locally

#### Web App
```bash
pnpm --filter @traceplay/web dev
```
Visit http://localhost:3000

#### Game
```bash
pnpm --filter @traceplay/game dev
```
Visit http://localhost:3001

#### Backend
```bash
pnpm --filter @traceplay/backend dev
```
API runs on http://localhost:3000

#### Worker
```bash
pnpm --filter @traceplay/worker start
```

### Docker Setup

Run all services with Docker Compose:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000
- Worker process
- Web app on port 3001

## Key Features

### Image Processing Pipeline
1. Upload image to backend
2. Worker processes with OpenCV contour extraction
3. Douglas-Peucker simplification
4. Bezier curve smoothing
5. SVG generation
6. AI annotation (shape labels)
7. Quiz generation with distractors

### Tracing Game
- Phaser 3 WebGL rendering
- Real-time stroke detection
- Shape matching algorithm
- In-world quiz entities
- Runtime event integration

### Classroom Mode
- Real-time WebSocket sessions
- Teacher controls
- Student progress tracking
- Live state synchronization

### Curriculum Engine
- Module-based organization
- Skill dependency graph
- Adaptive progression
- Progress analytics

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/traceplay

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# AI (optional - for BYOK)
OPENAI_API_KEY=your_key_here
```

## Deployment

### GitHub Pages
The web app is automatically deployed to GitHub Pages on push to main. Configure:
- GitHub token in repository secrets
- `NEXT_PUBLIC_API_URL` in repository secrets

### Production
1. Build all packages:
```bash
pnpm build
```

2. Deploy with Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Development

### Adding a New Package
```bash
mkdir packages/new-package
cd packages/new-package
pnpm init
# Add package.json, tsconfig.json, source files
```

### Adding a New App
```bash
mkdir apps/new-app
cd apps/new-app
# Initialize with your framework
# Add to root package.json workspaces
```

### Running Tests
```bash
pnpm test
```

### Linting
```bash
pnpm lint
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
