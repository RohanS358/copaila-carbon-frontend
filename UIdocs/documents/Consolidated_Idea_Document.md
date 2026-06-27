# CoPaila - Consolidated Idea Document

**Version:** 1.0  
**Last Updated:** June 24, 2026  
**Project Status:** Development Phase - V1 MVP  
**Document Type:** Strategic Vision & Architecture Document

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem & Opportunity](#problem--opportunity)
3. [Solution Overview](#solution-overview)
4. [Target Market & Users](#target-market--users)
5. [Core Value Proposition](#core-value-proposition)
6. [Technical Architecture](#technical-architecture)
7. [Feature Roadmap](#feature-roadmap)
8. [Business Model](#business-model)
9. [Success Metrics](#success-metrics)
10. [Risk Analysis](#risk-analysis)
11. [Strategic Partnerships](#strategic-partnerships)

---

## Executive Summary

**CoPaila** is a carbon audit and management platform specifically designed for schools in Nepal. We enable schools to accurately measure, transparently report, and systematically reduce their greenhouse gas emissions while engaging students as climate champions through gamified learning experiences.

### Problem We Solve
- **Schools lack tools** to measure carbon emissions in their context (Nepal-specific infrastructure)
- **Manual processes** are time-consuming and error-prone
- **Data quality** is uncertain without transparent confidence indicators
- **Student engagement** in climate action is limited
- **Peer benchmarking** is unavailable for schools to learn from each other

### Solution We Offer
- **Multi-channel data collection:** Manual entry + OMR scanning for scalability
- **Automatic calculation:** GHG Protocol-compliant emissions calculation
- **Transparent reporting:** 3-tier confidence model (Measured/Estimated/Default)
- **Student engagement:** Gamification (Pet RPG, achievements, leaderboards)
- **Comparative insights:** Peer benchmarking and reduction recommendations

### Market Opportunity
- **5,000+ schools** in Nepal
- **Growing government focus** on climate action and NDCs
- **International funding** available for school climate initiatives
- **No established competitors** in Nepal's school emissions space

---

## Problem & Opportunity

### Current State (As-Is)

**Schools Today:**
- ❌ No systematic way to measure emissions
- ❌ Rely on guesswork or external consultants (expensive)
- ❌ Cannot track progress year-over-year
- ❌ Students unaware of school's environmental impact
- ❌ No peer comparisons or best practice sharing
- ❌ Reporting is manual and unreliable

**Global Trends:**
- ✅ GHG Protocol becoming de facto international standard
- ✅ SDG 13 (Climate Action) drives government mandates
- ✅ Schools increasingly seen as agents of climate change education
- ✅ Nepal has committed to 45% emissions reduction by 2050
- ✅ Youth (Gen Z) demand action from institutions

### Desired Future State (To-Be)

**Schools with CoPaila:**
- ✅ **Know their emissions** with transparent confidence levels
- ✅ **Reduce costs** through actionable recommendations
- ✅ **Track progress** automatically year-over-year
- ✅ **Engage students** in meaningful climate action
- ✅ **Learn from peers** through anonymous benchmarking
- ✅ **Report credibly** to government, donors, and stakeholders

### Opportunity Size

| Metric | Nepal | Opportunity |
|--------|-------|-------------|
| Total Schools | ~40,000 | Large addressable market |
| Urban/Peri-urban Schools | ~5,000-8,000 | Early adopters (internet access) |
| Digital-ready Schools | ~2,000-3,000 | Phase 1 target |
| Annual Budget (school) | $50K-500K+ | Ability to pay for solutions |
| Climate funding available | $Millions | Government, NGO, donor programs |

---

## Solution Overview

### How CoPaila Works: 3-Step Process

#### Step 1: Data Collection
```
School Admin chooses:
├─ Manual Entry: Fill 9 activity categories
│  ├─ Electricity (kWh)
│  ├─ Generator/Vehicle/Cooking Fuel (liters)
│  ├─ Refrigerant (kg leakage)
│  ├─ Commute (person-km)
│  ├─ Paper (kg)
│  ├─ Food (kg)
│  └─ Waste (kg)
│
└─ OMR Scanning: Scan pre-printed form
   ├─ Print template (single A4 sheet)
   ├─ Distribute to staff/students
   ├─ Scan completed sheets (bulk)
   └─ System auto-decodes values
```

For each entry, school admin selects **data confidence tier**:
- **Tier 1 (MEASURED):** Bill reading, receipt, headcount [🟢 Green - Highest confidence]
- **Tier 2 (ESTIMATED):** Proxy calculation (e.g., staff × avg commute) [🟡 Yellow - Medium]
- **Tier 3 (DEFAULT):** National/regional average [🔴 Red - Lowest confidence]

#### Step 2: Automatic Calculation
```
CoPaila Engine:
├─ Validate inputs (non-negative, correct units)
├─ Extract school context (enrollment, location, area type)
├─ For each of 9 categories:
│  └─ Emissions = Value × EmissionsFactor[category, region, areaType]
├─ Aggregate by GHG Scope:
│  ├─ Scope 1 (Direct): Generator, Vehicle, Cooking, Refrigerant
│  ├─ Scope 2 (Energy): Electricity
│  └─ Scope 3 (Value Chain): Commute, Paper, Food, Waste
└─ Store all calculations (audit trail)
```

#### Step 3: Insights & Action
```
CoPaila provides:
├─ Emissions Report
│  ├─ Total CO2 equivalent
│  ├─ Breakdown by scope (pie chart)
│  ├─ Breakdown by category (stacked bar)
│  └─ Data quality summary (tier distribution)
│
├─ Top 3 Recommendations
│  ├─ Prioritized by impact/cost ratio
│  ├─ Estimated reduction potential
│  └─ Implementation roadmap
│
├─ Peer Comparison
│  ├─ "Your school: 2.5 kg CO2/student"
│  ├─ "Peer average: 2.1 kg CO2/student"
│  └─ "You're in top 30%"
│
└─ Student Engagement
   ├─ Pet RPG improves with carbon reduction
   ├─ Earn badges (First Audit, Data Master, Eco Champion)
   ├─ Climb leaderboard (within school, region, nation)
   └─ Participate in challenges (time-limited competitions)
```

### Unique Differentiators

1. **3-Tier Confidence Model:** Transparent about data quality (not often seen)
2. **Nepal-Specific Factors:** Emission factors calibrated for Nepali grid, geography, economy
3. **OMR Bulk Scanning:** Enable large schools to collect data at scale
4. **Gamification-First:** Student engagement built into core product, not bolt-on
5. **Offline-Capable:** Schools with intermittent internet can still submit audits
6. **Multi-language:** Nepali + English interfaces (future: local languages)

---

## Target Market & Users

### Primary Users

#### 1. **School Administrators** (Decision Makers)
- **Demographics:** School principals, environmental coordinators, office managers
- **Pain Points:** 
  - Need credible emissions data for reporting to government/donors
  - Want to reduce energy costs
  - Limited IT budget and staff
- **Motivation:** Institutional reputation, regulatory compliance, cost savings
- **Usage:** Monthly/annual audit submission, report viewing

#### 2. **Teachers** (Data Collectors)
- **Demographics:** Science teachers, environmental club advisors, coordinators
- **Pain Points:**
  - Manual tracking is tedious and error-prone
  - Want to engage students in real environmental action
  - Limited time for administrative tasks
- **Motivation:** Student learning outcomes, career fulfillment
- **Usage:** Weekly/monthly data collection, task facilitation

#### 3. **Students** (Engaged Participants)
- **Demographics:** Age 10-18, varying digital literacy
- **Pain Points:**
  - Climate change feels abstract and distant
  - Want to contribute to solutions
  - Limited visibility into school's actions
- **Motivation:** Game progression, badges, social recognition, climate impact
- **Usage:** Daily/weekly task completion, leaderboard checking, achievement earning

### Secondary Users

#### 4. **System Administrators** (Monitors)
- **Demographics:** Government education officials, NGO program managers
- **Pain Points:** 
  - Need aggregated emissions data for reporting
  - Cannot easily compare schools' progress
  - Manual data collection is unreliable
- **Motivation:** Program evaluation, donor reporting, policy insight
- **Usage:** System setup, approving schools, viewing aggregate reports

#### 5. **Researchers & NGOs** (Evaluators)
- **Demographics:** Environmental scientists, climate organizations
- **Pain Points:**
  - Lack of reliable school emissions data for research
  - Difficulty accessing school carbon profiles
- **Motivation:** Publication, program evaluation, impact assessment
- **Usage:** Data export, anonymized benchmarking data

### Market Size Breakdown

| School Type | Count | Adoption Rate (Y1) | Adoption Rate (Y3) |
|-------------|-------|--------------------|--------------------|
| Government Urban | 800 | 15% (120) | 50% (400) |
| Community Urban | 600 | 10% (60) | 35% (210) |
| Private Urban | 500 | 25% (125) | 60% (300) |
| Government Rural | 2,000 | 5% (100) | 20% (400) |
| **Phase 1 Target** | **~5,000** | **155 schools** | **~1,300 schools** |

---

## Core Value Proposition

### For Schools
```
"Measure what matters, reduce what costs, celebrate what counts."

✓ Know your footprint (accurate, transparent, Nepal-specific)
✓ Reduce energy bills (through targeted recommendations)
✓ Meet reporting requirements (to government, donors, stakeholders)
✓ Inspire students (through gamified learning and action)
✓ Learn from peers (anonymous benchmarking data)
✓ Track progress (year-over-year trends, impact visualization)
```

### For Government / Policy Makers
```
"Scale school climate action without creating reporting burden."

✓ Aggregate emissions data across school system
✓ Evidence-based policy insights (which schools, which categories?)
✓ Low-cost deployment (software as a service, no hardware)
✓ International credibility (GHG Protocol compliant)
✓ Youth engagement pathway (climate education integrated)
✓ Decentralized execution (schools own their audits)
```

### For NGOs / Donors
```
"Demonstrate impact at scale, not through consultants."

✓ Cost-effective: $50-200/school/year << $5,000+ consulting
✓ Scalable: Track 100 schools as easily as 1
✓ Transparent: 3-tier confidence model shows data quality
✓ Verifiable: Audit trails, tier indicators, peer comparison
✓ Engaging: Student participation increases NGO visibility
✓ Measurable: Clear KPIs (baseline, targets, progress)
```

---

## Technical Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         CoPaila Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │  Frontend        │      │  Admin Dashboard │                │
│  │  (React/Vite)    │◄─────►│  (React/Vite)    │                │
│  │  LeafNode        │      │  Super Admin     │                │
│  └──────────────────┘      └──────────────────┘                │
│         │                                                      │
│         │ HTTPS / REST API / JWT Auth                         │
│         ▼                                                      │
│  ┌──────────────────────────────────────────────┐             │
│  │  NestJS Backend API (Node.js)                │             │
│  ├──────────────────────────────────────────────┤             │
│  │ • Auth Module (JWT + Passport)               │             │
│  │ • Schools Module (Registration, Mgmt)       │             │
│  │ • Users Module (RBAC, Profiles)             │             │
│  │ • Carbon Calculator Module (Emissions Calc) │             │
│  │ • OMR Module (Scanner Integration)          │             │
│  │ • Reports Module (PDF/Excel Export)         │             │
│  │ • Gamification Module (Achievements)        │             │
│  └──────────────────────────────────────────────┘             │
│         │           │                    │                   │
│         │           │                    ▼                   │
│         │           │          ┌──────────────────┐          │
│         │           │          │ OMRChecker       │          │
│         │           │          │ (Python)         │          │
│         │           │          │ Subprocess       │          │
│         │           │          └──────────────────┘          │
│         │           │                                        │
│         ▼           ▼                                        │
│  ┌────────────────────────────────────────────┐            │
│  │  PostgreSQL Database                       │            │
│  ├────────────────────────────────────────────┤            │
│  │ • Users, Schools, IndividualProfiles       │            │
│  │ • CarbonAudits, ActivityData               │            │
│  │ • Recommendations, Achievements           │            │
│  │ • AuditLogs (for compliance)               │            │
│  └────────────────────────────────────────────┘            │
│         │                                                   │
│         │ (Prisma ORM)                                      │
│         ▼                                                   │
│  ┌────────────────────────────────────────────┐            │
│  │  Redis Cache                               │            │
│  │  • Emission Factors                        │            │
│  │  • Reference Data                          │            │
│  │  • Session Data                            │            │
│  └────────────────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

External Integrations:
├─ Email Service (Sendgrid) → Password resets, notifications
├─ File Storage (S3/CDN) → OMR images, PDF reports
├─ Analytics (Sentry) → Error tracking & monitoring
└─ Authentication (optional OAuth) → SSO support (future)
```

### Core Components

#### 1. **Frontend (React + Vite)**
- **Framework:** React 18 with React Router v6
- **Styling:** Tailwind CSS + custom components
- **State Management:** React Context API
- **Charts:** Recharts for emissions visualizations
- **Build:** Vite (fast, modern bundler)
- **Deployment:** Vercel or similar static hosting + serverless functions
- **Pages:**
  - Landing, Login, Registration (School/Individual)
  - School Dashboard, Student Dashboard
  - Carbon Audit Entry (manual + OMR)
  - Reports & Recommendations
  - Gamification (Pet RPG, Achievements, Leaderboard)
  - Admin Panel (for super admin)

#### 2. **Backend (NestJS + Node.js)**
- **Framework:** NestJS (enterprise-grade TypeScript framework)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + Passport.js
- **API:** RESTful with OpenAPI/Swagger documentation
- **Rate Limiting:** 100 req/min per IP
- **Caching:** Redis for emission factors & reference data
- **Email:** SendGrid for notifications
- **Deployment:** Render.com or Heroku (managed cloud platform)

#### 3. **Calculation Engine**
- **Language:** TypeScript (in NestJS backend)
- **Logic:** GHG Protocol-compliant formulas
- **Input:** Activity data (9 categories) + school context
- **Processing:**
  1. Validate inputs (non-negative, correct units)
  2. Apply contextual emission factors (region, area type)
  3. Calculate per-category emissions by scope
  4. Aggregate totals
  5. Store audit trail (ActivityData records)
- **Output:** Scope 1/2/3 totals, category breakdown, data tier summary
- **Accuracy:** Decimal precision (not Float), 2 dp display

#### 4. **OMR Processing**
- **Python OMRChecker:** Spawned as subprocess per request
- **Input:** Image file + template.json
- **Processing:** Detect bubble positions, decode values, return CSV
- **Integration:** NestJS calls Python OMRChecker, parses CSV output
- **Error Handling:** Graceful degradation if OMR fails (user re-enters manually)
- **Performance:** 200+ sheets/minute on standard hardware

#### 5. **Data Model**
```
User
├─ Email, Password (hashed)
├─ Role (SUPER_ADMIN|SCHOOL_ADMIN|TEACHER|STUDENT|INDIVIDUAL)
├─ schoolId (FK, optional)
└─ createdAt, updatedAt

School
├─ schoolName, email, phone
├─ Location: province, district, municipality, gps, address
├─ Profile: schoolType, enrollment, electricity, internet, language
├─ Status: DRAFT → PENDING → APPROVED → ACTIVE / REJECTED / SUSPENDED
└─ createdAt, updatedAt

CarbonAudit
├─ schoolId (FK), academicYear, month (composite key)
├─ enrollment, areaType (context)
├─ status: DRAFT → SUBMITTED → CALCULATED
├─ totalEmissions, scope1Total, scope2Total, scope3Total
├─ submittedById (FK to User)
└─ createdAt, submittedAt, calculatedAt

ActivityData (one per category per audit)
├─ auditId (FK), category (9 types)
├─ value (user-entered), unit, tier (MEASURED|ESTIMATED|DEFAULT)
├─ emissionsFactor, emissions (calculated)
├─ scope (1|2|3)
└─ dataSource (notes)

Recommendation
├─ schoolId (FK), category, priority
├─ description, estimatedReduction, implementationCost
└─ createdAt

Achievement
├─ userId (FK), badgeType, description
└─ earnedAt

AuditLog
├─ userId, action, entityType, entityId
├─ oldValues, newValues (JSON)
├─ timestamp, ipAddress
└─ (1-year retention minimum)
```

---

## Feature Roadmap

### Phase 1 (MVP - Current)
**Timeline:** 6 months  
**Focus:** Core audit collection & calculation

- [x] User registration & authentication
- [x] School registration (multi-step form)
- [x] Manual carbon data entry (9 categories)
- [x] Carbon calculation engine (Scopes 1/2/3)
- [x] OMR sheet scanning integration
- [x] Basic reporting (PDF/Excel export)
- [x] Dashboard with emissions breakdown
- [x] Gamification (Pet RPG, Badges, Leaderboard - basic)
- [x] Admin approval workflow

**KPIs:** 150 schools enrolled, 500+ audits submitted, 90%+ data Tier 1/2

### Phase 2 (Refinement & Scale)
**Timeline:** Months 7-12  
**Focus:** Enhanced engagement & ecosystem

- [ ] Multi-factor authentication (MFA)
- [ ] Advanced recommendations (ML-based)
- [ ] School Forest visualization (community feature)
- [ ] Regional leaderboards & competitions
- [ ] Mobile app (offline-capable)
- [ ] Integration with government reporting systems
- [ ] Teacher training program & certification
- [ ] NGO partnership dashboard

**KPIs:** 500 schools, 5,000+ audits, top 10% schools achieving 10% reduction

### Phase 3 (Ecosystem)
**Timeline:** Year 2  
**Focus:** International expansion & partnerships

- [ ] Carbon credit marketplace integration
- [ ] Supply chain emissions tracking
- [ ] Integration with ERP/energy management systems
- [ ] Certification pathway (Green School Badge)
- [ ] API for third-party integrations
- [ ] Support for other countries (India, Bangladesh, etc.)
- [ ] Enterprise features (multi-school organizations)

**KPIs:** 2,000+ schools, 50K+ audits, measurable emissions reduction at scale

---

## Business Model

### Revenue Streams

#### 1. **Freemium SaaS (Primary)**
- **Free Tier:** 1 school, up to 1 audit/year, basic dashboard
- **School Plan ($50-100/month):** Unlimited audits, advanced analytics, recommendations, integrations
- **District Plan ($500-1000/month):** 10-50 schools, aggregate reporting, benchmarking
- **National Plan (Custom):** Government or NGO pricing, API access

**Rationale:** Low per-school cost, high adoption, aligns with NGO funding models

#### 2. **Data Licensing (Secondary)**
- **Anonymized Benchmark Data:** $10K-50K/year to research institutions, NGOs
- **Aggregate Reports:** Government can purchase annual national emissions summary
- **API Access:** Third-party platforms can query aggregated data (with privacy)

**Rationale:** De-identify and aggregate data school, maintain privacy, create new revenue

#### 3. **Professional Services (Tertiary)**
- **Implementation:** Onboarding & training for large school networks ($5K-20K per network)
- **Integration:** Custom integrations with school ERP or government systems ($10K-50K)
- **Consulting:** Carbon reduction roadmaps & strategic planning ($200/hr)

**Rationale:** High-value projects with government and large NGOs

### Unit Economics (Year 1)

| Metric | Value | Notes |
|--------|-------|-------|
| Customer Acquisition Cost (CAC) | $200-500 | School admin outreach + initial training |
| Monthly Recurring Revenue (MRR) | $50-100/school | Average school plan price |
| Lifetime Value (LTV) | $1,500-2,000 | 3-year average school lifetime |
| LTV:CAC Ratio | 3-5:1 | Healthy SaaS ratio |
| Churn Rate | 10% /year | Conservative estimate |
| Year 1 MRR | $7,500 | 150 schools × $50/mo average |

### Funding & Sustainability

**Funding Strategy:**
1. **Grants:** Climate-focused grants (Green Fund, Climate Action Fund, etc.)
2. **Impact Investors:** Social enterprises focused on climate & education
3. **Government Support:** Subsidized rates for government schools
4. **NGO Partnerships:** NGOs underwrite costs for partner schools
5. **Bootstrap:** Revenue from early adopters reinvested in growth

**Sustainability Timeline:**
- **Month 0-6:** Funded by grants/investor
- **Month 6-12:** Achieving 50% cost recovery through SaaS revenue
- **Month 12+:** Break-even or positive cash flow

---

## Success Metrics

### Product Metrics

| Metric | Target (Y1) | Target (Y3) | How Measured |
|--------|------------|------------|--------------|
| Schools Onboarded | 150 | 1,000+ | Registration database |
| Carbon Audits Submitted | 500+ | 5,000+ | AuditLog table count |
| Data Quality (Tier 1/2) | 60% | 75% | ActivityData.tier distribution |
| Student Engagement Rate | 40% | 60% | Active daily users / school |
| Avg Emissions Reduction | N/A | 10% YoY | Trend analysis of historical audits |

### Business Metrics

| Metric | Target (Y1) | Target (Y3) | How Measured |
|--------|------------|------------|--------------|
| Monthly Recurring Revenue (MRR) | $7.5K | $50K+ | Stripe / payment processor |
| Customer Acquisition Cost | <$300 | <$200 | Marketing + Sales / New customers |
| Customer Lifetime Value (LTV) | $1,500+ | $3,000+ | Churn rate + MRR calculation |
| School Retention Rate | 70% | 85% | Year-over-year school count |
| Net Promoter Score (NPS) | >40 | >50 | In-app survey |

### Impact Metrics

| Metric | Target (Y1) | Target (Y3) | How Measured |
|--------|------------|------------|--------------|
| Cumulative Emissions Measured | 100K tons CO2e | 1M tons CO2e | Sum of all audits |
| Students Engaged | 10K+ | 100K+ | Leaderboard / task participation |
| CO2 Avoided (from recommendations adopted) | 5K tons CO2e | 100K tons CO2e | School reporting + estimation |
| Government Policies Influenced | 1 | 3+ | Qualitative assessment |
| International Media Mentions | 0 | 5+ | PR tracking |

---

## Risk Analysis

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| OMRChecker accuracy < 85% | Medium | High | Use ensemble methods, train on Nepal context, provide manual fallback |
| Database scalability issues | Low | High | Horizontal sharding, read replicas, query optimization early |
| Data privacy breach | Low | Critical | Encryption at rest, HTTPS, regular security audits, compliance with regulations |
| API downtime | Medium | High | 99.5% SLA, multi-region failover, load balancing |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Low school adoption | Medium | High | Early adopter marketing, partner with NGOs, pilot with government schools |
| Data quality issues | Medium | Medium | 3-tier model provides transparency, recommendations ignore low-quality data |
| Competitor entry | Low | Medium | First-mover advantage in Nepal, build switching costs (integrations, gamification) |
| Revenue model resistance | Medium | Medium | Freemium tier ensures accessibility, subsidies for government/NGO |

### Regulatory Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Data privacy regulations change | Low | Medium | GDPR-compliant architecture, audit logs, user data export |
| Government carbon reporting mandate (changes approach) | Medium | Low | Platform flexible to reporting standard changes, versioning |
| Export controls on climate data | Low | Medium | Consult legal, host data in Nepal, comply with regulations |

---

## Strategic Partnerships

### Target Partners (Phase 1-2)

#### **Government**
- **Ministry of Education:** Endorsement, integration with school management systems
- **Ministry of Environment:** Co-branding, official reporting pathway, subsidies
- **National Planning Commission:** Climate commitment support, policy influence

#### **NGOs & Development Partners**
- **ICIMOD:** Climate data, regional expertise
- **World Wildlife Fund (WWF):** Funding, school network access
- **IUCN:** Environmental credibility, partnership visibility
- **Regional NGOs:** Ground presence, school relationships

#### **Academic & Research**
- **Tribhuvan University:** Research collaboration, student internships
- **Nepal Academy of Science & Technology (NAST):** Emissions factor validation

#### **Technology**
- **Render.com / Cloud Provider:** Infrastructure partnership, startup rates
- **Slack / Email Providers:** Integration partnerships
- **Microsoft Teams:** School ecosystem integration

### Partnership Benefits

**For CoPaila:**
- Credibility & endorsement
- Access to school networks
- Funding & co-marketing
- Technical expertise

**For Partners:**
- Achieve climate & education goals
- Research & data access
- Public visibility
- Implementation at scale

---

## Conclusion

**CoPaila represents a unique opportunity** to scale school climate action in Nepal through a **digital-first, student-centric, transparent approach**. By combining accurate carbon accounting with student engagement, we solve both institutional and educational needs simultaneously.

### Key Takeaways
1. **Large Market:** 5,000+ schools, growing government focus on climate, no established competitors
2. **Strong Value:** Cost-effective, scalable, transparent alternative to consulting
3. **Sustainable Model:** Viable SaaS + impact-focused business model
4. **Social Impact:** Engages 100K+ students as climate agents by Year 3
5. **Clear Roadmap:** MVP → Scale → Ecosystem pathway over 3 years

### Next Steps
1. **MVP Launch:** Complete Phase 1 development (150 schools by end of Year 1)
2. **Pilot Evaluation:** Run 3-month pilot with 20 schools, gather feedback
3. **Fundraising:** Secure $500K - $1M climate/education impact funding
4. **Strategic Partnerships:** Lock in 2-3 key NGO/government partners
5. **Market Expansion:** Develop regional roadmap (India, Bangladesh, SEA)

---

**Document Approved By:** [Project Leadership]  
**Next Review Date:** September 2026

