| **Document Type** | Deployment / Environment Setup Guide |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Companion Documents** | System Architecture Design Document v2.0 (§2.2 stack, §10 Tech Stack), Coding Standards & Git Workflow Guide v2.0, Database Design Document v2.0, API Specification v2.0, Security & Data Protection Policy v2.0, Test Plan & QA Strategy v2.0 |
| **Target Stack** | Frontend: Vercel · Backend: Render · Database: MongoDB Atlas · Media: **Cloudinary** (locked) · Email: SendGrid |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial step-by-step setup guide for local, staging, and production environments, consistent with Coding Standards v1.0 §18–19 | Product/Engineering Team |
| 2.0 | 2026-09-08 | **Replaced S3/Firebase/GCS with Cloudinary** as the locked media provider (SADD ADR-04); added Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`); added Socket.io CORS configuration requirement; added SendGrid email env vars; updated all companion document references to v2.0 | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This guide provides the step-by-step procedure to reproduce the system's runtime environment from scratch — locally for development, and in the cloud for staging and pilot production — so the system is not dependent on any one machine's undocumented local state. It exists to satisfy the reproducibility gap named when this document was first scoped: the system must be runnable by someone other than (or a future instance of) the original developer, using only this guide and the repository.

### 1.2 Intended Audience
- The developer, setting up a new machine or recovering a broken local environment
- Academic supervisor or examiner who wants to run the system independently
- Anyone continuing this project post-submission (post-MVP roadmap, PRD §14)

### 1.3 Environments Covered
Consistent with Coding Standards & Git Workflow Guide §18, three environments are defined:

| Environment | Purpose | Where It Runs |
|---|---|---|
| **Development** | Local day-to-day development | Developer's own machine |
| **Staging** | Pre-production verification; target of automatic deploy on merge to `main` | Vercel (frontend) + Render (backend) + MongoDB Atlas (shared/dev cluster) |
| **Production (Pilot)** | UAT/pilot-facing deployment, manually promoted | Vercel (frontend) + Render (backend) + MongoDB Atlas (dedicated pilot database) |

---

## 2. Prerequisites

### 2.1 Accounts Required
| Service | Purpose | Tier for This Project |
|---|---|---|
| GitHub | Source control, CI/CD (Actions), branch protection | Free |
| MongoDB Atlas | Managed MongoDB hosting | Free/Shared (M0) tier for pilot scale (Database Design Document §11) |
| Vercel | Frontend (React SPA) hosting | Free (Hobby) tier |
| Render | Backend (Node.js/Express + Socket.io API) hosting | Free tier (with cold-start caveat, see §8.2) |
| **Cloudinary** | **Portfolio media (images + videos), verification documents — locked choice per SADD ADR-04** | Free tier (25 GB storage, 25 GB bandwidth/month) |
| SendGrid | Password-reset and notification emails (SRS-FR-1.7) | Free tier (100 emails/day) |

### 2.2 Local Tooling Required
| Tool | Minimum Version | Purpose |
|---|---|---|
| Node.js | LTS (as pinned in `.nvmrc`/`engines` field per Coding Standards §3) | Runs both backend and frontend |
| npm | Bundled with Node.js | Package management (`npm ci` per CI workflow) |
| Git | Any recent version | Source control |
| MongoDB Compass (optional) | Latest | GUI inspection of the Atlas database during development |
| A code editor with ESLint/Prettier integration | — | Matches Coding Standards §12 linting rules |

---

## 3. Local Development Environment Setup

### 3.1 Clone the Repository
```bash
git clone https://github.com/<your-org-or-username>/talent-marketplace.git
cd talent-marketplace
```
This is the monorepo structure defined in Coding Standards §3.1 (`backend/`, `frontend/`, `docs/`, `.github/`).

### 3.2 Provision a MongoDB Atlas Cluster (Development)
1. Create a free (M0) shared cluster in MongoDB Atlas.
2. Create a database user with a strong, generated password (not reused from any personal account).
3. Under Network Access, add your current IP (or `0.0.0.0/0` only for local development convenience — never for staging/production, see §5.3).
4. Copy the connection string; this becomes the `MONGO_URI` environment variable.

### 3.3 Provision Cloud Object Storage (Development)
1. Create a storage bucket (or Firebase project / GCS bucket) dedicated to development — **never share a bucket between development and production** to avoid accidental cross-contamination of pilot user data with test uploads.
2. Generate an access key/service account credential scoped to only that bucket (least privilege, per Security & Data Protection Policy §5).
3. Note the bucket name/region and credentials; these become `CLOUD_STORAGE_BUCKET` and `CLOUD_STORAGE_KEY`.

### 3.4 Backend Setup
```bash
cd backend
npm ci
cp .env.example .env
```
Populate `.env` with the following (see §4 for the full variable reference):
```
NODE_ENV=development
PORT=5000
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<a long, random, locally generated secret — never reused across environments>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<a second, distinct random secret>
REFRESH_TOKEN_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<your Cloudinary cloud name>
CLOUDINARY_API_KEY=<your Cloudinary API key>
CLOUDINARY_API_SECRET=<your Cloudinary API secret>
SENDGRID_API_KEY=<your SendGrid API key, sandbox mode for dev>
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```
Start the backend:
```bash
npm run dev
```
Confirm it is running by requesting the health-check endpoint (Architecture §9.3):
```bash
curl http://localhost:5000/api/v1/health
```

### 3.5 Frontend Setup
```bash
cd ../frontend
npm ci
cp .env.example .env
```
Populate `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```
*(Variable name/prefix depends on the frontend build tool selected — e.g., `VITE_` prefix for Vite, `REACT_APP_` for Create React App; keep consistent with whichever the project actually uses and update `.env.example` accordingly, per Coding Standards §18.)*

Start the frontend:
```bash
npm run dev
```
The application should now be reachable at `http://localhost:3000`, calling the local backend.

