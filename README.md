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

TracePlay supports two deployment modes:

### TODO: Production Mode Features

The following features are temporarily removed from the frontend to focus on core image conversion functionality. See [DECISIONS.md](./DECISIONS.md) for detailed reasoning.

**Future Production UI Components:**

1. **Interactive Tracing Card**
   - Phaser-based tracing game
   - Real-time shape recognition
   - Progress tracking (65% complete indicator)
   - Requires: Backend game server

2. **Adaptive Quizzes Card**
   - AI-generated quizzes
   - Adaptive difficulty
   - Performance analytics (40% complete indicator)
   - Requires: AI backend service

3. **Curriculum View Button**
   - Module-based organization
   - Skill dependency graph
   - Progress tracking
   - Requires: Backend API

4. **Classroom Mode Card**
   - Live instructor sessions
   - Real-time collaboration
   - WebSocket-based interactions
   - Requires: WebSocket server

5. **Getting Started Guide**
   - Basic shapes introduction
   - Shape recognition basics

6. **Advanced Techniques Guide**
   - Complex patterns
   - Artistic tracing

**Current Simplified UI:**
- Load Sample Image
- Upload Image
- Convert to Coloring Page
- Convert to Connect Dots
- Generate
- Print
- Save

**Migration Path:**
When re-introducing production features:
1. Implement backend services (game server, AI service, WebSocket server, API)
2. Add feature flags for gradual rollout
3. Test each feature independently
4. Update UI to include feature cards
5. Integrate with existing image converter
6. Full integration testing

### Demo Mode (Frontend-Only)
The demo mode runs entirely in the browser without backend dependencies. This is ideal for:
- GitHub Pages deployment
- Quick demos and testing
- UI/UX development

**Demo Mode Features:**
- Browser-based image processing with OpenCV.js
- Image upload for coloring page conversion
- Convert images to connect-the-dots activities
- Save and print processed images
- No backend API calls
- No database or Redis required
- Runs on GitHub Pages: https://franekjemiolo.github.io/traceplay/

**Demo Mode Capabilities:**
- **Load Sample Image**: Load a sample turtle image for conversion
- **Upload Image**: Upload any image for conversion
- **Convert to Coloring Page**: Convert images to outline-based coloring pages using OpenCV.js contour detection
- **Convert to Connect Dots**: Convert images to connect-the-dots activities
- **Generate**: Process the image with selected conversion mode
- **Save**: Download the processed image as PNG
- **Print**: Open print dialog with the processed image

**To run locally in demo mode:**
```bash
NEXT_PUBLIC_DEMO_MODE=true pnpm --filter @traceplay/web dev
```

### Full Mode (With Backend)
The full mode includes all backend services for production use. This requires:
- PostgreSQL database
- Redis for caching and job queues
- NestJS backend API
- BullMQ worker for image processing

**Full Mode Features:**
- Real-time image processing with OpenCV
- AI-powered shape annotation
- Adaptive quiz generation
- Real-time classroom sessions via WebSockets
- Curriculum management and progress tracking

**To run locally in full mode:**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or run services individually
pnpm --filter @traceplay/backend dev
pnpm --filter @traceplay/worker start
pnpm --filter @traceplay/web dev
```

**Production Deployment:**
1. Build all packages:
```bash
pnpm build
```

2. Deploy with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Or deploy to Kubernetes:
```bash
kubectl apply -f infrastructure/k8s/
```

### GitHub Pages
The web app is automatically deployed to GitHub Pages in demo mode on push to main. The deployment:
- Runs in demo mode (frontend-only)
- No backend configuration required
- Automatically builds and deploys via GitHub Actions

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
