# CoPaila - Software Requirement Specification (SRS)

**Document Version:** 1.0  
**Project Name:** CoPaila - Carbon Audit Platform for Schools  
**Last Updated:** June 24, 2026  
**Document Type:** Functional Specification

---

## Executive Summary

**CoPaila** is a comprehensive carbon audit platform designed for schools in Nepal to measure, track, and reduce their greenhouse gas (GHG) emissions in alignment with the GHG Protocol. The platform combines manual data entry, Optical Mark Recognition (OMR) scanning, and a sophisticated three-tier confidence model to ensure data quality and encourage school-wide participation through gamification.

### Key Objectives
- Enable schools to accurately measure carbon emissions across three GHG scopes
- Provide actionable recommendations for emissions reduction
- Engage students in climate action through gamified tasks and leaderboards
- Support multi-level data collection (measured, estimated, default) with clear confidence indicators
- Streamline data collection through OMR sheet scanning technology

---

## 1. Project Overview

### 1.1 Problem Statement

Schools in Nepal lack systematic tools to measure and reduce their carbon footprint. Existing solutions are either too complex, expensive, or not adapted to the Nepali school context (infrastructure limitations, language preferences, regional variations in electricity grids).

### 1.2 Solution Overview

CoPaila provides:
1. **Multi-channel data entry** (manual forms + OMR scanning)
2. **Automatic carbon calculation** using GHG Protocol and regional emission factors
3. **Three-tier confidence system** (Measured→Estimated→Default) for transparent data quality
4. **Student engagement** via gamification (Pet RPG, achievements, leaderboards)
5. **Peer comparison & recommendations** for emissions reduction
6. **Mobile-friendly OMR scanning** for large-scale data collection

### 1.3 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Carbon audit calculation (Scopes 1, 2, 3) | Carbon credit/offset marketplace |
| School registration & management | External API integrations (e.g., weather data) |
| Manual & OMR data collection | Advanced AI recommendations |
| Emissions reporting | Third-party certifications |
| Gamification features | Mandatory compliance enforcement |
| Multi-language support (Nepali/English) | Integration with government reporting systems |

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization (FR-AUTH)

#### FR-AUTH-001: User Registration
- **Description:** Users can register as School Admin or Individual
- **Actors:** Guest, School Admin, Researcher/NGO
- **Preconditions:** User has valid email address
- **Steps:**
  1. User navigates to registration page
  2. Selects registration type (School or Individual)
  3. Fills required fields (email, password, organization)
  4. System validates email uniqueness
  5. Sends verification email
  6. User confirms email and account is created
- **Postconditions:** User account created with appropriate role
- **Acceptance Criteria:**
  - Email validation enforced
  - Password requirements: min 8 chars, 1 uppercase, 1 number
  - Duplicate email prevention
  - Email verification sent within 5 seconds
  - Account lockout after 5 failed login attempts

#### FR-AUTH-002: User Login
- **Description:** Registered users can authenticate with email and password
- **Token Management:** JWT tokens with 24-hour expiry
- **Refresh Tokens:** 30-day rolling expiry
- **MFA Support:** Optional TOTP for school admins (future phase)

#### FR-AUTH-003: Role-Based Access Control (RBAC)
- **Roles:**
  - `SUPER_ADMIN`: Full system access, approve schools, manage all users
  - `SCHOOL_ADMIN`: Manage school profile, submit audits, manage school users
  - `TEACHER`: View audit data, enter activity data, view dashboard
  - `STUDENT`: View dashboards, participate in gamification
  - `INDIVIDUAL`: Register independently, view personal progress
- **Permission Enforcement:** Applied at controller level via decorators

#### FR-AUTH-004: Session Management
- **Logout:** Invalidates JWT token
- **Idle Timeout:** 30 minutes of inactivity
- **Multi-device:** Users can be logged in from multiple devices simultaneously

---

### 2.2 School Management (FR-SCHOOL)