### 3.6 Seed Data (Recommended)
Per Database Design Document §10, a lightweight seed script should populate development with representative sample data (users across all four roles, sample casting calls, applications) so the environment is immediately demoable without manual data entry:
```bash
cd backend
npm run seed
```
Seed data must be clearly distinguishable from real data (e.g., email addresses under a reserved test domain) so it is never mistaken for genuine pilot users if a database is later promoted or inspected.

### 3.7 Verifying the Local Setup
| Check | Expected Result |
|---|---|
| `curl http://localhost:5000/api/v1/health` | `200 OK` with a health status payload |
| Register a new user via the frontend | Account created; visible in MongoDB Compass under `users` |
| Log in | JWT access token returned in response; `refreshToken` HTTP-only cookie set |
| Upload a portfolio image | File appears in Cloudinary dashboard under your cloud name; `mediaUrl` in response is a `res.cloudinary.com` URL |
| `npm run lint` (both `backend/` and `frontend/`) | No errors (Coding Standards §12) |
| `npm test` (both `backend/` and `frontend/`) | All existing tests pass |

---

## 4. Environment Variable Reference

The complete set of environment variables the application reads, consistent with Coding Standards §18's single `config/index.js` validation module. Every variable below **must** exist in `.env.example` with a placeholder value; production/staging values are never committed.

| Variable | Required In | Description |
|---|---|---|
| `NODE_ENV` | All | `development` \| `staging` \| `production` — never branched on via ad-hoc string checks elsewhere in the code |
| `PORT` | All (backend) | Port the Express server listens on (Render assigns this dynamically in staging/production — see §6.3) |
| `MONGO_URI` | All | Full Atlas connection string, environment-specific (dev/staging/pilot cluster) |
| `JWT_SECRET` | All | HMAC signing secret for access tokens; **must differ per environment** and never be reused |
| `JWT_EXPIRES_IN` | All | Access token lifetime (**`15m`** — API Specification §2.8; short-lived for security) |
| `REFRESH_TOKEN_SECRET` | All | Separate signing secret for refresh tokens |
| `REFRESH_TOKEN_EXPIRES_IN` | All | Refresh token lifetime (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | All | Cloudinary cloud name (from Cloudinary dashboard) |
| `CLOUDINARY_API_KEY` | All | Cloudinary API key (from Cloudinary dashboard) |
| `CLOUDINARY_API_SECRET` | All | Cloudinary API secret (from Cloudinary dashboard) — **never expose to frontend** |
| `SENDGRID_API_KEY` | All | SendGrid API key for transactional email (password reset, SRS-FR-1.7) |
| `FRONTEND_URL` | All | Used for CORS allowlisting and password-reset link generation |
| `CORS_ALLOWED_ORIGINS` | All | Comma-separated list of allowed CORS origins (required for Socket.io WebSocket connections) |
| `RATE_LIMIT_WINDOW_MS` | All | Login/registration rate-limiting window (Security & Data Protection Policy §3.4) |
| `RATE_LIMIT_MAX_ATTEMPTS` | All | Max attempts within the window |
| `LOG_LEVEL` | All | `debug` in development, `info` in staging/production |

**Rule (Coding Standards §20 Quick Reference):** any new environment variable introduced during development must be added to `.env.example` and to `config/index.js`'s required-variable validation in the same commit that introduces its usage — the application should fail fast at startup with a clear error if a required variable is missing, rather than failing unpredictably later at first use.

---

## 5. Staging Environment Setup

### 5.1 Purpose
Staging is the automatic deployment target for every merge to `main` (Coding Standards §19), used to verify a build before it is manually promoted to production/pilot. It should mirror production configuration as closely as possible while using isolated data.

### 5.2 MongoDB Atlas — Staging Cluster
1. Within the same Atlas project, provision a second cluster (or a separate database within the shared free tier if budget-constrained) dedicated to staging.
2. Create a staging-specific database user, distinct credentials from development and production.
3. Network Access: restrict to Render's staging service (via Atlas's IP allowlist, or use Atlas's "Allow access from anywhere" only if Render's outbound IPs are not practically enumerable on the free tier — document whichever choice is made and why, since this is a real security trade-off, not a default to accept silently).

