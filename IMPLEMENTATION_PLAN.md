# TracePlay Implementation Plan

## Codebase Review Summary

### Current State
- **Monorepo Structure**: pnpm workspaces with apps (web, game, backend, worker) and packages (runtime, vector, annotation, curriculum, quiz, ui, embed-sdk)
- **Database**: Prisma schema defined with User, Storybook, Lesson, Module, Skill, StudentProgress, Session, SessionAttendee, Quiz models
- **CI/CD**: GitHub Actions workflows for GitHub Pages deployment and full mode testing
- **Demo Mode**: Frontend-only mode with OpenCV.js browser-based processing, deployed to GitHub Pages
- **Feature Flags**: System to control which features are active in demo vs full mode

### Critical Gaps Identified

## 1. Backend Implementation Gaps

### 1.1 Empty Modules
- **LessonModule**: Empty - needs CRUD endpoints for lessons
- **CurriculumModule**: Empty - needs curriculum management endpoints
- **QuizModule**: Empty - needs quiz generation and management endpoints
- **UserModule**: Empty - needs user CRUD and authentication
- **AuthModule**: Empty - needs JWT authentication, password hashing
- **StorybookModule**: Minimal - needs full CRUD for storybooks

### 1.2 Missing Services
- Prisma service integration
- Image upload service
- Image processing service integration
- Redis cache service
- BullMQ queue service
- Email service (optional)
- File storage service (S3/local)

### 1.3 Missing API Endpoints
- POST /api/lessons - Create lesson
- GET /api/lessons/:id - Get lesson
- PUT /api/lessons/:id - Update lesson
- DELETE /api/lessons/:id - Delete lesson
- POST /api/storybooks - Create storybook
- GET /api/storybooks - List storybooks
- POST /api/upload - Upload image for processing
- GET /api/curriculum - Get curriculum
- POST /api/quizzes - Generate quiz
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/users/me - Get current user
- GET /api/progress - Get user progress
- POST /api/sessions - Create classroom session
- WebSocket endpoints for classroom

## 2. Frontend Implementation Gaps

### 2.1 Missing Pages/Routes
- /login - Login page
- /register - Registration page
- /dashboard - User dashboard
- /storybooks - Storybook listing
- /storybooks/:id - Storybook detail
- /lessons/:id - Lesson detail with game
- /curriculum - Curriculum view
- /progress - Progress tracking
- /classroom/:code - Classroom session
- /profile - User profile

### 2.2 Missing Components
- Authentication components (LoginForm, RegisterForm)
- Storybook components (StorybookCard, StorybookList)
- Lesson components (LessonViewer, LessonEditor)
- Curriculum components (CurriculumView, SkillGraph)
- Quiz components (QuizRenderer, QuizEditor)
- Progress components (ProgressChart, SkillProgress)
- Classroom components (ClassroomJoin, ClassroomView)
- Upload components (ImageUploader, ProcessingStatus)

### 2.3 Missing State Management
- Auth store (user, token, login/logout)
- Lesson store (current lesson, progress)
- Curriculum store (modules, skills)
- Classroom store (session, attendees, state)

### 2.4 Missing API Integration
- API client with axios/fetch
- Request/response interceptors
- Error handling
- Loading states

## 3. Game Implementation Gaps

### 3.1 Missing Game Features
- Complete tracing game logic
- Shape matching algorithm
- Stroke detection and validation
- Score calculation
- Quiz entity integration
- Runtime event integration
- Backend synchronization
- Progress reporting

### 3.2 Missing Game Scenes
- Menu scene
- Lesson selection scene
- Tracing scene (partial)
- Quiz scene
- Results scene

## 4. Worker Implementation Gaps

### 4.1 Missing Job Processors
- Image upload job
- Contour extraction job
- Shape annotation job
- Quiz generation job
- SVG generation job

### 4.2 Missing Error Handling
- Job retry logic
- Dead letter queue
- Error logging
- Progress reporting

## 5. Infrastructure Gaps

### 5.1 Missing Configuration
- .env.example file
- Docker Compose production file
- Kubernetes manifests
- Nginx configuration
- SSL/TLS configuration

### 5.2 Missing Monitoring
- Health check endpoints
- Metrics collection
- Logging infrastructure
- Error tracking (Sentry)

### 5.3 Missing Documentation
- API documentation (Swagger/OpenAPI)
- Architecture documentation
- Deployment guide
- Contributing guide

## 6. Testing Gaps

### 6.1 Missing Unit Tests
- Backend service tests
- Package function tests
- Component tests
- Hook tests