#### FR-SCHOOL-001: School Registration
- **Workflow:** Multi-step form with draft auto-save
- **Required Fields (Step 1 - Identity):**
  - School name (required)
  - Contact person name (required)
  - Contact role: Principal / Teacher / Administrator / Other
  - Contact email (required, validated for uniqueness)
  - Contact phone (required)

- **Required Fields (Step 2 - Location):**
  - Province (dropdown: 7 Nepali provinces)
  - District (dependent dropdown)
  - Municipality (dependent dropdown)
  - GPS coordinates (optional, for future mapping)
  - Address (text)
  - Area type: Urban / Peri-urban / Rural

- **Required Fields (Step 3 - School Profile):**
  - School type: Government / Community / Private / International
  - Enrollment range: <100 / 100-500 / 500-1000 / >1000
  - Electricity availability: Reliable Grid / Load Shedding / No Grid
  - Internet connectivity: Reliable / Intermittent / None
  - Preferred language: Nepali / English
  - Admission year (integer year)

- **Acceptance Criteria:**
  - Draft saves every 30 seconds
  - Incomplete registrations expire after 30 days
  - Email uniqueness enforced
  - Phone number format validated
  - GPS coordinates validated if provided

#### FR-SCHOOL-002: School Status Lifecycle
```
DRAFT → PENDING → (APPROVED → ACTIVE) or REJECTED or SUSPENDED
```
- **DRAFT:** Multi-step registration incomplete
- **PENDING:** Submitted, awaiting super admin approval
- **APPROVED:** Approved by super admin, can login
- **ACTIVE:** Has submitted at least one carbon audit
- **REJECTED:** Registration rejected with reason
- **SUSPENDED:** Temporarily suspended (e.g., for data quality issues)

#### FR-SCHOOL-003: School Profile Management
- School admin can update school details (except email after approval)
- Change history tracked in audit logs
- Offline mode supported for editing (sync on reconnect)

#### FR-SCHOOL-004: School User Management
- School admin can invite teachers via email
- Teachers accept invitation to join school
- School admin can remove users
- Users can leave school voluntarily

---

### 2.3 Carbon Audit Data Collection (FR-AUDIT)

#### FR-AUDIT-001: Manual Data Entry
- **Activity Categories (9 total):**
  
  | Category | Scope | Unit | Description |
  |----------|-------|------|-------------|
  | Electricity | 2 | kWh | Grid electricity consumption |
  | Generator Fuel | 1 | Liters | Diesel/Petrol for backup generators |
  | Vehicle Fuel | 1 | Liters | School-owned vehicle fuel |
  | Cooking Fuel | 1 | Liters | LPG for kitchen/canteen |
  | Refrigerant | 1 | kg | AC/Refrigeration leakage |
  | Commute | 3 | Person-km | Student & staff commuting |
  | Paper | 3 | kg | Paper & stationery |
  | Food | 3 | kg | Meals served (hostel/canteen) |
  | Waste | 3 | kg | Solid waste to landfill |

- **Data Entry Flow:**
  1. School admin navigates to "School Data Entry"
  2. Selects academic year and month
  3. For each category:
     - Enters value (non-negative decimal)
     - Selects unit (provided dropdown)
     - Selects data tier (Measured/Estimated/Default)
     - Optionally adds data source note
  4. System validates inputs
  5. Saves as draft
  6. Submits for calculation

#### FR-AUDIT-002: Data Tier Selection (3-Tier Confidence Model)
- **Tier 1 (MEASURED - Green):**
  - Source: Utility bills, receipts, headcount records
  - Confidence: Highest
  - Example: kWh from electricity bill
  
- **Tier 2 (ESTIMATED - Yellow):**
  - Source: Proxy questions (staff headcount × commute distance)
  - Confidence: Medium
  - Example: Total commute = 50 staff × 10 km average
  
- **Tier 3 (DEFAULT - Red):**
  - Source: National/regional fallback average
  - Confidence: Lowest
  - Example: Average waste per capita per region

- **Visual Indicators:** Color-coded (green/yellow/red) throughout platform

