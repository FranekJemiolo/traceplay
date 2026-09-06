# TracePlay

An AI-powered educational SaaS platform that transforms images into interactive tracing and learning experiences. Features include shape recognition, adaptive quizzes, curriculum management, and real-time classroom sessions.

---

## 📸 Platform Previews & Visual Showcase

### 1. Activity Studio (Photo to Coloring & Tracing Converter)
Convert photos and images into coloring pages, connect-the-dots, and interactive tracing exercises with real-time OpenCV.js processing and threshold fine-tuning.

![Activity Studio Preview](./docs/images/activity_studio_preview.png)

### 2. Interactive Tracing Game (Phaser 3 & Web Audio Engine)
Real-time tactile stroke tracing with glowing neon lines, numbered guide dots, audio feedback tones, accuracy calculation, and celebratory particle rewards.

![Interactive Tracing Game](./docs/images/tracing_game_preview.png)

### 3. Live Classroom & Teacher/Student Dashboard
Real-time Socket.IO synchronization allowing instructors to monitor all student canvases live, push lesson steps, and receive student hand-raise notifications.

![Live Classroom Dashboard](./docs/images/classroom_live_preview.png)

### 4. Sample Test Imagery (Cat Coloring Conversion)
TracePlay includes high-contrast test images ready to be converted into custom coloring book sheets and connect-the-dots worksheets:

| Original Cute Kitten (`cat_sample.png`) | Playful Kitten with Yarn (`cat_playful.png`) |
| :---: | :---: |
| <img src="./docs/images/cat_sample.png" width="280" alt="Cute Kitten" /> | <img src="./docs/images/cat_playful.png" width="280" alt="Playful Kitten" /> |

---

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

### Architecture Diagram

```mermaid
graph TD
    subgraph "Monorepo Structure"
        A[pnpm workspaces] --> B[Apps]
        A --> C[Packages]
        A --> D[Infrastructure]
    end
    
    subgraph "Applications"
        B --> E[Web App - Next.js]
        B --> F[Game Engine - Phaser 3]
        B --> G[Backend API - NestJS]
        B --> H[Worker - BullMQ]
        
        E --> I[React Frontend]
        E --> J[Tailwind CSS]
        E --> K[Zustand State]
        F --> L[WebGL Tracing]
        F --> M[Interactive Canvas]
        G --> N[REST API]
        G --> O[WebSocket Server]
        G --> P[PostgreSQL DB]
        H --> Q[Job Processing]
        H --> R[Background Tasks]
    end
    
    subgraph "Core Packages"
        C --> S[Runtime - Event Kernel]
        C --> T[Vector - OpenCV Pipeline]
        C --> U[Annotation - Shape Semantics]
        C --> V[Curriculum - Skill Graph]
        C --> W[Quiz - AI Generator]
        C --> X[UI - Design System]
        C --> Y[Embed SDK]
        
        S --> Z[Event Bus]
        S --> AA[State Management]
        T --> BB[Image Processing]
        T --> CC[Contour Extraction]
        U --> DD[Shape Recognition]
        U --> EE[Labeling System]
        V --> FF[Skill Progression]
        V --> GG[Module Structure]
        W --> HH[AI Distractors]
        W --> II[Quiz Generation]
        X --> JJ[React Components]
        X --> KK[Design Tokens]
        Y --> LL[Iframe Embed]
        Y --> MM[Third-party API]
    end
    
    subgraph "Data Flow"
        I --> S
        L --> T
        T --> U
        U --> V
        V --> W
        W --> N
        N --> P
        P --> O
        O --> I
    end
    
    subgraph "Image Processing Pipeline"
        NN[User Upload] --> BB
        BB --> OO[Preprocessing]
        OO --> PP[Edge Detection]
        PP --> QQ[Contour Analysis]
        QQ --> DD
        DD --> RR[Shape Classification]
        RR --> SS[Annotation Store]
    end
    
    subgraph "Learning System"
        TT[Curriculum Engine] --> V
        V --> UU[Skill Assessment]
        UU --> VV[Adaptive Difficulty]
        VV --> W
        W --> WW[Quiz Generation]
        WW --> XX[Student Progress]
        XX --> YY[Performance Analytics]
    end
    
    subgraph "Real-time Features"
        O --> ZZ[Classroom Sessions]
        O --> AAA[Live Collaboration]
        O --> BBB[Teacher Dashboard]
        ZZ --> CCC[Student Screens]
        AAA --> DDD[Shared Canvas]
        BBB --> EEE[Progress Monitoring]
    end
    
    subgraph "Infrastructure"
        D --> FFF[Docker Compose]
        D --> GGG[Kubernetes]
        D --> HHH[CI/CD Pipeline]
        D --> III[Monitoring]
        FFF --> JJJ[Development Stack]
        GGG --> KKK[Production Cluster]
        HHH --> LLL[Automated Testing]
        III --> MMM[Performance Metrics]
    end
    
    subgraph "External Integrations"
        NNN[AI Services] --> W
        OOO[Payment Gateway] --> G
        PPP[Email Service] --> G
        QQQ[Cloud Storage] --> NN
        RRR[Analytics Platform] --> III
    end
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

## Deployment & Operating Modes

TracePlay supports two operational modes:

### 1. Full SaaS Platform Mode (Backend + Web + Game + Worker)
Includes all microservices for production use:
- **NestJS API**: Authentication, storybooks, lessons, modules, and quizzes.
- **WebSocket Gateway**: Real-time teacher/student classroom sessions with live canvas synchronization.
- **PostgreSQL Database**: Persistent users, lessons, progression metrics, and curriculum graphs.
- **BullMQ & Redis**: Headless asynchronous vector processing and job queues.
- **Phaser 3 Game Engine**: Interactive WebGL tracing with audio synthesis and scoring.

### 2. Demo Mode (Zero-Dependency Client-Side)
Runs entirely in the browser using OpenCV.js without requiring a backend database or Redis. This powers the live GitHub Pages deployment:
- Client-side contour extraction and Douglas-Peucker simplification.
- Interactive side-by-side coloring and connect-the-dots activity generation.
- Full offline curriculum explorer and HTML5 canvas interactive tracing with Web Audio synthesis.
- Print worksheet export.
- Live deployment: https://franekjemiolo.github.io/traceplay/
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
