# System Architecture Design Document (SADD)
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | System Architecture Design Document |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Companion Documents** | PRD v2.0, SRS v2.0, Database Design Document v2.0, API Specification v2.0 |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial architecture document derived from PRD/SRS | Product/Engineering Team |
| 2.0 | 2026-09-08 | **Media storage locked to Cloudinary** (eliminated S3/Firebase/GCS ambiguity); Added Socket.io WebSocket architecture for real-time messaging; Added JWT refresh-token strategy; Added Nodemailer+SendGrid email architecture; Updated status to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This document describes the technical architecture of the Global Multidimensional Talent Marketplace and Casting Management System. It defines the architectural style, component decomposition, deployment topology, technology choices and their justification, data flow, security architecture, and scalability strategy. It is the primary engineering reference for translating the SRS's functional and non-functional requirements into a buildable system.

### 1.2 Intended Audience
- Backend and frontend engineers implementing the system
- Database engineers designing the schema (companion: Database Design Document)
- QA engineers designing infrastructure/integration test strategy
- Academic supervisor/examiners evaluating system design rigor

### 1.3 Architectural Drivers
The architecture is shaped primarily by the following requirements from the SRS:
- **Multi-role access with strict RBAC** (SRS-FR-2.x) → requires centralized, server-enforced authorization.
- **Heavy multimedia handling** (SRS-FR-4.x) → requires separation of media storage from primary transactional database.
- **Search/filter/matching performance** (NFR-PERF-1 to 4) → requires indexed queries and a stateless, horizontally scalable application layer.
- **Security-sensitive data** (NFR-SEC-1 to 7) → requires encrypted transport, hashed credentials, and layered validation.
- **Independent module development under Agile** (project methodology) → requires clear separation of concerns and modular backend services.
- **Academic prototype budget/timeline constraints** (PRD §16) → favors a pragmatic three-tier monolith over a full microservices architecture at this stage, while keeping module boundaries clean enough to extract services later.

---

## 2. Architectural Goals and Constraints

### 2.1 Goals
| Goal | Description |
|---|---|
| **Modularity** | Each functional domain (auth, profiles, portfolios, casting, search, matching, messaging, admin) shall be implemented as a distinct, independently testable module. |
| **Security by design** | RBAC, input validation, and encryption applied consistently at the architecture level, not bolted on per-feature. |
| **Scalability path** | Architecture must support scaling the application tier horizontally and evolving toward service extraction without a full rewrite. |
| **Media performance** | Multimedia-heavy portfolios must not degrade core application performance — isolated via cloud object storage + CDN. |
| **Developer velocity** | Given academic timeline constraints, prioritize a well-structured monolith with clear module boundaries over premature microservices complexity. |
| **Testability** | Layered architecture (presentation / application / data) enables independent unit, integration, and system testing per SRS §15 (Test Plan). |

### 2.2 Constraints
- Must use React.js (frontend), Node.js/Express.js (backend), MongoDB (database) per PRD technology stack decision.
- Must deploy on the specified cloud stack: Vercel (frontend), Render (backend), MongoDB Atlas (database).
- **Media storage is Cloudinary** (locked in v2.0 — replaces "S3/Firebase/GCS" ambiguity from v1.0). Cloudinary is chosen for its free-tier generous quota, Node.js SDK (`cloudinary` npm package), automatic image/video transformation, and built-in CDN delivery. No other storage provider is in scope.
- No payment processing, legal identity verification, or biometric AI infrastructure in this release (PRD §6.2).
- Limited infrastructure budget — architecture must operate within free/low-tier cloud service limits during the academic evaluation period.