#### FR-AUDIT-003: OMR Sheet Scanning
- **OMR Form Design:**
  - Generated from single source template
  - All 9 activity categories on one A4/Legal sheet
  - Bubble layout: circles for numeric digits, MCQs, Yes/No
  - Printable from LeafNode frontend (SVG export)
  
- **Data Capture Flow:**
  1. School admin or teacher uploads OMR sheet image (camera/scanner)
  2. Backend calls Python OMRChecker in-process
  3. OMRChecker decodes bubble positions
  4. Returns CSV with decoded values
  5. Platform maps CSV to category inputs
  6. Displays preview for confirmation
  7. School admin confirms tier and data source for each field
  8. Data saved and ready for calculation
  
- **OMRChecker Integration:**
  - Spawned as subprocess per request
  - Input: image + template.json
  - Output: Results/Results_*.csv
  - Processing speed: 200+ OMRs/minute
  - Accuracy: ~90% on mobile images, ~100% on scanned sheets

#### FR-AUDIT-004: Audit Submission & Calculation
- **Submission Triggers Calculation:**
  1. School admin clicks "Submit & Calculate"
  2. System validates all 9 categories are present
  3. Creates/updates CarbonAudit record
  4. Triggers calculation engine
  5. Stores results (emissions by scope & category)
  6. Generates recommendations
  7. Returns summary to UI
  
- **Idempotency:** Re-submitting same academic year/month overwrites previous audit

#### FR-AUDIT-005: Audit Status Tracking
```
DRAFT → SUBMITTED → CALCULATED
```
- **DRAFT:** User has started but not submitted
- **SUBMITTED:** User submitted, calculation in progress or complete
- **CALCULATED:** Results calculated and stored

#### FR-AUDIT-006: Audit History
- Users can view all past audits for a school
- Sort by academic year and month
- View emissions trends over time
- Re-download or re-export past reports

---

### 2.4 Carbon Calculation Engine (FR-CALC)

#### FR-CALC-001: Calculation Context
- **School Profile Integration:**
  - Enrollment (from school or user input)
  - Area type (Urban/Peri-urban/Rural)
  - Province (determines grid emission factor)
  - Academic year and month
  
- **Emission Factor Lookup:**
  - Factors depend on category, area type, and province
  - Configured centrally in `emission-factors.config`
  - Support for future regional/temporal variations

#### FR-CALC-002: Scope 1 Emissions (Direct Combustion)
- **Categories:** Generator Fuel, Vehicle Fuel, Cooking Fuel, Refrigerant
- **Formula:** `Emissions = Value × EmissionsFactor`
- **Example:** 100 liters diesel × 2.68 kg CO2/liter = 268 kg CO2

#### FR-CALC-003: Scope 2 Emissions (Indirect Energy)
- **Category:** Electricity
- **Formula:** `Emissions = kWh × GridEmissionFactor[province][areaType]`
- **Regional Variation:**
  - Higher in coal-heavy grids
  - Lower in hydro-dependent grids (Nepal specificity)
- **Example:** 1000 kWh × 0.5 kg CO2/kWh = 500 kg CO2

#### FR-CALC-004: Scope 3 Emissions (Value Chain Indirect)
- **Categories:** Commute, Paper, Food, Waste
- **Formula:** `Emissions = Quantity × EmissionsFactor[category]`
- **Commute Special Case:**
  - Proxy from staff headcount + average commute distance
  - Or direct person-km entry
- **Example:** 5000 person-km × 0.1 kg CO2/km = 500 kg CO2

#### FR-CALC-005: Aggregation & Result Storage
1. **Per-Activity Storage:**
   - Each of 9 categories saved as ActivityData record
   - Includes: category, scope, value, tier, factor, emissions, dataSource

2. **Aggregated Totals:**
   - scope1Total = sum of all Scope 1 emissions
   - scope2Total = sum of all Scope 2 emissions
   - scope3Total = sum of all Scope 3 emissions
   - totalEmissions = scope1Total + scope2Total + scope3Total

3. **CarbonAudit Header Updated:**
   - Status set to CALCULATED
   - Totals persisted
   - Timestamp recorded