### 6.2 Missing Integration Tests
- API endpoint tests
- Database integration tests
- Worker job tests
- WebSocket tests

### 6.3 Missing E2E Tests
- User flow tests
- Game flow tests
- Classroom flow tests

## Implementation Plan

### Phase 1: Core Backend Infrastructure (Priority: HIGH)

#### 1.1 Database Integration
- [ ] Add Prisma service to AppModule
- [ ] Create PrismaService wrapper
- [ ] Add database connection health check
- [ ] Create base repository pattern
- [ ] Add migration scripts to CI

#### 1.2 Authentication System
- [ ] Implement password hashing (bcrypt)
- [ ] Implement JWT token generation/validation
- [ ] Create AuthController with register/login endpoints
- [ ] Add JWT guard for protected routes
- [ ] Create user service with CRUD operations
- [ ] Add role-based access control

#### 1.3 File Upload Service
- [ ] Implement multer for file uploads
- [ ] Add image validation
- [ ] Configure storage (local/S3)
- [ ] Create upload endpoint
- [ ] Add file cleanup job

#### 1.4 Image Processing Pipeline
- [ ] Integrate @traceplay/vector package
- [ ] Integrate @traceplay/annotation package
- [ ] Create image processing service
- [ ] Add BullMQ job processor
- [ ] Implement job status tracking
- [ ] Add progress reporting

#### 1.5 API Endpoints - Lessons
- [ ] Create LessonService with CRUD
- [ ] Create LessonController
- [ ] Add DTOs with validation
- [ ] Implement lesson creation with image processing
- [ ] Add lesson listing with pagination
- [ ] Add lesson detail endpoint

#### 1.6 API Endpoints - Storybooks
- [ ] Create StorybookService with CRUD
- [ ] Create StorybookController
- [ ] Add DTOs with validation
- [ ] Implement storybook-lesson relationship
- [ ] Add storybook listing

#### 1.7 API Endpoints - Curriculum
- [ ] Integrate @traceplay/curriculum package
- [ ] Create CurriculumService
- [ ] Create CurriculumController
- [ ] Implement skill graph generation
- [ ] Add module management

#### 1.8 API Endpoints - Quizzes
- [ ] Integrate @traceplay/quiz package
- [ ] Create QuizService
- [ ] Create QuizController
- [ ] Implement quiz generation
- [ ] Add quiz CRUD operations

#### 1.9 API Endpoints - Progress
- [ ] Create ProgressService
- [ ] Create ProgressController
- [ ] Implement progress tracking
- [ ] Add analytics endpoints
- [ ] Implement skill mastery calculation

#### 1.10 WebSocket Classroom
- [ ] Enhance ClassroomGateway
- [ ] Add session management
- [ ] Implement teacher controls
- [ ] Add student state synchronization
- [ ] Implement real-time progress updates
- [ ] Add session recording

### Phase 2: Frontend Core Features (Priority: HIGH)

#### 2.1 Authentication Flow
- [ ] Create API client with axios
- [ ] Implement auth store (Zustand)
- [ ] Create login page
- [ ] Create register page
- [ ] Add protected route wrapper
- [ ] Implement token refresh
- [ ] Add logout functionality

#### 2.2 Dashboard
- [ ] Create dashboard layout
- [ ] Add user profile section
- [ ] Display progress overview
- [ ] Show recent lessons
- [ ] Add curriculum progress
- [ ] Implement quick actions

#### 2.3 Storybook Management
- [ ] Create StorybookList component
- [ ] Create StorybookCard component
- [ ] Implement storybook listing page
- [ ] Add storybook detail page
- [ ] Create storybook creation form
- [ ] Add image upload component

#### 2.4 Lesson Management
- [ ] Create LessonList component
- [ ] Create LessonDetail component
- [ ] Implement lesson viewing page
- [ ] Add lesson creation form
- [ ] Integrate with game iframe
- [ ] Add lesson editing

#### 2.5 Curriculum View
- [ ] Create CurriculumView component
- [ ] Implement skill graph visualization
- [ ] Add module listing
- [ ] Show skill dependencies
- [ ] Display progress per skill
- [ ] Add skill detail view

#### 2.6 Progress Tracking
- [ ] Create ProgressChart component
- [ ] Implement SkillProgress component
- [ ] Add progress overview page
- [ ] Show lesson completion stats
- [ ] Display skill mastery
- [ ] Add time tracking

### Phase 3: Game Integration (Priority: MEDIUM)