### 5.3 Cloudinary — Staging Configuration
- Cloudinary supports multiple environment-isolated configurations via its **"upload presets"** or by using a distinct upload folder prefix (e.g., `staging/portfolio/` vs `production/portfolio/`). For pilot simplicity, use a single Cloudinary account with folder prefixes, unless separate accounts are available.
- The `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` values for staging can be the same as development if using folder-based separation, but must be rotated to production-specific values in the production environment.

### 5.4 Vercel — Frontend Staging Deployment
1. Connect the GitHub repository to a Vercel project.
2. Configure the build: root directory `frontend/`, build command `npm run build`, output directory per the frontend framework's convention.
3. Set environment variables in the Vercel dashboard (Project Settings → Environment Variables) scoped to the "Preview"/staging environment: `VITE_API_BASE_URL` (or equivalent) pointing to the Render staging backend URL.
4. Enable automatic deployment on push to `main` (Vercel's default behavior for the connected branch).

### 5.5 Render — Backend Staging Deployment
1. Create a new Web Service on Render, connected to the same GitHub repository, root directory `backend/`.
2. Build command: `npm ci`. Start command: `npm start` (or the project's defined production-start script).
3. Set all environment variables from §4 in Render's dashboard (Environment tab), using staging-specific values (staging `MONGO_URI`, a staging-only `JWT_SECRET`, staging storage bucket).
4. Enable automatic deploy on push to `main`, matching the CI workflow's stated behavior (Coding Standards §19, step 5).
5. Confirm the health-check endpoint (`/api/v1/health`) responds correctly after each staging deploy — this is the fastest smoke test that the deployment succeeded structurally, independent of any specific feature.

### 5.6 CI/CD Pipeline (Reference)
Reproduced here for completeness — the authoritative definition lives in Coding Standards & Git Workflow Guide §19 and the actual `.github/workflows/ci.yml` file:

```
PR opened / push to main
   │
   ▼
1. Install (npm ci — backend & frontend)
   │
   ▼
2. Lint (ESLint + Prettier — fails build on violation)
   │
   ▼
3. Unit & Integration Tests (Jest/Supertest backend, Jest/RTL frontend)
   │
   ▼
4. Build (frontend production build)
   │
   ▼
5. [main branch only] Deploy → Vercel (frontend) + Render (backend) staging
   │
   ▼
6. [nightly, scheduled] Full regression suite against staging (Test Plan §12)
```
A pull request cannot merge into `main` while steps 1–4 are failing (GitHub branch protection rule, Coding Standards §19).

---

## 6. Production (Pilot) Environment Setup

### 6.1 Key Difference From Staging
Production/pilot deployment is a **manual promotion step**, never automatic — this is a deliberate human checkpoint before the pilot-facing environment changes (Coding Standards §19, step 5), given that this environment will handle real UAT participant data (Security & Data Protection Policy §10).

### 6.2 MongoDB Atlas — Production Cluster
1. Provision a cluster dedicated to production/pilot data, fully isolated from development and staging.
2. Enable MongoDB Atlas's built-in encryption-at-rest (Security & Data Protection Policy §4.4) — confirm this is active, not merely available, for the pilot cluster's tier.
3. Configure automated backups (Atlas's built-in scheduled snapshot feature) at a frequency appropriate to pilot data value (daily is sufficient at this scale).
4. Network Access: restrict strictly to Render's production service; do not leave `0.0.0.0/0` open on the production cluster under any circumstance.

### 6.3 Render — Backend Production Deployment
1. Create a **separate** Render Web Service (or a separate environment within the same service, depending on Render's plan features) for production, distinct from staging.
2. Promote a specific, tested commit/tag from staging (per Coding Standards §17 SemVer release tagging, aligned to PRD §14 roadmap phases) — never deploy an untagged, in-progress commit directly to production.
3. Set production-specific environment variables (§4), including a production-only `JWT_SECRET`/`REFRESH_TOKEN_SECRET` generated fresh, never reused from staging or development.
4. Verify HTTPS/TLS is active (Render provides this by default; confirm, do not assume — Security & Data Protection Policy §4.5) and that HSTS headers are set by the application.

### 6.4 Vercel — Frontend Production Deployment
1. Promote the corresponding frontend build to Vercel's Production environment (Vercel distinguishes Preview/staging deployments from the Production deployment tied to the production domain).
2. Set the production `VITE_API_BASE_URL` (or equivalent) to the production Render backend URL.
3. Confirm the production domain (Vercel-provided or a custom domain, if configured) resolves correctly over HTTPS.

### 6.5 Cloud Storage — Production Bucket
- A dedicated production bucket, isolated from staging/development, with:
  - Verification documents stored in a path/bucket segment access-restricted to the Admin-facing endpoint only (Security & Data Protection Policy §7.2).
  - CDN configuration (if using S3 + CloudFront, or the storage provider's native CDN) enabled for public portfolio media delivery (Architecture §8.3).

### 6.6 Post-Deployment Smoke Test Checklist
| Check | Expected Result |
|---|---|
| Health-check endpoint | `200 OK` |
| Register + login on production domain | Succeeds end-to-end |
| Upload a portfolio image | Stored in production bucket; thumbnail generated; visible via CDN URL |
| Create and browse a casting call | Visible in search with correct country/category filtering |
| HTTPS enforced | HTTP requests redirect to HTTPS; no mixed-content warnings in browser console |
| CORS | Frontend production domain can call backend production API; an arbitrary third-party origin cannot (Security & Data Protection Policy) |

### 6.7 Rollback Procedure
If a production deployment introduces a regression:
1. Re-promote the last known-good tagged release on both Render and Vercel (both platforms retain prior deployment history for quick rollback).
2. If the issue involves a database migration, apply the corresponding down-migration (per Database Design Document §10's migration tooling) before rolling back application code, to avoid a version/schema mismatch.
3. Record the incident per Security & Data Protection Policy §11 (Incident Response) if the rollback was triggered by a security or data-integrity issue, not merely a UI bug.

---

## 7. Environment Comparison Summary

| Aspect | Development | Staging | Production (Pilot) |
|---|---|---|---|
| Trigger | Manual (local run) | Automatic on merge to `main` | Manual promotion of a tagged release |
| Database | Local dev Atlas cluster | Dedicated staging cluster | Dedicated, backed-up, encrypted-at-rest cluster |
| Storage bucket | Dev bucket | Staging bucket | Production bucket (verification docs access-restricted) |
| Secrets | Local `.env`, personal generated secrets | Vercel/Render dashboard, staging-only secrets | Vercel/Render dashboard, production-only secrets, freshly generated |
| Data | Seed/sample data only | Isolated test data | Real pilot/UAT participant data |
| Logging | `debug` level, verbose | `info` level | `info` level, sensitive data excluded (Architecture §9.2) |
| Access | Developer only | Developer + supervisor (if given preview link) | Developer, admin, and pilot participants |

---

## 8. Operational Notes and Known Constraints

### 8.1 Free-Tier Limits (Risk Register RT-04)
- MongoDB Atlas free/shared tier has a storage and connection-count ceiling; monitor Atlas's usage dashboard during UAT/pilot and have the upgrade path (a low-cost dedicated tier) ready to trigger if approaching the limit, rather than discovering it as an outage.
- Render's free tier for backend services may **spin down after a period of inactivity** and incur a cold-start delay on the next request — this should be explicitly accounted for during UAT scheduling (warm the service with a request shortly before a scheduled UAT session) and disclosed as a known limitation if it affects perceived performance during evaluation, rather than treated as a defect during grading.

### 8.2 Secrets Rotation
- If any secret (`JWT_SECRET`, storage credential) is ever exposed (e.g., accidentally committed — see Risk Register RSEC-04), rotate it immediately in the relevant dashboard (Render/Vercel/Atlas/storage provider) and redeploy; do not consider the exposure resolved by removing it from a future commit alone, since Git history retains it.

### 8.3 Environment Parity
- Keep staging and production configuration structurally identical (same environment variable *names*, different *values*) so a staging smoke test is actually predictive of production behavior — divergence between the two environments undermines the entire purpose of having a staging gate before production promotion.

---

## 9. Traceability to Other Documents

| This Guide | Source / Cross-Reference |
|---|---|
| §2.1 Accounts, §7 Stack | Architecture Document §2.2, §10 (Technology Stack Justification) |
| §4 Environment Variables | Coding Standards & Git Workflow Guide §18 |
| §5.6 CI/CD Pipeline | Coding Standards & Git Workflow Guide §19 |
| §6.2 Encryption/Backups | Security & Data Protection Policy §4.4 |
| §6.5 Bucket Isolation | Security & Data Protection Policy §7.2 |
| §8.1 Free-Tier Risk | Risk Register RT-04 |
| §8.2 Secrets Exposure | Risk Register RSEC-04 |
| Overall Phase Alignment | Project Plan / Gantt Timeline, Phase 4 (Deployment) |

---

*End of Deployment / Environment Setup Guide.*