#### FR-CALC-006: Calculation Accuracy
- All calculations use Decimal (not Float) for precision
- Rounding: 2 decimal places in display, full precision in storage
- Validation: No negative emissions allowed

---

### 2.5 Recommendations Engine (FR-REC)

#### FR-REC-001: Automated Recommendations
- **Trigger:** After audit calculation
- **Process:**
  1. Rank categories by emissions (highest first)
  2. For top-3 categories, generate recommendations
  3. Estimate potential reduction (% based on best-in-class peers)
  4. Estimate implementation cost (if available)
  5. Prioritize by impact/cost ratio

#### FR-REC-002: Recommendation Content
- **For Electricity (Scope 2):** LED retrofits, solar panels, energy audits
- **For Fuel (Scope 1):** Switch to renewable energy, upgrade equipment efficiency
- **For Commute (Scope 3):** Promote cycling, carpooling, public transport
- **For Food/Waste (Scope 3):** Local sourcing, composting, waste reduction
- **For Paper (Scope 3):** Digital documents, double-sided printing, recycling

#### FR-REC-003: Peer Comparison
- **Benchmarking:**
  - Compare school's per-capita emissions to similar schools
  - Similar = same province + area type + enrollment range
  - Display: "Your school: 2.5 kg CO2/student, Peer average: 2.1 kg CO2/student"

---

### 2.6 Reporting & Analytics (FR-REPORT)

#### FR-REPORT-001: Audit Report Generation
- **Contents:**
  - School name, academic year, month
  - Total emissions (CO2 equivalent)
  - Breakdown by scope (1/2/3)
  - Breakdown by category (9 categories)
  - Data tier summary (% Measured/Estimated/Default)
  - Peer comparison
  - Top 3 recommendations
  - Trend chart (if historical data available)

#### FR-REPORT-002: Report Export
- **Formats:** PDF, Excel, CSV
- **PDF:** Printable with charts and logos
- **Excel:** Raw data with formulas for further analysis
- **CSV:** For data integration with other tools

#### FR-REPORT-003: Dashboard Visualization
- **Charts:**
  - Pie chart: Scope breakdown (1/2/3)
  - Stacked bar chart: Category contributions
  - Color-coded data tier indicator
  - Trend sparkline (month-over-month if available)
- **Real-time Updates:** Dashboard refreshes on audit submission

#### FR-REPORT-004: Historical Trends
- Compare emissions across multiple audits
- Identify seasonal patterns
- Track impact of interventions over time

---

### 2.7 Gamification (FR-GAME)

#### FR-GAME-001: Pet RPG
- **Concept:** Pet's health improves with school's carbon actions
- **Pet States:**
  - Hungry (low engagement)
  - Happy (active participation)
  - Thriving (consistent improvements)
- **Integration:**
  - Complete carbon audit → Pet gains experience
  - Reach emissions target → Pet evolves
  - Miss deadline → Pet loses health

#### FR-GAME-002: Achievement Badges
- **Badge Categories:**
  - First Audit (complete first carbon audit)
  - Data Master (all 9 categories with Tier 1 data)
  - Eco Champion (emissions reduced by 10%)
  - Green Leader (school in top 10% emissions reduction)
  - Community Helper (participated in peer comparisons)

- **Reward:** Badges display on profile, contribute to leaderboard score

#### FR-GAME-003: Student Leaderboard
- **Ranking Metrics:**
  - Points earned from completed tasks
  - Badges collected
  - Audit participation
- **Scope:**
  - School leaderboard (within-school ranking)
  - Regional leaderboard (across similar schools)
  - National leaderboard (all schools)
- **Frequency:** Updated daily
- **Privacy:** Only student names displayed, no sensitive data

#### FR-GAME-004: School Forest Visualization
- **Concept:** School plants a virtual tree for each audit submitted
- **Growth:** Tree grows with emissions reduction
- **Community:** Display schools' forests in a shared virtual garden
- **Inspirational:** Visual reward for participation