#### 3.1 Game Backend Integration
- [ ] Add game API endpoints
- [ ] Implement game state synchronization
- [ ] Add progress reporting from game
- [ ] Implement quiz integration
- [ ] Add runtime event bridge

#### 3.2 Game Frontend Integration
- [ ] Create game container component
- [ ] Implement game-message communication
- [ ] Add game loading states
- [ ] Implement game error handling
- [ ] Add game completion handling

#### 3.3 Game Features
- [ ] Complete tracing scene
- [ ] Implement shape matching
- [ ] Add stroke validation
- [ ] Implement score calculation
- [ ] Add quiz overlay
- [ ] Implement results scene

### Phase 4: Classroom Mode (Priority: MEDIUM)

#### 4.1 Classroom Backend
- [ ] Enhance session management
- [ ] Add teacher controls API
- [ ] Implement student state API
- [ ] Add session recording
- [ ] Implement session analytics

#### 4.2 Classroom Frontend
- [ ] Create classroom join page
- [ ] Implement classroom view
- [ ] Add teacher controls UI
- [ ] Implement student view
- [ ] Add real-time updates
- [ ] Create session list

#### 4.3 WebSocket Client
- [ ] Implement Socket.IO client
- [ ] Add connection management
- [ ] Implement event handlers
- [ ] Add reconnection logic
- [ ] Implement error handling

### Phase 5: Infrastructure & DevOps (Priority: MEDIUM)

#### 5.1 Configuration
- [ ] Create .env.example
- [ ] Add environment variable validation
- [ ] Create config service
- [ ] Add configuration documentation

#### 5.2 Docker Production
- [ ] Create docker-compose.prod.yml
- [ ] Optimize Docker images
- [ ] Add health checks
- [ ] Configure volumes
- [ ] Add network configuration

#### 5.3 Kubernetes
- [ ] Create deployment manifests
- [ ] Create service manifests
- [ ] Add ingress configuration
- [ ] Configure secrets
- [ ] Add HPA
- [ ] Create ConfigMaps

#### 5.4 Monitoring
- [ ] Add health check endpoints
- [ ] Implement metrics collection
- [ ] Add logging infrastructure
- [ ] Configure error tracking
- [ ] Add performance monitoring

### Phase 6: Testing (Priority: MEDIUM)

#### 6.1 Unit Tests
- [ ] Add backend service tests
- [ ] Add package function tests
- [ ] Add component tests
- [ ] Add hook tests
- [ ] Configure test coverage

#### 6.2 Integration Tests
- [ ] Add API endpoint tests
- [ ] Add database integration tests
- [ ] Add worker job tests
- [ ] Add WebSocket tests
- [ ] Add game integration tests

#### 6.3 E2E Tests
- [ ] Add user flow tests (Playwright)
- [ ] Add game flow tests
- [ ] Add classroom flow tests
- [ ] Configure test CI

### Phase 7: Documentation (Priority: LOW)

#### 7.1 API Documentation
- [ ] Add Swagger/OpenAPI
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Document authentication
- [ ] Add error codes

#### 7.2 Architecture Documentation
- [ ] Document system architecture
- [ ] Add data flow diagrams
- [ ] Document package dependencies
- [ ] Add deployment architecture
- [ ] Document scaling strategy

#### 7.3 User Documentation
- [ ] Update README with full features
- [ ] Add user guide
- [ ] Add teacher guide
- [ ] Add API usage guide
- [ ] Add troubleshooting guide

## Execution Order

1. **Phase 1.1-1.4**: Core backend infrastructure (database, auth, upload, processing)
2. **Phase 1.5-1.7**: Core API endpoints (lessons, storybooks, curriculum)
3. **Phase 2.1-2.2**: Frontend auth and dashboard
4. **Phase 1.8-1.10**: Remaining backend endpoints (quizzes, progress, classroom)
5. **Phase 2.3-2.4**: Frontend storybook and lesson management
6. **Phase 3**: Game integration
7. **Phase 2.5-2.6**: Frontend curriculum and progress
8. **Phase 4**: Classroom mode
9. **Phase 5**: Infrastructure
10. **Phase 6**: Testing
11. **Phase 7**: Documentation

## Success Criteria

- [ ] All backend modules implemented with full CRUD
- [ ] Authentication system working
- [ ] Image processing pipeline functional
- [ ] Frontend has all major pages
- [ ] Game integrated with backend
- [ ] Classroom mode functional
- [ ] CI/CD passes for all workflows
- [ ] Tests have >80% coverage
- [ ] Documentation complete
- [ ] Demo mode still functional