### 2.3 Key Architectural Decisions (Summary)
| Decision | Chosen Approach | Rationale |
|---|---|---|
| Architectural style | Three-tier, modular monolith (backend), RESTful API + WebSocket | Balances development speed with maintainability; avoids premature microservices overhead |
| Authentication | Stateless JWT (short-lived access token 15m) + HTTP-only cookie refresh token (7d) | Access tokens kept short-lived to minimize breach window; refresh tokens are rotated and stored server-side in `refresh_tokens` collection for revocability |
| Media storage | **Cloudinary** (locked) | Node.js SDK, automatic thumbnailing/transformation, CDN delivery, generous free tier — no other provider in scope |
| Database | MongoDB (document store) | Flexible schema fits heterogeneous, role-specific profile structures (Model vs. Industry vs. Pageant Org); team familiarity; native fit with Node.js (Mongoose ODM) |
| API style | REST over HTTPS/JSON | Simplicity, wide tooling support (Postman), easy frontend integration with React |
| Real-time messaging | Socket.io (WebSocket with HTTP long-poll fallback) | Enables real-time message delivery in the Messaging Module without polling; integrates cleanly with the existing Express.js server via `socket.io` npm package |
| Email | Nodemailer + SendGrid (free tier) | Handles password-reset and notification emails; SendGrid provides reliable SMTP delivery within free tier limits for pilot scale |
| Matching engine | In-process rule/attribute-based scoring service (not external ML service) | Matches SRS-FR-8.x explainability requirement; avoids unnecessary infrastructure complexity for a prototype |

---

## 3. Architectural Overview

### 3.1 Architectural Style
The system follows a **Three-Tier Architecture**:

1. **Presentation Tier** — React.js single-page application (SPA) rendered in the browser, communicating via REST API calls.
2. **Application Tier** — Node.js/Express.js server exposing a REST API, implementing all business logic, validation, authentication/authorization, and orchestration of matching/search algorithms.
3. **Data Tier** — MongoDB Atlas for structured/semi-structured transactional data; cloud object storage for multimedia assets.

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
│   React.js SPA — Talent / Recruiter / Pageant Org / Admin Views   │
└───────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS (REST/JSON, JWT Bearer Auth)
┌───────────────────────────────▼────────────────────────────────┐
│                    APPLICATION TIER (Node.js/Express)             │
│ ┌────────────┐ ┌───────────┐ ┌────────────┐ ┌────────────────┐  │
│ │   Auth &   │ │  Profile  │ │  Casting   │ │  Search /       │  │
│ │   RBAC     │ │ Portfolio │ │ Management │ │  Match / Recomm │  │
│ │  Module    │ │  Module   │ │  Module    │ │  Module         │  │
│ └────────────┘ └───────────┘ └────────────┘ └────────────────┘  │
│ ┌────────────┐ ┌───────────────────┐                             │
│ │ Messaging  │ │  Administration    │        Middleware:          │
│ │  Module    │ │      Module        │  Auth │ Validation │        │
│ │ (Socket.io)│ │                    │  Rate-Limit │ Error │      │
│ └────────────┘ └───────────────────┘        Error Handling │      │
│                                               Logging               │
└───────────┬─────────────────────────────────────┬──────────────┘
            │                                       │