#### FR-GAME-005: Task Management
- **Task Types:**
  - Daily: Small actions (e.g., "Log today's electricity usage")
  - Weekly: Medium actions (e.g., "Complete one category")
  - Monthly: Large actions (e.g., "Submit full audit")
  - Challenges: Time-limited events (e.g., "Reduce waste by 20%")

- **Point System:**
  - Daily tasks: 5-10 points
  - Weekly tasks: 20-30 points
  - Monthly tasks: 50-100 points
  - Challenges: Variable (10-500 points)

---

### 2.8 Admin Panel (FR-ADMIN)

#### FR-ADMIN-001: School Approval Workflow
- Super admin views pending school registrations
- Reviews school information
- Approve: Create school admin account, send welcome email
- Reject: Send rejection reason via email, allow re-registration
- Suspend: Temporarily block access (audit quality issues)

#### FR-ADMIN-002: User Management
- Create, update, delete users manually
- Reset user passwords
- Assign/change roles
- View user activity logs

#### FR-ADMIN-003: System Configuration
- Edit emission factors (centrally managed)
- Configure achievement rules and point values
- Set tier weightings (impact on recommendations)
- Configure regional parameters

#### FR-ADMIN-004: Audit Logs
- Track all user actions (login, data entry, submission)
- Log all data changes (old value → new value)
- Log system actions (calculations, recommendations)
- Searchable by user, entity type, date range
- Retention: Minimum 1 year

#### FR-ADMIN-005: System Health Dashboard
- Database status
- OMRChecker service status
- API response times
- User activity summary
- Error rate monitoring

---

## 3. Non-Functional Requirements

### 3.1 Performance (NFR-PERF)

| Requirement | Target |
|-------------|--------|
| Page load time (Dashboard) | < 2 seconds |
| Audit submission | < 5 seconds |
| Report generation | < 10 seconds (PDF), < 3 seconds (CSV) |
| OMR processing | 200+ sheets/minute |
| Database query response | < 100ms (p95) |
| API response time | < 500ms (p95) |
| Concurrent users | 1,000+ simultaneous |

### 3.2 Scalability (NFR-SCALE)

- **Horizontal Scaling:** Backend stateless, deployable on multiple instances
- **Database:** PostgreSQL optimized for read-heavy queries
- **Caching:** Redis cache for emission factors and reference data
- **CDN:** Static assets served from CDN (charts, images, fonts)

### 3.3 Security (NFR-SEC)

- **Authentication:** JWT with 24-hour expiry
- **Authorization:** Role-based access control (RBAC)
- **Encryption:** HTTPS for all traffic (TLS 1.3+)
- **Data at Rest:** Database encryption (PostgreSQL pgcrypto)
- **Password:** Bcrypt with salt, min 8 chars, complexity enforced
- **Rate Limiting:** 100 requests/minute per IP
- **CORS:** Strict origin validation
- **Input Validation:** All inputs validated and sanitized
- **SQL Injection Prevention:** Prepared statements (Prisma)
- **CSRF Protection:** CSRF tokens on state-changing operations
- **Session Security:** HttpOnly, Secure, SameSite cookies

### 3.4 Reliability (NFR-REL)

- **Uptime:** 99.5% availability SLA
- **Backup:** Daily automated database backups, 30-day retention
- **Disaster Recovery:** RTO 1 hour, RPO 15 minutes
- **Error Handling:** Graceful degradation, informative error messages
- **Monitoring:** Real-time alerting for critical errors

### 3.5 Usability (NFR-USE)

- **Mobile Responsive:** Works on smartphones, tablets, desktops
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Language Support:** Nepali and English interfaces
- **Offline Mode:** Limited functionality available without connection
- **Intuitive Navigation:** Breadcrumbs, clear CTAs, error messages

### 3.6 Maintainability (NFR-MAINT)

- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **Test Coverage:** Minimum 80% unit test coverage
- **Documentation:** API docs (Swagger), code comments, README
- **Deployment:** Automated CI/CD pipeline (GitHub Actions)
- **Monitoring:** Application Performance Monitoring (APM)

### 3.7 Compatibility (NFR-COMPAT)

- **Browser Support:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
  - Mobile browsers (iOS Safari 14+, Chrome Android 90+)

