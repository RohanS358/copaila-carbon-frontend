# CoPaila Project Documentation Guide

Welcome to the **CoPaila - Carbon Audit Platform for Schools in Nepal** comprehensive documentation suite!

This folder contains all the project documentation needed for understanding, developing, and deploying the CoPaila platform.

---

## 📚 Documentation Index

### 1. **Consolidated_Idea_Document.md** 📋
**Purpose:** Strategic vision and comprehensive project overview  
**Audience:** Project managers, stakeholders, business analysts  
**What You'll Find:**
- Executive summary and problem/opportunity statement
- Target market and users
- Core value propositions
- Technical architecture overview
- Feature roadmap (Phase 1, 2, 3)
- Business model and financial projections
- Success metrics and KPIs
- Risk analysis and mitigation strategies
- Strategic partnerships and growth plan

**When to Read:**
- Understanding the "why" behind the project
- Planning roadmap and prioritization
- Pitching to investors or stakeholders
- Strategic decision-making

**Key Sections:**
- Market opportunity ($Millions available, 5,000+ schools)
- 3-phase rollout strategy (MVP → Scale → Ecosystem)
- Unit economics and sustainability path

---

### 2. **LeafNode_SRS.md** 📝
**Purpose:** Detailed software requirements specification  
**Audience:** Business analysts, QA teams, developers  
**What You'll Find:**
- Functional requirements (FR-AUTH, FR-SCHOOL, FR-AUDIT, etc.)
- Non-functional requirements (performance, security, scalability)
- Use cases and user stories
- Data requirements and retention policies
- API endpoints specification
- Acceptance criteria and testing scenarios
- UAT test cases
- Future enhancement ideas

**When to Read:**
- Planning sprints and breaking down features
- Understanding feature requirements in detail
- Writing test cases for QA
- Acceptance criteria for development

**Key Sections:**
- 9 Activity Categories for carbon calculation
- 3-Tier Confidence Model (Measured/Estimated/Default)
- Role-Based Access Control (RBAC) definitions
- Data retention policies (10+ years for audits)

---

### 3. **Project_Architecture_Implementation_Guide.md** 🏗️
**Purpose:** Comprehensive technical architecture and development guide  
**Audience:** Developers, DevOps engineers, architects  
**What You'll Find:**
- Complete project folder structure
- Technology stack details (Node.js, React, PostgreSQL, Prisma)
- Backend module organization (Auth, Schools, Carbon Calculator, OMR, etc.)
- Frontend component hierarchy and state management
- Database schema with ER relationships
- API endpoints reference
- Development environment setup
- Docker and deployment configuration
- Performance optimization strategies
- Security implementation details

**When to Read:**
- Setting up your development environment
- Understanding codebase structure and modules
- Contributing code to the project
- Deploying to production
- Optimizing performance

**Key Sections:**
- Backend modular architecture (5 main modules)
- Frontend React Context setup (Auth + App)
- PostgreSQL schema with 8 core tables
- Docker development and Render.com deployment
- Security: JWT, RBAC, HTTPS, input validation

---

## 🎨 Diagrams (PlantUML Format)