┌───────────▼─────────────┐             ┌──────────▼──────────────┐
│      DATA TIER            │             │   MEDIA STORAGE TIER      │
│   MongoDB Atlas             │             │  Cloudinary               │
│  (Users, Profiles, Casting, │             │  (images + videos,        │
│   Applications, Messages,   │             │   auto-thumbnails, CDN)   │
│   Verification Records,     │             └───────────────────────────┘
│   Refresh Tokens)           │
└──────────────────────────┘
```

### 3.2 Layer Responsibilities

**Presentation Layer (React.js)**
- Renders role-specific dashboards and views.
- Performs client-side validation for UX responsiveness (never trusted as the sole validation layer).
- Manages client-side auth state (stores JWT, attaches to API requests, redirects on 401).
- Consumes the REST API exclusively; contains no direct database or storage access.

**Application Layer (Node.js / Express.js)**
- Exposes versioned REST endpoints (`/api/v1/...`).
- Implements all business rules, RBAC enforcement, and orchestration logic.
- Hosts the Search/Filter Engine and Matching/Recommendation Engine as internal services.
- Handles file-upload processing (validation → thumbail generation → cloud storage upload → DB reference save).
- Sends transactional emails (password reset, notifications) via an email service integration.

**Data Layer**
- **MongoDB Atlas:** primary transactional store for all structured entities (Users, Profiles, CastingCalls, Applications, Messages, VerificationRecords, AdminActionLogs).
- **Cloud Object Storage:** stores raw media files (images/videos) and generated thumbnails; referenced by URL from MongoDB documents.

---

## 4. Component Architecture (Application Tier Detail)

### 4.1 Module Breakdown

| Module | Responsibilities | Key Dependencies |
|---|---|---|
| **Auth & RBAC Module** | Registration, login, JWT issuance/validation, password reset, session management, role/permission enforcement middleware | bcrypt, jsonwebtoken, Email Service |
| **Profile Module** | CRUD for ModelProfile, IndustryProfile, PageantOrgProfile; field validation; verification-status display | Auth Module (identity), Admin Module (verification status) |
| **Portfolio Module** | Media upload orchestration, file validation, thumbnail generation, portfolio CRUD, ordering/categorization | Media Storage Service, Profile Module |
| **Casting Management Module** | CastingCall CRUD, lifecycle state transitions (open/closed/expired), deadline scheduling | Profile Module (creator identity/permissions) |
| **Application Module** | Application submission, duplicate prevention, status transitions, applicant listing per casting call | Casting Management Module, Profile Module |
| **Search & Filter Engine** | Query construction from filter parameters, indexed MongoDB queries, pagination | Profile Module, MongoDB indexes |
| **Matching & Recommendation Engine** | Attribute-based scoring, ranking, casting-call → candidate matching, candidate → casting-call recommendation | Profile Module, Casting Management Module |
| **Messaging Module** | Thread creation (context-bound to application/casting), real-time message send/receive via Socket.io, read-status tracking, offline delivery (message persisted + delivered on reconnect) | Application Module (context validation), Socket.io server |
| **Administration Module** | Verification review workflow, moderation actions, reported-content queue, platform metrics, action logging | All modules (cross-cutting oversight) |
| **Notification Service** (P1) | In-app and email notifications for status changes, new messages | Email Service, Application/Messaging Modules |

### 4.2 Cross-Cutting Middleware
- **Authentication Middleware:** validates JWT on every protected route; attaches decoded user identity/role to the request context.
- **Authorization Middleware:** role/permission checks per route (e.g., `requireRole(['industry_professional','pageant_organizer'])`).
- **Validation Middleware:** schema-based request validation (e.g., via Joi/Zod) before controller logic executes.
- **Error-Handling Middleware:** centralized error catcher producing consistent JSON error responses; logs internally without leaking stack traces to clients (NFR-REL-1, NFR-REL-2).
- **Logging Middleware:** structured request/response logging (method, route, status, latency, user ID) for observability and debugging.
- **Rate-Limiting Middleware (P1):** basic throttling on auth endpoints to mitigate brute-force attempts (supports SRS-FR-1.10).

### 4.3 Internal API Boundaries (Illustrative)

```
/api/v1/auth/*            → Auth & RBAC Module
/api/v1/profiles/*        → Profile Module
/api/v1/portfolio/*       → Portfolio Module
/api/v1/castings/*        → Casting Management Module
/api/v1/applications/*    → Application Module
/api/v1/search/*          → Search & Filter Engine
/api/v1/match/*           → Matching & Recommendation Engine
/api/v1/messages/*        → Messaging Module
/api/v1/admin/*           → Administration Module
```

*(Full endpoint-level contracts are defined in the companion API Specification document.)*

---

## 5. Data Flow Architecture

### 5.1 Example Flow — Portfolio Media Upload (SRS-FR-4.1 – 4.7)
```
1. User selects media file in React client.
2. Client performs preliminary validation (type/size) for UX feedback.
3. Client sends multipart/form-data request to /api/v1/portfolio/upload with JWT.
4. Auth Middleware validates token → Validation Middleware checks payload.
5. Portfolio Module streams file to Cloud Object Storage.
6. Portfolio Module triggers thumbnail generation (server-side image/video processing).
7. Portfolio Module saves a PortfolioItem document in MongoDB referencing the
   storage URL and thumbnail URL.
8. API responds with the created PortfolioItem (including thumbnail URL).
9. Client updates the portfolio view without a full page reload.
```

### 5.2 Example Flow — Casting Call Creation → Matching → Application
```
1. Recruiter (Industry Professional/Pageant Organizer) submits casting call form.
2. Casting Management Module validates fields, persists CastingCall (status=open).
3. Matching & Recommendation Engine is invoked (async or on-demand) to compute
   suitability scores against eligible ModelProfiles scoped by country/category.
4. Ranked candidate list is cached/returned to the Recruiter dashboard.
5. Talent User discovers the casting call via Search & Filter Engine or
   Recommendation feed, and submits an Application.
6. Application Module validates no duplicate application exists, persists
   Application (status=submitted), and links it to the CastingCall.
7. Recruiter reviews applicants (raw list + matching scores), updates status
   to Shortlisted/Rejected/Accepted via Application Module.
8. Status change triggers (optional) Notification Service to alert the applicant.
```

### 5.3 Example Flow — Authentication
```
1. User submits email/password to /api/v1/auth/login.
2. Auth Module retrieves user record, compares password against bcrypt hash.
3. On success, Auth Module issues a signed JWT (payload: user ID, role,
   verification status) with expiry.
4. Client stores JWT (memory or secure storage) and attaches it as a Bearer
   token on subsequent requests.
5. Auth Middleware verifies token signature/expiry on each protected request
   and attaches decoded identity to the request context for downstream
   authorization checks.
```

---

## 6. Deployment Architecture

### 6.1 Deployment Topology

```
┌───────────────────────┐        ┌───────────────────────┐
│        Vercel            │        │        Render             │
│  (Frontend Hosting)       │◄──────►│   (Backend API Hosting)   │
│  React SPA, CDN-delivered │  HTTPS │  Node.js/Express Server   │
└───────────────────────┘        └───────────┬───────────┘
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          ▼                                             ▼
             ┌─────────────────────┐                     ┌─────────────────────┐
             │   MongoDB Atlas        │                     │  Cloud Object Storage  │
             │  (Managed Database)    │                     │  (S3/Firebase/GCS)     │
             └─────────────────────┘                     └─────────────────────┘
```

### 6.2 Environment Strategy
| Environment | Purpose | Configuration Notes |
|---|---|---|
| **Development** | Local development and unit testing | Local `.env` files; local or sandbox MongoDB Atlas cluster; mock email service |
| **Staging** | Integration/system/UAT testing before pilot release | Separate MongoDB Atlas cluster/database; staging cloud storage bucket; real email service in sandbox mode |
| **Production (Pilot)** | Live pilot evaluation with real/test users | Production MongoDB Atlas cluster with backup policy; production storage bucket with CDN; monitored deployment |

### 6.3 Configuration Management
- Environment-specific secrets (DB connection strings, JWT secret, storage credentials, email API keys) managed via environment variables, never committed to source control.
- A `.env.example` file documents required variables without exposing actual secrets.

### 6.4 CI/CD Overview (Recommended)
- Source control: GitHub, with `main` (production), `staging`, and feature branches.
- On push to `staging`/`main`: automated build, lint, and test run before deployment trigger.
- Vercel auto-deploys frontend on merge to designated branches.
- Render auto-deploys backend on merge to designated branches, with health-check verification post-deploy.
*(Full detail in the companion Deployment/Environment Setup Guide.)*

---

## 7. Security Architecture

### 7.1 Authentication & Authorization Architecture
- **Stateless JWT authentication:** no server-side session store required, supporting horizontal scaling.
- **Token structure:** signed JWT containing user ID, role, and verification status claims; short-to-medium expiry with refresh handled via re-login (refresh-token rotation is a P2 enhancement).
- **RBAC enforcement:** centralized `requireRole()` / `requirePermission()` middleware applied per route, ensuring authorization is never solely a frontend concern (directly satisfies SRS-FR-2.1, NFR-SEC-7).

### 7.2 Data Protection Architecture
- **Transport security:** HTTPS/TLS enforced at both Vercel and Render edge layers; no plaintext HTTP endpoints exposed.
- **At-rest protection:** MongoDB Atlas encryption-at-rest (platform-provided); sensitive fields (e.g., verification documents) access-restricted via schema-level field permissions and application-layer checks.
- **Password security:** bcrypt hashing with an appropriate cost factor; passwords never returned in any API response payload.

### 7.3 Input & File Validation Architecture
- Centralized schema validation (e.g., Joi/Zod) applied before any controller logic executes, rejecting malformed requests early.
- File-upload pipeline enforces MIME-type allowlisting, file-size limits, and (recommended) content-scanning before persisting to cloud storage.
- MongoDB query construction via parameterized ODM methods (Mongoose) to avoid NoSQL injection vectors; no raw string query concatenation.

### 7.4 Abuse & Fraud Mitigation Architecture
- Rate-limiting on authentication endpoints to reduce brute-force risk (SRS-FR-1.10).
- Verification workflow isolates "Verified" trust signaling from raw registration, reducing (not eliminating) fake-profile risk.
- Reported-content queue routes flagged casting calls/messages/profiles to the Administration Module for human review.
- Admin action logging (AdminActionLog entity) provides an audit trail for moderation decisions.

### 7.5 Threat Model Summary (High-Level)
| Threat | Mitigation |
|---|---|
| Credential stuffing / brute force | Rate limiting, account lockout (SRS-FR-1.10), bcrypt hashing |
| NoSQL injection | Parameterized ODM queries, input validation middleware |
| Cross-Site Scripting (XSS) | Output encoding in React (default JSX escaping), Content-Security-Policy headers, input sanitization |
| Malicious file upload | MIME/type/size validation, storage isolation from application server |
| Broken access control (role escalation) | Server-side RBAC middleware on every route, never relying on client-side checks |
| Man-in-the-middle | HTTPS/TLS enforced end-to-end |
| Data scraping of profiles | Rate limiting on search endpoints (P2), pagination limits |

---

## 8. Scalability and Performance Architecture

### 8.1 Horizontal Scalability
- The Node.js/Express application tier is stateless (JWT-based auth, no in-memory session storage), allowing multiple backend instances to run behind a load balancer without session-affinity requirements.
- MongoDB Atlas supports vertical tier upgrades and, at larger scale, sharding — not required for the pilot phase but architecturally compatible.

### 8.2 Database Performance
- Indexes shall be created on frequently filtered fields: `country`, `category`, `age`, `height`, `status` (CastingCall/Application), and `role` (User) — directly supporting NFR-SCAL-2 and NFR-PERF-1.
- Compound indexes (e.g., `country + category`) recommended for the primary search/filter query pattern.

### 8.3 Media Performance
- All portfolio media is served from cloud object storage with CDN edge caching, decoupling media delivery load from the application server entirely.
- Thumbnail-first loading strategy (NFR-PERF-2) reduces initial payload size for portfolio browsing and search-result rendering.

### 8.4 Matching Engine Performance
- The Matching & Recommendation Engine operates on a pre-filtered candidate set (scoped by country/category before scoring) to bound computation cost, directly supporting NFR-PERF-3 (≤5s for up to 500 candidates).
- Matching results may be cached per casting call for a short TTL to avoid recomputation on repeated dashboard views (P2 optimization).

### 8.5 Caching Strategy (Recommended, P1/P2)
| Cache Target | Approach |
|---|---|
| Search results (common filter combinations) | Short-TTL in-memory or Redis cache (future) |
| Matching scores per casting call | Cache until casting call or candidate pool changes |
| Static assets/thumbnails | CDN caching (handled by cloud storage provider) |

---

## 9. Reliability, Logging, and Monitoring Architecture

### 9.1 Error Handling
- Centralized error-handling middleware normalizes all errors into a consistent JSON structure: `{ success: false, errorCode, message }`.
- Distinct handling for validation errors (400), auth errors (401/403), not-found (404), and server errors (500) — internal details never exposed in the 500 response body.

### 9.2 Logging
- Structured logging (e.g., JSON logs via a logging library) capturing request method, route, status code, latency, and (where authenticated) user ID and role.
- Sensitive data (passwords, tokens, full document contents) explicitly excluded from logs.

### 9.3 Monitoring (Recommended for Pilot/Production)
- Basic uptime monitoring on the deployed backend (health-check endpoint `/api/v1/health`).
- Cloud provider dashboards (Render, MongoDB Atlas, storage provider) used for baseline resource/performance monitoring during pilot evaluation.

---

## 10. Technology Stack Justification

| Layer | Technology | Justification |
|---|---|---|
| Frontend Framework | React.js (Vite) | Component-based architecture fits multi-role dashboards; Vite provides fast HMR vs Create React App; large ecosystem; strong fit with responsive SPA requirements (NFR-USE) |
| Styling | Tailwind CSS | Rapid, consistent UI development; utility-first approach maps cleanly to the design token system defined in the UI/UX Design Document §6 |
| Backend Runtime | Node.js 20 LTS | JavaScript across the stack reduces context-switching; strong async I/O for REST + file uploads; LTS version ensures support window extends beyond project evaluation |
| Backend Framework | Express.js | Minimal, well-documented, widely adopted for RESTful Node.js APIs; large middleware ecosystem (auth, validation, logging, rate-limiting) |
| Real-time | Socket.io | WebSocket with HTTP long-poll fallback; integrates directly into Express via `http.createServer`; handles real-time message delivery and read-receipt events |
| Database | MongoDB (Atlas) | Flexible document schema accommodates heterogeneous role-specific profile structures without complex joins; native JSON fit with Node.js; managed hosting reduces ops overhead |
| Authentication | JWT (access, 15min) + Refresh Token (HTTP-only cookie, 7d) + bcrypt | Short-lived access tokens + rotated refresh tokens minimize breach window while maintaining UX; bcrypt is an industry-standard password hashing algorithm |
| **Media Storage** | **Cloudinary** (**locked**) | Purpose-built for image/video assets; Node.js SDK (`cloudinary` npm); automatic thumbnail generation via transform URL; built-in CDN; free tier (25 GB storage, 25 GB bandwidth/month) is adequate for pilot scale |
| Email | Nodemailer + SendGrid | Handles password-reset (SRS-FR-1.7) and notification emails; SendGrid free tier (100 emails/day) sufficient for pilot; Nodemailer abstracts transport so provider can be swapped |
| Hosting (Frontend) | Vercel | Zero-config React deployment, CDN-backed, generous free tier suitable for academic prototype |
| Hosting (Backend) | Render | Simple Node.js deployment with managed HTTPS, WebSocket support (required for Socket.io), suitable for prototype/pilot scale |
| API Testing | Postman | Enables endpoint-level testing and documentation independent of frontend readiness |

---

## 11. Architecture Decision Records (ADR Summary)

| ADR # | Decision | Alternatives Considered | Rationale for Choice |
|---|---|---|---|
| ADR-01 | Modular monolith over microservices | Microservices per module | Reduces operational complexity for an academic-timeline prototype; module boundaries kept clean for future extraction |
| ADR-02 | MongoDB over relational (PostgreSQL/MySQL) | PostgreSQL, MySQL | Heterogeneous role-based profile schemas fit a document model more naturally than rigid relational tables; avoids complex polymorphic-association SQL patterns |
| ADR-03 | Short-lived JWT access token (15 min) + HTTP-only cookie refresh token (7 days, server-side revocable) | Pure stateless JWT (long-lived) / Redis session store | Long-lived JWTs cannot be revoked without a denylist; this hybrid approach provides revocability via the `refresh_tokens` collection while keeping API requests stateless |
| ADR-04 | **Cloudinary** as the single media storage provider | AWS S3, Firebase Storage, Google Cloud Storage | Cloudinary's free tier is most generous for media specifically (automatic transformation + CDN included); Node.js SDK is simpler than S3's pre-signed URL flow; eliminates three-way ambiguity from v1.0 that would have blocked development decisions |
| ADR-05 | Socket.io (WebSocket + fallback) for real-time messaging | Short-poll REST, Server-Sent Events (SSE) | Socket.io provides true bidirectional real-time delivery; HTTP polling wastes resources; SSE is one-directional and cannot handle read-receipt acknowledgements; Socket.io integrates directly into the existing Express server |
| ADR-06 | Rule/attribute-based matching over ML-based matching | Machine-learning recommendation model | No sufficient training data at prototype stage; explainability requirement (SRS-FR-8.3); avoids overclaiming AI capability (per PRD non-goals) |

---

## 12. Future Architecture Considerations (Post-MVP)

- **Service extraction:** Casting Management, Matching Engine, and Messaging could be extracted into independently deployable services if user/traffic growth demands it.
- **Caching layer:** Introduce Redis for search-result and matching-score caching at scale.
- **Message queue:** Introduce an async job queue (e.g., BullMQ) for thumbnail generation, notification dispatch, and matching computation to avoid blocking API request threads as media/casting volume grows.
- **Search infrastructure:** Migrate from MongoDB query-based filtering to a dedicated search engine (e.g., Elasticsearch/Atlas Search) if filter complexity or data volume grows significantly.
- **Mobile clients:** A dedicated mobile API gateway/versioning strategy would be introduced alongside native app development (post-MVP roadmap, PRD §14).
- **Payments/Identity verification:** Would introduce PCI-scope and third-party KYC integrations as isolated, tightly access-controlled services rather than embedding into the core application tier.

---

*End of System Architecture Design Document.*