- **Backend:** Node.js 18+ LTS, PostgreSQL 12+

---

## 4. Data Requirements

### 4.1 Database Schema

#### Core Entities
- **User** (id, email, password, firstName, lastName, role, schoolId, createdAt, updatedAt)
- **School** (id, schoolName, province, areaType, schoolType, enrollment, electricity, internet, language, status, createdAt, updatedAt)
- **CarbonAudit** (id, schoolId, academicYear, month, enrollment, totalEmissions, scope1Total, scope2Total, scope3Total, status, createdAt, submittedAt, calculatedAt)
- **ActivityData** (id, auditId, category, scope, value, unit, tier, emissionsFactor, emissions, dataSource, createdAt)
- **Recommendation** (id, schoolId, category, priority, description, estimatedReduction, implementationCost, createdAt)
- **Achievement** (id, userId, badgeType, description, earnedAt)
- **AuditLog** (id, userId, action, entityType, entityId, oldValues, newValues, timestamp, ipAddress)

### 4.2 Data Retention

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| User Account | Duration of use + 6 months | Soft delete, data retained for analytics |
| School Registration | Active + 5 years | Historical schools archived annually |
| Carbon Audits | 10 years minimum | Regulatory compliance |
| Activity Data | 10 years minimum | Component of audit records |
| Audit Logs | 3 years | Compliance, security investigation |
| Session Data | 30 days | Inactive sessions cleaned up |

### 4.3 Data Export

- Schools can export their own audit data
- Super admin can export all school data (anonymized)
- Format: CSV, Excel, JSON
- Data classification: Public (school profile), Internal (audit data), Confidential (auth, IP logs)

---

## 5. External Interfaces

### 5.1 RESTful API Endpoints

#### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/password-reset
```

#### Schools
```
POST /api/v1/schools
GET /api/v1/schools/{id}
PUT /api/v1/schools/{id}
GET /api/v1/schools?status=PENDING&page=1
POST /api/v1/schools/{id}/approve
POST /api/v1/schools/{id}/reject
```

#### Carbon Audits
```
POST /api/v1/schools/{id}/audit
GET /api/v1/schools/{id}/audits
GET /api/v1/audits/{auditId}
PUT /api/v1/audits/{auditId}
POST /api/v1/audits/{auditId}/submit
GET /api/v1/audits/{auditId}/report?format=pdf
```

#### OMR Scanning
```
POST /api/v1/omr/scan (multipart: file)
POST /api/v1/omr/scan-and-submit (multipart: file, academicYear, month)
```

#### Reports & Recommendations
```
GET /api/v1/audits/{auditId}/recommendations
GET /api/v1/schools/{id}/comparison
GET /api/v1/schools/{id}/trends
```

#### Gamification
```
GET /api/v1/users/{id}/achievements
GET /api/v1/users/{id}/tasks
POST /api/v1/users/{id}/tasks/{taskId}/complete
GET /api/v1/leaderboard?scope=school&limit=100
```

### 5.2 OMRChecker Integration

- **Type:** Subprocess execution
- **Invocation:** `python main.py -i <input_dir> -o <output_dir>` from OMRChecker root
- **Input:** OMR image file + template.json in temp directory
- **Output:** Results/Results_*.csv with decoded values
- **Error Handling:** Parse stderr, return meaningful error message to user

### 5.3 Frontend-Backend Communication

- **Protocol:** HTTP/2 over HTTPS
- **Content-Type:** application/json
- **Authentication:** Bearer token in Authorization header
- **Rate Limiting:** 100 requests/minute per IP (429 Too Many Requests)
- **CORS:** Allowed only from LeafNode domain

---

## 6. Constraints & Assumptions

### 6.1 Constraints

- **Language Support:** Phase 1 limited to Nepali and English
- **Offline Mode:** Limited to local draft saving (no sync while offline)
- **OMR Sheet:** Single-page design (A4 or Legal)
- **Regions:** Initially Nepal only (7 provinces)
- **Deployment:** Cloud-based (Render.com or similar), no on-premise
- **Data Volume:** Design for 10,000+ schools, 100,000+ audits

### 6.2 Assumptions

- **Users:** School admin has basic computer literacy
- **Network:** Intermittent connectivity acceptable (offline mode supported)
- **Hardware:** Standard smartphones can capture clear OMR sheet images
- **Emission Factors:** Provided by external sources (government, IPCC)
- **Time:** Users submit audits monthly or at key academic milestones
- **Motivation:** Gamification drives sustained participation
- **Privacy:** Schools willing to share anonymized benchmark data

### 6.3 Dependencies

- **External:** Emission factor data sources, regional electricity grid data
- **Internal:** OMRChecker stability, Prisma ORM compatibility

---

## 7. Acceptance Criteria & Testing

### 7.1 Functional Testing

- All 9 carbon categories can be entered and calculated correctly
- Scopes 1/2/3 calculations match GHG Protocol formulas
- OMR scanning accuracy > 95% on quality sheets
- Tier-based confidence display is accurate
- Recommendations are relevant and prioritized
- Leaderboard rankings update correctly

### 7.2 Performance Testing

- Dashboard loads in < 2 seconds (cold cache)
- Audit submission completes in < 5 seconds (100 concurrent users)
- OMR processing handles 200 sheets/minute
- Database queries respond in < 100ms (p95)

### 7.3 Security Testing

- SQL injection attempts blocked
- XSS attempts blocked
- CSRF tokens validated on all POST/PUT/DELETE
- Unauthorized users cannot access other school's data
- Rate limiting enforced
- Session timeout after 30 minutes inactivity

### 7.4 Usability Testing

- New users can register and submit first audit in < 10 minutes
- Mobile interface usable on 3" screen (older smartphones)
- All critical functions accessible in both Nepali and English
- Error messages provide actionable guidance

### 7.5 UAT Scenarios

**Scenario 1: School Registration & First Audit**
- School admin registers school
- Super admin approves
- School admin invites teacher
- Teacher submits manual audit data
- System calculates emissions
- Results displayed on dashboard

**Scenario 2: OMR Scanning Flow**
- School prints OMR sheet
- Teachers fill bubbles
- School scans sheet
- System processes OMR
- Data displayed for confirmation
- School submits audit

**Scenario 3: Student Engagement**
- Student completes daily tasks
- Earns points and badges
- Views leaderboard position
- Pet RPG pet evolves
- Shares achievement with peers

---

## 8. Future Enhancements (Out of Scope - Phase 2+)

1. **Multi-factor Authentication (MFA)** for school admins
2. **Integration with government environmental reporting systems**
3. **Advanced AI recommendations** (machine learning model)
4. **Carbon credit marketplace**
5. **Offline-first mobile app** (native iOS/Android)
6. **Real-time data streaming** (live electricity meters)
7. **Supply chain emissions tracking**
8. **Export to international carbon accounting standards** (ISO, TCFD)
9. **Integration with other platforms** (Energy management systems, ERP systems)
10. **Sustainability certification pathway** (e.g., Green School Certification)

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| GHG Protocol | Greenhouse Gas Protocol Corporate Accounting and Reporting Standard |
| Scope 1 | Direct GHG emissions from owned/controlled sources |
| Scope 2 | Indirect GHG emissions from purchased electricity |
| Scope 3 | All other indirect emissions (value chain) |
| OMR | Optical Mark Recognition - technology to read marked bubbles |
| Data Tier | Confidence level of data (Measured/Estimated/Default) |
| Audit | Annual or monthly carbon measurement for a school |
| Emission Factor | Rate to convert activity data to CO2 equivalent |
| Recommendation | Suggested action to reduce emissions |
| Leaderboard | Ranked list of schools or students by metrics |
| Gamification | Use of game mechanics to increase engagement |

---

## 10. Approval & Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Owner | TBD | ___________ | _____ |
| Product Manager | TBD | ___________ | _____ |
| Technical Lead | TBD | ___________ | _____ |
| QA Lead | TBD | ___________ | _____ |

---

**Document End**