All diagrams use **PlantUML** syntax and can be rendered with:
- [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
- VS Code extension: PlantUML (by jebbs)
- Local PlantUML command: `plantuml diagram.puml`

### 4. **LeafNode_ActivityDiagram.puml** 🔄
**Purpose:** User workflows and business processes  
**Shows:** End-to-end activities from landing page → login → audit submission → results
**Swimlanes:**
- Student/User
- School Admin
- Backend System

**Use Cases Covered:**
- School registration flow
- Manual data entry
- OMR scanning
- Gamification participation

---

### 5. **LeafNode_UseCase Diagram.puml** 👥
**Purpose:** All system use cases and user interactions  
**Actors:**
- Guest (public)
- Individual User
- School Admin
- Teacher
- Student
- System Admin (Super Admin)

**Use Cases (38 total):**
- Registration, Authentication
- School Management
- Carbon Audit (Manual & OMR)
- Calculation & Reporting
- Recommendations
- Gamification
- System Administration

**Key:** Shows which actors perform which use cases and dependencies

---

### 6. **LeafNode_ClassDiagram.puml** 🏛️
**Purpose:** Domain model and class relationships  
**Shows:**
- Database Models (User, School, CarbonAudit, ActivityData, etc.)
- Service Layer (AuthService, SchoolsService, CarbonCalculatorService, etc.)
- Controller Layer
- React Frontend Components
- Context structures

**Relationships:**
- Inheritance, composition, associations
- Cardinality (1:1, 1:many, many:many)

**Key Entities:**
- 8 core database tables
- 5 backend modules
- 10+ React components

---

### 7. **LeafNode_ERDiagram.puml** 🗄️
**Purpose:** Database entity relationships and attributes  
**Entities:**
- User (authentication)
- School (institution profile)
- CarbonAudit (emissions record)
- ActivityData (9 categories)
- Recommendation
- Achievement
- StudentTask
- LeaderboardEntry
- AuditLog

**Key Relationships:**
- User → School (many:one)
- School → CarbonAudit (one:many)
- CarbonAudit → ActivityData (one:many, 9 per audit)
- User → Achievement (one:many)

**Constraints:**
- Unique: (schoolId, academicYear, month) on CarbonAudit
- Foreign keys on all relationships

---

### 8. **LeafNode_SequenceDiagram.puml** 📊
**Purpose:** Detailed interaction flow for carbon audit submission  
**Scenario:** School Admin submits carbon audit (manual data entry)
**Actors:**
- School Admin (UI)
- Frontend React
- Auth Guard (Middleware)
- Schools Controller
- Carbon Calculator Service
- Prisma ORM
- PostgreSQL Database
- OMRChecker Service

**Key Interactions:**
1. Form validation (9 categories)
2. JWT token verification
3. School context extraction (enrollment, area type)
4. Calculate emissions (Scopes 1/2/3)
5. Atomic database transaction (upsert audit, insert activities, update status)
6. Return calculated results

**Notes:** Shows how each layer processes and validates data

---

### 9. **LeafNode_DFD_Level0.puml** 🌍
**Purpose:** High-level system context (Level 0 DFD)  
**Shows:**
- External entities (School Admin, Student, System Admin, OMRChecker)
- Single process box: "CoPaila Platform"
- Data store: PostgreSQL Database
- Data flows between all entities

**Use Case:** Big-picture overview of what system does and who interacts with it

---

### 10. **LeafNode_DFD_Level1.puml** 🔍
**Purpose:** Main system processes (Level 1 DFD)  
**Shows 7 main processes:**
1. Authentication & Authorization
2. School Registration & Management
3. Carbon Audit Data Collection
4. OMR Sheet Processing
5. Carbon Calculation
6. Report & Analytics Generation
7. User Engagement & Gamification

**Data Flows:**
- Between external entities and processes
- Between processes
- To/from data stores

**Stores:** 6 data stores (User, School, Audit, Factors, Reports, Achievements)

---

### 11. **LeafNode_DFD_Level2.puml** ⚙️
**Purpose:** Detailed carbon calculation subprocess (Level 2 DFD)  
**Shows detailed breakdown of Process 5 (Carbon Calculation):**
1. Prepare Audit Context (enrollment, area type, province)
2. Extract Category Inputs (9 categories)
3. Calculate Scope 1 (Direct: Generator, Vehicle, Cooking, Refrigerant)
4. Calculate Scope 2 (Energy: Electricity)
5. Calculate Scope 3 (Indirect: Commute, Paper, Food, Waste)
6. Aggregate Results & Store Activities
7. Generate Summary Report

**Data Flows:**
- School profile data
- Activity records
- Emission factors lookup
- Calculation results
- Final aggregated totals

**Key:** Shows how 9 categories map to 3 scopes

---

## 🚀 Quick Start Guide

### For Business/Product Team
1. Start with: **Consolidated_Idea_Document.md** (Strategic overview)
2. Then read: **LeafNode_SRS.md** (Functional requirements)
3. Reference: **LeafNode_UseCase Diagram.puml** (User interactions)

### For Developers (New to Project)
1. Start with: **Project_Architecture_Implementation_Guide.md** (Setup)
2. Review: **LeafNode_ClassDiagram.puml** (Code structure)
3. Follow: **Development Setup** section (Get environment running)
4. Study: **LeafNode_DFD_Level1.puml** (Processes)
5. Code: Start with the **Backend** module that interests you

### For QA/Testing Team
1. Read: **LeafNode_SRS.md** (Sections 2-7: functional requirements)
2. Review: **LeafNode_UseCase Diagram.puml** (All use cases)
3. Study: **Activity Diagram** (Workflows to test)
4. Use: **Section 7 in SRS** (UAT test scenarios)

### For DevOps/Infrastructure
1. Review: **Project_Architecture_Implementation_Guide.md** (Tech stack & deployment)
2. Check: **Section 8** (Deployment guide to Render.com)
3. Follow: **GitHub Actions CI/CD** (Automated testing & deployment)
4. Setup: **Docker** configuration in root folder

### For Architects/Reviewers
1. High-level: **Consolidated_Idea_Document.md** (Vision & roadmap)
2. Technical: **Project_Architecture_Implementation_Guide.md** (Stack & design)
3. Data: **LeafNode_ERDiagram.puml** (Schema)
4. Flows: **DFD Level 0, 1, 2** (Processes)
5. Details: **LeafNode_SRS.md** (Requirements validation)

---

## 📖 How to Use These Documents

### Reading Diagrams

**PlantUML diagrams** can be viewed in several ways:

1. **Online (Recommended):**
   - Copy .puml file contents
   - Paste into http://www.plantuml.com/plantuml/uml/
   - View rendered diagram instantly

2. **VS Code:**
   - Install "PlantUML" extension (by jebbs)
   - Open .puml file
   - Right-click → "Preview Current Diagram"

3. **Command Line:**
   ```bash
   # Install PlantUML
   brew install plantuml  # macOS
   # or apt-get install plantuml  # Linux

   # Generate PNG
   plantuml LeafNode_ActivityDiagram.puml

   # Generates: LeafNode_ActivityDiagram.png
   ```

4. **Export to PDF:**
   - Use PlantUML online editor
   - Click "Export" → "PDF"

### Keeping Documents Updated

**Important:** Keep documentation synchronized with code changes.

When you:
- Add a new API endpoint → Update **LeafNode_SRS.md** (API Endpoints section)
- Change database schema → Update **LeafNode_ERDiagram.puml** and **Project_Architecture_Implementation_Guide.md**
- Modify a workflow → Update **LeafNode_ActivityDiagram.puml**
- Add a new feature → Update **LeafNode_UseCase Diagram.puml**

---

## 🔗 Document Dependencies & Reading Order

```
START HERE (Choose your role)
    ├─ Product Manager
    │  └─ Consolidated_Idea_Document.md
    │     └─ LeafNode_SRS.md
    │        └─ Project_Architecture_Implementation_Guide.md
    │
    ├─ Developer
    │  └─ Project_Architecture_Implementation_Guide.md
    │     ├─ LeafNode_ClassDiagram.puml
    │     ├─ LeafNode_ERDiagram.puml
    │     └─ (Code setup + start coding)
    │
    ├─ QA Engineer
    │  └─ LeafNode_SRS.md
    │     ├─ LeafNode_UseCase Diagram.puml
    │     ├─ LeafNode_ActivityDiagram.puml
    │     └─ (Plan test cases)
    │
    ├─ Architect
    │  ├─ Consolidated_Idea_Document.md
    │  ├─ Project_Architecture_Implementation_Guide.md
    │  ├─ LeafNode_DFD_Level0.puml
    │  ├─ LeafNode_DFD_Level1.puml
    │  ├─ LeafNode_ERDiagram.puml
    │  └─ LeafNode_ClassDiagram.puml
    │
    └─ DevOps Engineer
       └─ Project_Architecture_Implementation_Guide.md
          ├─ (Setup & Deployment section)
          └─ (GitHub Actions CI/CD)
```

---

## 📊 Project Summary

### What is CoPaila?
A **cloud-based carbon audit platform** for schools in Nepal that enables:
- Accurate emissions measurement (GHG Protocol compliant)
- Data collection via manual entry or OMR scanning
- Transparent data quality (3-tier confidence model)
- Automated recommendations for emissions reduction
- Student engagement through gamification

### Key Numbers
- **Market:** 5,000+ schools in Nepal
- **Categories:** 9 activity types (electricity, fuel, waste, etc.)
- **Scopes:** GHG Protocol Scopes 1, 2, 3
- **Users:** 5+ role types (Super Admin → Student)
- **Features:** 38 use cases
- **Tables:** 8+ database entities
- **Modules:** 5 backend + 8+ frontend

### Technology
- **Backend:** NestJS + Node.js + PostgreSQL + Prisma
- **Frontend:** React 18 + Vite + Tailwind CSS
- **OMR:** Python OMRChecker (subprocess integration)
- **Deployment:** Docker + Render.com + GitHub Actions

### Current Status (Phase 1 - MVP)
- ✅ User authentication & RBAC
- ✅ School registration & management
- ✅ Manual carbon data entry (9 categories)
- ✅ OMR sheet scanning
- ✅ Carbon calculation engine (Scopes 1/2/3)
- ✅ Basic reporting & recommendations
- ✅ Gamification (Pet RPG, achievements)
- ⏳ Advanced features (Phase 2+)

---

## 🤝 Contributing

When contributing to CoPaila:

1. **Read:** Relevant sections of **Project_Architecture_Implementation_Guide.md**
2. **Understand:** Related diagrams (.puml files)
3. **Check:** Requirements in **LeafNode_SRS.md**
4. **Code:** Following project conventions
5. **Update:** Relevant documentation if making changes
6. **Test:** According to UAT scenarios in SRS

---

## 📞 Questions & Support

For questions about:
- **What the project does** → Read Consolidated_Idea_Document.md
- **How to build it** → Read Project_Architecture_Implementation_Guide.md
- **What to build** → Read LeafNode_SRS.md
- **How components interact** → Study the diagrams
- **Database schema** → Check LeafNode_ERDiagram.puml

---

## 📅 Document Versions & Updates

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| Consolidated_Idea_Document.md | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_SRS.md | 1.0 | June 24, 2026 | ✅ Current |
| Project_Architecture_Implementation_Guide.md | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_ActivityDiagram.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_UseCase Diagram.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_ClassDiagram.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_ERDiagram.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_SequenceDiagram.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_DFD_Level0.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_DFD_Level1.puml | 1.0 | June 24, 2026 | ✅ Current |
| LeafNode_DFD_Level2.puml | 1.0 | June 24, 2026 | ✅ Current |

---

## 🎯 Next Steps

After reviewing documentation:

1. **Setup Development Environment**
   ```bash
   cd backend && npm install && npm run prisma:migrate:dev
   cd ../LeafNode && npm install
   npm run dev  # Start dev servers
   ```

2. **Explore the Codebase**
   - Start in `backend/src/app.module.ts` (module definitions)
   - Review `LeafNode/src/App.jsx` (frontend routing)
   - Check `backend/prisma/schema.prisma` (database schema)

3. **Make Your First Contribution**
   - Pick a use case from LeafNode_UseCase Diagram.puml
   - Find related requirements in LeafNode_SRS.md
   - Follow architecture in Project_Architecture_Implementation_Guide.md
   - Code with TypeScript + NestJS (backend) or React (frontend)

4. **Write Tests**
   - Unit tests in `backend/test/` and `LeafNode/src/__tests__/`
   - Follow Jest/Vitest conventions
   - Aim for 80%+ code coverage

5. **Submit for Review**
   - Create PR with clear description
   - Link to related SRS sections
   - Reference diagrams if needed
   - Request code review from team

---

**Happy coding! Welcome to the CoPaila project! 🌍💚**

