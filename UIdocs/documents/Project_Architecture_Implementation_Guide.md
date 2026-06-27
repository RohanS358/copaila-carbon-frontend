# CoPaila - Project Architecture & Implementation Guide

**Version:** 1.0  
**Last Updated:** June 24, 2026  
**Audience:** Developers, DevOps, Architects

---

## Table of Contents
1. [Project Structure Overview](#project-structure-overview)
2. [Technology Stack](#technology-stack)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Development Setup](#development-setup)
8. [Deployment Guide](#deployment-guide)
9. [Performance & Optimization](#performance--optimization)
10. [Security Implementation](#security-implementation)

---

## Project Structure Overview

```
LeafNode/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts                  # Application entry point
│   │   ├── app.module.ts            # Root module definition
│   │   ├── app.controller.ts        # Health check endpoint
│   │   │
│   │   ├── auth/                    # Authentication Module
│   │   │   ├── auth.controller.ts   # Login, register endpoints
│   │   │   ├── auth.service.ts      # JWT, password hashing logic
│   │   │   ├── auth.module.ts       # Module definition
│   │   │   ├── decorators/          # Custom decorators (@Roles, @CurrentUser)
│   │   │   ├── dto/                 # Data transfer objects (LoginDto, RegisterDto)
│   │   │   ├── guards/              # JWT guard, Roles guard
│   │   │   └── strategies/          # Passport JWT strategy
│   │   │
│   │   ├── schools/                 # Schools Management Module
│   │   │   ├── schools.controller.ts
│   │   │   ├── schools.service.ts
│   │   │   ├── schools.module.ts
│   │   │   └── dto/                 # CreateSchoolDto, UpdateSchoolDto, etc.
│   │   │
│   │   ├── users/                   # Users Management Module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── dto/
│   │   │
│   │   ├── carbon-calculator/       # Carbon Calculation Module
│   │   │   ├── carbon-calculator.controller.ts
│   │   │   ├── carbon-calculator.service.ts
│   │   │   ├── carbon-calculator.module.ts
│   │   │   ├── engine/              # Calculation engine
│   │   │   │   ├── calculation-engine.ts    # Main calculation logic
│   │   │   │   ├── category-processors.ts  # 9 category-specific processors
│   │   │   │   └── types.ts                # TypeScript types
│   │   │   ├── config/              # Emission factors configuration
│   │   │   │   └── emission-factors.config.ts
│   │   │   └── dto/
│   │   │
│   │   ├── omr/                     # OMR Scanning Module
│   │   │   ├── omr.controller.ts    # Upload, scan endpoints
│   │   │   ├── omr.service.ts       # OMRChecker integration, CSV parsing
│   │   │   └── omr.module.ts
│   │   │
│   │   ├── prisma/                  # Database Layer
│   │   │   ├── prisma.service.ts    # Prisma client wrapper
│   │   │   └── prisma.module.ts
│   │   │
│   │   ├── common/                  # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/             # Exception filters
│   │   │   ├── interceptors/        # Request/response interceptors
│   │   │   └── middleware/
│   │   │
│   │   └── config/                  # Configuration
│   │       └── configuration.ts     # Centralized config via ConfigModule
│   │
│   ├── prisma/                      # Database Schema & Migrations
│   │   ├── schema.prisma            # Prisma data model (CORE FILE)
│   │   ├── seed.ts                  # Database seeding script
│   │   └── migrations/              # Auto-generated migration files
│   │       ├── 20260614124209_init/
│   │       └── 20260619121453_carbon_activity_tiers/
│   │
│   ├── test/                        # Unit & integration tests
│   ├── dist/                        # Compiled output (generated)
│   ├── Dockerfile                   # Docker image definition
│   ├── nest-cli.json               # NestJS CLI config
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json                # Dependencies & scripts
│   └── OMR_INTEGRATION.md          # OMRChecker integration docs
│
├── LeafNode/                        # React/Vite Frontend
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Root app component
│   │   ├── index.css               # Global styles
│   │   │
│   │   ├── pages/                  # Page components (route-level)
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SchoolRegister.jsx
│   │   │   ├── IndividualRegister.jsx
│   │   │   ├── SelectSchool.jsx
│   │   │   ├── RoleSelection.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── CarbonDashboard.jsx
│   │   │   ├── SchoolDataEntry.jsx
│   │   │   ├── SchoolOCRScan.jsx
│   │   │   ├── SchoolReports.jsx
│   │   │   ├── SchoolRecommendations.jsx
│   │   │   ├── SchoolForest.jsx
│   │   │   ├── PetRPG.jsx
│   │   │   ├── Achievements.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── JoinUs.jsx
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── BackButton.jsx
│   │   │   ├── RouteGuards.jsx      # RequireAccess, RedirectIfAuth
│   │   │   ├── ChartCard.jsx        # Recharts wrapper
│   │   │   ├── StatCard.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── PetCard.jsx
│   │   │   ├── InsightCard.jsx
│   │   │   └── SearchBar.jsx
│   │   │
│   │   ├── context/                 # React Context for state management
│   │   │   ├── AuthContext.jsx      # User, token, isAuthenticated
│   │   │   └── AppContext.jsx       # currentSchool, currentAudit, isLoading
│   │   │
│   │   ├── services/                # API client services
│   │   │   ├── authService.js       # Login, register, refresh token
│   │   │   ├── schoolsService.js    # School CRUD, approval workflows
│   │   │   ├── auditService.js      # Audit submission, calculations
│   │   │   ├── omrService.js        # OMR scanning endpoints
│   │   │   ├── reportService.js     # Report generation, export
│   │   │   └── recommendationService.js
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Auth state & actions
│   │   │   ├── useAudit.js          # Audit state & actions
│   │   │   └── useFetch.js          # Generic fetch wrapper
│   │   │
│   │   ├── layouts/                 # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   ├── data/                    # Static data, constants
│   │   │   ├── omr-layout.json      # OMR sheet template (generated)
│   │   │   ├── categories.json      # Activity categories
│   │   │   └── provinces.json       # Nepali provinces
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── api.js               # Fetch wrapper, error handling
│   │   │   ├── formatters.js        # Date, number formatting
│   │   │   └── validators.js        # Input validation
│   │   │
│   │   ├── assets/                  # Images, icons, fonts
│   │   └── App.css                  # Tailwind + component styles
│   │
│   ├── public/                      # Static files
│   ├── vercel.json                 # Vercel deployment config
│   ├── vite.config.js              # Vite bundler config
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── package.json
│   └── index.html                  # HTML entry point
│
├── OMRChecker/                      # Python OMR Scanning Utility
│   ├── main.py                      # Entry point: python main.py -i <input> -o <output>
│   ├── src/
│   │   ├── core.py                  # Core OMR detection logic
│   │   ├── entry.py                 # CLI argument parsing
│   │   ├── evaluation.py            # Result evaluation
│   │   ├── template.py              # Template handling
│   │   ├── processors/              # Image processing modules
│   │   ├── schemas/                 # OMR schema definitions
│   │   ├── constants/               # Global constants
│   │   ├── defaults/                # Default configurations
│   │   └── utils/                   # Helper functions
│   │
│   ├── samples/                     # Sample OMR sheets
│   ├── docs/                        # Documentation
│   ├── tests/                       # Test cases
│   ├── requirements.txt
│   ├── pytest.ini
│   └── README.md
│
├── Dailly-Quest/                    # Secondary React Component
│   ├── src/
│   │   ├── EcoGuardianMVP.jsx       # Main component
│   │   └── components/              # Supporting components
│   ├── package.json
│   └── public/
│
├── Dockerfile                       # Multi-stage Docker config
├── render.yaml                      # Render.com deployment config
├── Documents/                       # 📁 DOCUMENTATION FOLDER (NEW)
│   ├── LeafNode_ActivityDiagram.puml
│   ├── LeafNode_ClassDiagram.puml
│   ├── LeafNode_DFD_Level0.puml
│   ├── LeafNode_DFD_Level1.puml
│   ├── LeafNode_DFD_Level2.puml
│   ├── LeafNode_ERDiagram.puml
│   ├── LeafNode_SequenceDiagram.puml
│   ├── LeafNode_UseCase Diagram.puml
│   ├── LeafNode_SRS.md
│   └── Consolidated_Idea_Document.md
│
└── .github/                         # GitHub-specific configs
    ├── workflows/                   # CI/CD pipelines
    └── CONTRIBUTING.md
```

---

## Technology Stack

### Backend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ LTS | Server runtime |
| **Framework** | NestJS | 10.3+ | Scalable server framework |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Database** | PostgreSQL | 12+ | Relational database |
| **ORM** | Prisma | 5.10+ | Type-safe database access |
| **Authentication** | Passport.js + JWT | 4.0+ | Auth strategy |
| **Validation** | class-validator | 0.14+ | DTO validation |
| **API Docs** | Swagger/OpenAPI | 7.3+ | Interactive API docs |
| **Security** | Helmet | 7.1+ | HTTP security headers |
| **Compression** | compression | 1.7+ | Response compression |
| **Caching** | Redis | 6+ | Session & factor caching |
| **Testing** | Jest | 29+ | Unit & integration tests |
| **Linting** | ESLint | 8+ | Code quality |

### Frontend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ LTS | Build tooling |
| **Framework** | React | 18.2+ | UI components |
| **Routing** | React Router | 6.22+ | Client-side routing |
| **Bundler** | Vite | 7.3+ | Fast build & dev server |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Charts** | Recharts | 2.10+ | Data visualization |
| **Icons** | Lucide React | 0.383+ | Icon library |
| **Testing** | Vitest | Latest | Fast unit testing |
| **Linting** | ESLint | 8+ | Code quality |

### DevOps & Deployment
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container** | Docker | Containerization |
| **Orchestration** | Docker Compose | Multi-container development |
| **Platform** | Render.com | Managed cloud hosting |
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Monitoring** | Sentry | Error tracking & monitoring |
| **APM** | New Relic (optional) | Application performance monitoring |
| **Logging** | Winston/Morgan | Application logging |
| **Email** | SendGrid | Transactional email |

### Key Dependencies Summary
```json
{
  "backend_core": [
    "@nestjs/common@^10.3.0",
    "@nestjs/core@^10.3.0",
    "passport@^0.7.0",
    "passport-jwt@^4.0.1",
    "@prisma/client@^5.10.2"
  ],
  "frontend_core": [
    "react@^18.2.0",
    "react-dom@^18.2.0",
    "react-router-dom@^6.22.0",
    "recharts@^2.10.4",
    "tailwindcss@^3.4.1"
  ],
  "shared": [
    "typescript@^5.0+",
    "axios@^1.6+",
    "dotenv@^16+"
  ]
}
```

---

## Backend Architecture

### Module-Based Organization

#### 1. **Auth Module** (`src/auth/`)
```
Purpose: User authentication, JWT token management, password security

Components:
├─ auth.controller.ts
│  ├─ POST /auth/register         (Create user account)
│  ├─ POST /auth/login            (Authenticate, return JWT)
│  ├─ POST /auth/refresh          (Refresh expired token)
│  └─ POST /auth/logout           (Invalidate token)
│
├─ auth.service.ts
│  ├─ register(dto): User         (Hash password, store user)
│  ├─ login(email, pwd): Token    (Verify credentials, generate JWT)
│  ├─ validateUser(payload)       (JWT payload validation)
│  └─ refreshToken(token): Token  (Issue new token)
│
├─ guards/
│  ├─ jwt.guard.ts                (Validates JWT token presence)
│  └─ roles.guard.ts              (Checks user role permissions)
│
├─ strategies/
│  └─ jwt.strategy.ts             (Passport JWT strategy)
│
└─ decorators/
   ├─ current-user.ts             (@CurrentUser() extracts user from req)
   └─ roles.ts                    (@Roles(UserRole.SCHOOL_ADMIN) guards)

Key Interfaces:
- AuthToken { accessToken, refreshToken, expiresIn }
- LoginDto { email, password }
- RegisterDto { email, password, firstName, lastName, role }
```

#### 2. **Schools Module** (`src/schools/`)
```
Purpose: School registration, profile management, status lifecycle

Components:
├─ schools.controller.ts
│  ├─ POST /schools               (Initiate registration)
│  ├─ GET /schools/:id            (Fetch school profile)
│  ├─ PUT /schools/:id            (Update school info)
│  ├─ GET /schools                (List schools + filters)
│  ├─ POST /schools/:id/approve   (Admin: approve registration)
│  └─ POST /schools/:id/reject    (Admin: reject + reason)
│
├─ schools.service.ts
│  ├─ registerSchool(dto)         (Create SchoolRegistrationDraft)
│  ├─ getSchool(id)               (Fetch complete school profile)
│  ├─ updateSchool(id, dto)       (Update school info)
│  ├─ listPendingSchools()        (Admin: schools awaiting approval)
│  ├─ approveSchool(id)           (Admin: transition PENDING → APPROVED)
│  ├─ rejectSchool(id, reason)    (Admin: transition → REJECTED)
│  └─ getSchoolAdmins(schoolId)   (Fetch users with SCHOOL_ADMIN role)
│
└─ dto/
   ├─ create-school.dto.ts        (Multi-step form data)
   ├─ update-school.dto.ts        (Partial school updates)
   └─ list-schools-filter.dto.ts  (Query parameters)

Key Models:
- School { id, schoolName, province, enrollment, status, ... }
- SchoolRegistrationDraft { email, schoolName, steps, expiresAt }
- SchoolStatus enum { DRAFT, PENDING, APPROVED, ACTIVE, REJECTED, SUSPENDED }
```

#### 3. **Carbon Calculator Module** (`src/carbon-calculator/`)
```
Purpose: Carbon emissions calculation, storage, recommendations

Components:
├─ carbon-calculator.controller.ts
│  ├─ POST /schools/:id/audit               (Submit audit, trigger calc)
│  ├─ GET /audits/:auditId                  (Fetch audit result)
│  ├─ GET /audits/:auditId/recommendations  (Get reduction recommendations)
│  ├─ GET /audits/:auditId/report?format=pdf|excel|csv
│  └─ GET /schools/:id/comparison           (Peer benchmarking)
│
├─ carbon-calculator.service.ts
│  ├─ submitAudit(schoolId, dto)            (Main entry point)
│  ├─ calculateEmissions(inputs, context)   (Trigger calculation)
│  ├─ generateRecommendations(auditId)      (Derive top-3 recommendations)
│  ├─ exportReport(auditId, format)         (Generate PDF/Excel/CSV)
│  └─ getComparison(schoolId)               (Peer stats)
│
├─ engine/
│  ├─ calculation-engine.ts
│  │  ├─ runCalculation(inputs, context)    (Main calculation orchestrator)
│  │  └─ processCategory(category, inputs)  (Per-category calculation)
│  │
│  ├─ category-processors.ts                (9 category-specific logic)
│  │  ├─ electricity: { formula, unitConversion, emissionsFactorKey }
│  │  ├─ generator: { formula, unitConversion, ... }
│  │  ├─ vehicle: { ... }
│  │  ├─ cooking: { ... }
│  │  ├─ refrigerant: { ... }
│  │  ├─ commute: { ... }
│  │  ├─ paper: { ... }
│  │  ├─ food: { ... }
│  │  └─ waste: { ... }
│  │
│  └─ types.ts
│     ├─ AuditContext { enrollment, areaType, province }
│     ├─ CategoryInputs { electricity, generator, vehicle, ... }
│     ├─ CalculationResult { totalEmissions, scope1, scope2, scope3, ... }
│     └─ ActivityData { category, value, unit, tier, emissions }
│
├─ config/
│  ├─ emission-factors.config.ts           (CENTRALIZED CONFIG)
│  └─ Contains: {
│      electricity: { areaType: { province: factor } },
│      generator: { factor },
│      vehicle: { factor },
│      cooking: { factor },
│      refrigerant: { factor },
│      commute: { areaType: factor },
│      paper: { factor },
│      food: { factor },
│      waste: { factor }
│     }
│
└─ dto/
   ├─ submit-audit.dto.ts         (9 activity inputs + metadata)
   ├─ activity-input.ts           (Value, unit, tier, source)
   └─ recommendation.dto.ts

Key Models:
- CarbonAudit { schoolId, academicYear, month, totalEmissions, scope1/2/3, status }
- ActivityData { auditId, category, value, unit, tier, emissions, scope }
- Recommendation { schoolId, category, priority, description, reduction, cost }
- CalculationResult { totalEmissions, breakdown, dataQualitySummary }
```

#### 4. **OMR Module** (`src/omr/`)
```
Purpose: OMR sheet scanning, image processing, CSV parsing

Components:
├─ omr.controller.ts
│  ├─ POST /omr/scan                    (Upload image, get raw data)
│  └─ POST /omr/scan-and-submit         (Scan + auto-submit audit in one step)
│
├─ omr.service.ts
│  ├─ processOmrSheet(file): RawData    (Orchestrate OMRChecker)
│  │  ├─ Write image to temp dir
│  │  ├─ Spawn subprocess: python main.py -i <in> -o <out>
│  │  ├─ Parse output CSV
│  │  └─ Return { rawValues, confidence }
│  │
│  ├─ mapOMRToAudit(rawData): SubmitAuditDto
│  │  ├─ Map CSV columns to 9 categories
│  │  ├─ Validate values
│  │  └─ Infer tier (MEASURED from OMR reading)
│  │
│  └─ validateOMRData(data): ValidationResult
│
└─ temp/                               (Temporary working directory)
   ├─ input/  (Images + template.json)
   └─ output/ (OMRChecker results)

Integration Points:
- OMRChecker (Python subprocess)
- Carbon Calculator Service (for audit submission)
- Prisma (for storing OMR metadata)

Error Handling:
- Image format validation (jpg, png, pdf)
- OMRChecker failure → fallback to manual entry
- CSV parsing errors → detailed user feedback
```

#### 5. **Prisma Module** (`src/prisma/`)
```
Purpose: Centralized database connection & ORM setup

Components:
├─ prisma.service.ts
│  ├─ Extends PrismaClient
│  ├─ Implements OnModuleInit (initialize on app start)
│  ├─ Implements OnModuleDestroy (cleanup on shutdown)
│  └─ Exposes all Prisma operations
│
└─ prisma.module.ts
   └─ Provides PrismaService globally

Usage in Services:
this.prisma.user.findUnique({ where: { id } })
this.prisma.carbonAudit.create({ data: {...} })
this.prisma.$transaction([...])  # Atomic operations
```

### Request-Response Flow Example

```
Client                Frontend              NestJS Backend             PostgreSQL
  │                      │                        │                         │
  ├─ Click "Submit      │                        │                         │
  │  Audit"             │                        │                         │
  │                     │                        │                         │
  │                     ├─ GET /me (verify)     │                         │
  │                     │◄──────────────────────┤                         │
  │                     │ User { schoolId }     │                         │
  │                     │                       │                         │
  │                     ├─ POST /schools/{id}/audit (SubmitAuditDto)
  │                     │                       ├─ Validate schoolId       │
  │                     │                       ├─ Extract CategoryInputs  │
  │                     │                       │                         │
  │                     │                       ├─ Calculate Emissions    │
  │                     │                       │  (runCalculation)       │
  │                     │                       │                         │
  │                     │                       ├─ $transaction {        │
  │                     │                       │   ├─ UPSERT Audit      │
  │                     │                       │   │                     │
  │                     │                       │   ├─ INSERT ActivityData │
  │                     │                       │   │ (9 records)        │
  │                     │                       │   │                    │
  │                     │                       │   └─ UPDATE Audit      │
  │                     │                       │       Status=CALC      │
  │                     │                       │  }                     │
  │                     │                       │                       │
  │                     │◄─ HTTP 200 OK ────────┤                       │
  │                     │ { auditId, totals,    │                       │
  │                     │   breakdown, ... }    │                       │
  │                     │                       │                       │
  │                     ├─ Render dashboard ────│                       │
  │◄─────────────────────│ (charts, totals)     │                       │
  │
```

---

## Frontend Architecture

### State Management (React Context)

#### AuthContext
```jsx
const AuthContext = createContext()

// State
{
  user: User | null,              // { id, email, firstName, role, schoolId }
  isAuthenticated: boolean,
  isLoading: boolean,
  token: string | null,
  refreshToken: string | null
}

// Actions
- login(email, password) → setUser, setToken, localStorage
- register(data) → POST /auth/register → login
- logout() → clear token, clear storage, redirect /
- refreshToken() → POST /auth/refresh → setToken

// Usage
const { user, isAuthenticated } = useContext(AuthContext)
```

#### AppContext
```jsx
const AppContext = createContext()

// State
{
  currentSchool: School | null,   // Selected school for audit
  currentAudit: CarbonAudit | null,
  isLoading: boolean,
  error: Error | null
}

// Actions
- setCurrentSchool(school)
- setCurrentAudit(audit)
- fetchAudit(auditId) → API call → setCurrent
- submitAudit(data) → API call → setCurrentAudit

// Usage
const { currentSchool, currentAudit } = useContext(AppContext)
```

### Component Hierarchy

```
App (Root)
├─ <BrowserRouter>
├─ <AuthProvider>
├─ <AppProvider>
│
├─ <RouteGuards> (RequireAccess / RedirectIfAuth)
│
├─ Public Routes
│  ├─ Landing
│  ├─ Login
│  ├─ SchoolRegister
│  └─ IndividualRegister
│
├─ Authenticated Routes (Protected)
│  ├─ SelectSchool (middleware: school selection)
│  │
│  ├─ RoleSelection (middleware: role picking)
│  │
│  ├─ Student Flows
│  │  ├─ StudentDashboard
│  │  │  ├─ <StatCard> (total emissions, scopes)
│  │  │  ├─ <ChartCard> (pie chart: scope breakdown)
│  │  │  ├─ <InsightCard> (recommendations)
│  │  │  └─ <PetCard> (pet RPG state)
│  │  │
│  │  ├─ PetRPG
│  │  ├─ Achievements
│  │  ├─ Leaderboard
│  │  └─ SchoolForest
│  │
│  ├─ School Admin Flows
│  │  ├─ CarbonDashboard (overview)
│  │  ├─ SchoolDataEntry
│  │  │  ├─ Form (9 categories)
│  │  │  ├─ Tier selector
│  │  │  └─ Submit button
│  │  │
│  │  ├─ SchoolOCRScan
│  │  │  ├─ File upload
│  │  │  ├─ Preview
│  │  │  └─ Confirm
│  │  │
│  │  ├─ SchoolReports
│  │  │  ├─ Report list
│  │  │  ├─ <ReportView> (charts, data)
│  │  │  └─ Export buttons
│  │  │
│  │  ├─ SchoolRecommendations
│  │  │  └─ <RecommendationCard> (list)
│  │  │
│  │  └─ SchoolComparison
│  │     └─ Peer benchmark chart
│  │
│  └─ Super Admin Routes
│     └─ AdminPanel (pending approvals, user mgmt)
│
└─ Layouts
   ├─ AuthLayout (login/register pages)
   ├─ MainLayout (public pages)
   └─ DashboardLayout (authenticated pages with navbar, sidebar)
```

### API Service Layer

```javascript
// src/services/authService.js
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data  // { accessToken, refreshToken, expiresIn }
}

export const register = async (data) => {
  const response = await api.post('/auth/register', data)
  return response.data
}

// src/services/auditService.js
export const submitAudit = async (schoolId, auditData) => {
  const response = await api.post(`/schools/${schoolId}/audit`, auditData)
  return response.data  // { auditId, totalEmissions, ... }
}

export const getAudit = async (auditId) => {
  const response = await api.get(`/audits/${auditId}`)
  return response.data
}

// src/services/omrService.js
export const scanOmr = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/omr/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data  // { rawData, confidence }
}

// src/utils/api.js (Axios instance)
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      // ... refresh logic
    }
    return Promise.reject(error)
  }
)
```

---

## Database Design

### Core Tables & Relationships

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- bcrypt hashed
  firstName VARCHAR,
  lastName VARCHAR,
  role VARCHAR CHECK (role IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'INDIVIDUAL')),
  schoolId UUID REFERENCES schools(id),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY,
  schoolName VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  province VARCHAR,
  areaType VARCHAR,  -- URBAN, PERI_URBAN, RURAL
  schoolType VARCHAR,  -- GOVERNMENT, COMMUNITY, PRIVATE, INTERNATIONAL
  enrollment VARCHAR,  -- UNDER_100, RANGE_100_500, RANGE_500_1000, OVER_1000
  electricity VARCHAR,  -- RELIABLE_GRID, LOAD_SHEDDING, NO_GRID
  internet VARCHAR,  -- RELIABLE, INTERMITTENT, NONE
  status VARCHAR,  -- DRAFT, PENDING, APPROVED, ACTIVE, REJECTED, SUSPENDED
  registrationStatus VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- CarbonAudits
CREATE TABLE carbonAudits (
  id UUID PRIMARY KEY,
  schoolId UUID REFERENCES schools(id) NOT NULL,
  academicYear INT NOT NULL,
  month INT NOT NULL,
  enrollment INT,
  status VARCHAR,  -- DRAFT, SUBMITTED, CALCULATED
  submittedById UUID REFERENCES users(id),
  totalEmissions DECIMAL(15, 2),
  scope1Total DECIMAL(15, 2),
  scope2Total DECIMAL(15, 2),
  scope3Total DECIMAL(15, 2),
  createdAt TIMESTAMP,
  submittedAt TIMESTAMP,
  calculatedAt TIMESTAMP,
  UNIQUE (schoolId, academicYear, month)
);

-- ActivityData (9 per audit)
CREATE TABLE activityData (
  id UUID PRIMARY KEY,
  auditId UUID REFERENCES carbonAudits(id) NOT NULL,
  category VARCHAR NOT NULL,  -- ELECTRICITY, GENERATOR_FUEL, etc.
  scope VARCHAR NOT NULL,  -- SCOPE_1, SCOPE_2, SCOPE_3
  value DECIMAL(15, 4) NOT NULL,
  unit VARCHAR NOT NULL,
  tier VARCHAR NOT NULL,  -- MEASURED, ESTIMATED, DEFAULT
  emissionsFactor DECIMAL(15, 6),
  emissions DECIMAL(15, 2),  -- calculated
  dataSource VARCHAR,  -- Optional notes
  createdAt TIMESTAMP
);

-- Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  schoolId UUID REFERENCES schools(id),
  category VARCHAR,
  priority INT,
  description TEXT,
  estimatedReduction DECIMAL(15, 2),
  implementationCost DECIMAL(15, 2),
  createdAt TIMESTAMP
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  badgeType VARCHAR,
  description VARCHAR,
  earnedAt TIMESTAMP
);

-- AuditLog (compliance)
CREATE TABLE auditLogs (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  action VARCHAR,
  entityType VARCHAR,
  entityId UUID,
  oldValues JSONB,
  newValues JSONB,
  timestamp TIMESTAMP,
  ipAddress VARCHAR
);
```

### Key Indexes

```sql
CREATE INDEX idx_users_schoolId ON users(schoolId);
CREATE INDEX idx_carbonAudits_schoolId ON carbonAudits(schoolId);
CREATE INDEX idx_carbonAudits_schoolId_year_month ON carbonAudits(schoolId, academicYear, month);
CREATE INDEX idx_activityData_auditId ON activityData(auditId);
CREATE INDEX idx_recommendations_schoolId ON recommendations(schoolId);
CREATE INDEX idx_achievements_userId ON achievements(userId);
CREATE INDEX idx_auditLogs_userId ON auditLogs(userId);
CREATE INDEX idx_auditLogs_timestamp ON auditLogs(timestamp);
```

---

## API Endpoints

### Authentication Endpoints

```
POST /api/v1/auth/register
  Body: { email, password, firstName, lastName, role, organization? }
  Returns: { user, accessToken, refreshToken }

POST /api/v1/auth/login
  Body: { email, password }
  Returns: { user, accessToken, refreshToken, expiresIn }

POST /api/v1/auth/refresh
  Body: { refreshToken }
  Returns: { accessToken, refreshToken }

POST /api/v1/auth/logout
  Returns: { message: "Logged out" }

POST /api/v1/auth/password-reset
  Body: { email }
  Returns: { message: "Reset link sent" }
```

### School Endpoints

```
POST /api/v1/schools
  Auth: Required (School Admin)
  Body: { schoolName, email, phone, province, areaType, enrollment, ... }
  Returns: { school }

GET /api/v1/schools/:id
  Returns: { school }

PUT /api/v1/schools/:id
  Body: { schoolName, email, ... }
  Returns: { school }

GET /api/v1/schools?status=PENDING&page=1
  Auth: SUPER_ADMIN
  Returns: { schools: [...], total, page }

POST /api/v1/schools/:id/approve
  Auth: SUPER_ADMIN
  Returns: { school, status: 'APPROVED' }

POST /api/v1/schools/:id/reject
  Auth: SUPER_ADMIN
  Body: { reason }
  Returns: { school, status: 'REJECTED' }
```

### Carbon Audit Endpoints

```
POST /api/v1/schools/:id/audit
  Auth: Required (School Admin)
  Body: SubmitAuditDto {
    academicYear,
    month,
    enrollment?,
    electricity, generator, vehicle, cooking, refrigerant,
    commute, paper, food, waste,
    dataTiers: { electricity: 'MEASURED', ... }
  }
  Returns: { audit, totalEmissions, scope1/2/3, activityBreakdown }

GET /api/v1/audits/:auditId
  Returns: { audit, activityData, recommendations }

GET /api/v1/audits/:auditId/report?format=pdf|excel|csv
  Returns: Binary (file) or { data: [...] }

GET /api/v1/audits/:auditId/recommendations
  Returns: { recommendations: [...] }

GET /api/v1/schools/:id/audits
  Returns: { audits: [...] }

GET /api/v1/schools/:id/comparison
  Returns: { school, peers, benchmark }
```

### OMR Endpoints

```
POST /api/v1/omr/scan
  Content-Type: multipart/form-data
  File: OMR sheet image
  Returns: { rawData, scannedValues, confidence }

POST /api/v1/omr/scan-and-submit
  Content-Type: multipart/form-data
  File: OMR sheet image
  Body: { academicYear, month, schoolId }
  Returns: { audit, totalEmissions, ... }
```

### Gamification Endpoints

```
GET /api/v1/users/:id/achievements
  Returns: { achievements: [...] }

GET /api/v1/users/:id/tasks
  Returns: { tasks: [...] }

POST /api/v1/users/:id/tasks/:taskId/complete
  Returns: { task, points, newLevel }

GET /api/v1/leaderboard?scope=school|regional|national&limit=100
  Returns: { leaderboard: [...] }
```

---

## Development Setup

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 12+
- Python 3.8+ (for OMRChecker)
- Git

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with:
# DATABASE_URL=postgresql://user:password@localhost:5432/copaila
# JWT_SECRET=your-super-secret-key
# PORT=3000

# 4. Generate Prisma client
npm run prisma:generate

# 5. Run migrations
npm run prisma:migrate:dev

# 6. Seed database (optional)
npm run prisma:seed

# 7. Start development server
npm run start:dev
# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd LeafNode

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with:
# VITE_API_URL=http://localhost:3000/api/v1

# 4. Start development server
npm run dev
# Frontend runs on http://localhost:5173

# 5. Build for production
npm run build

# 6. Preview production build
npm run preview
```

### OMRChecker Setup

```bash
# 1. Navigate to OMRChecker
cd OMRChecker

# 2. Create virtual environment
python -m venv venv

# 3. Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Test with sample
python main.py -i samples/sample1 -o output

# 6. Validate templates (optional)
python omr-assets/validate-template.py
```

### Docker Development

```bash
# Build all services
docker-compose build

# Start all services (backend + PostgreSQL)
docker-compose up

# Access:
# - Backend API: http://localhost:3000
# - Frontend: http://localhost:5173
# - PostgreSQL: localhost:5432

# View logs
docker-compose logs -f backend
```

---

## Deployment Guide

### Render.com Deployment

```yaml
# render.yaml (root)
services:
  - type: web
    name: copaila-backend
    runtime: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm run start:prod
    envVars:
      - key: DATABASE_URL
        scope: backend
        value: ${DATABASE_URL}  # Connected Render PostgreSQL
      - key: JWT_SECRET
        scope: backend
        sync: false
      - key: NODE_ENV
        value: production

  - type: web
    name: copaila-frontend
    runtime: node
    buildCommand: cd LeafNode && npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://copaila-backend.onrender.com/api/v1

databases:
  - name: copaila-postgres
    databaseName: copaila
    user: copaila
```

**Deployment Steps:**
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Render auto-deploys on push to main
4. Monitor logs in Render dashboard

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run lint && npm run test
      - run: cd LeafNode && npm install && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: curl https://api.render.com/deploy/srv-xxx?key=${{ secrets.RENDER_DEPLOY_KEY }}
```

---

## Performance & Optimization

### Backend Optimization

1. **Database Queries:**
   - Use Prisma `select` to fetch only needed fields
   - Implement query pagination (limit: 100)
   - Add indexes on foreign keys and frequently filtered columns

2. **Caching:**
   - Cache emission factors in Redis (TTL: 1 day)
   - Cache school list (TTL: 1 hour)
   - Cache user permissions

3. **Compression:**
   - Enable gzip compression (helmet middleware)
   - Minify API responses

4. **Rate Limiting:**
   - 100 requests/minute per IP
   - 1,000 requests/hour per user
   - Protect endpoints: login (10 req/min), upload (5 req/min)

### Frontend Optimization

1. **Code Splitting:**
   - Lazy-load pages with React.lazy()
   - Separate vendor bundle

2. **Image Optimization:**
   - Use WebP format
   - Lazy-load off-screen images

3. **State Management:**
   - Avoid unnecessary re-renders with useMemo, useCallback
   - Context splitting (Auth vs. App)

4. **Bundle Size:**
   - Tree-shake unused dependencies
   - Monitor with `npm run build -- --analyze`

---

## Security Implementation

### Authentication & Authorization

```typescript
// JWT Setup
- Secret: Strong random string (>32 chars)
- Algorithm: HS256
- Expiry: 24 hours (accessToken)
- Refresh: 30 days (refreshToken)

// RBAC Guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN)
submitAudit() { ... }
```

### Data Protection

```typescript
// Password Hashing
bcrypt.hash(password, 10)  // Salt rounds: 10

// Sensitive Data
- Do NOT log passwords, tokens, PII
- Exclude from Swagger docs
- Use @Exclude() decorator for responses
```

### API Security

```typescript
// HTTPS Only
- Helmet middleware
- Strict-Transport-Security header

// CORS
- Allowed origins: frontend domain only
- Credentials: true

// Input Validation
- DTO validation with class-validator
- Sanitization with class-transformer
- File upload: max 10MB, whitelist types

// Rate Limiting
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])

// SQL Injection Prevention
- Prisma prepared statements
- Never concatenate queries
```

---

**Document End**

