# ATELIER Talent — Global Multidimensional Talent Marketplace & Casting Management System

A full-stack (MERN) web platform connecting **models**, **industry professionals** (agencies, brands, photographers, directors), and **pageant organizers** in one role-based, verified marketplace — with casting call publishing, application/shortlisting workflows, rule-based compatibility scoring, real-time chat, and an admin moderation console.

Built as a BSc (Hons) Software Engineering capstone project at NSBM Green University, Sri Lanka. Demo data throughout this README and the seeded database is entirely fictional — no real person, agency, or pageant brand is represented.

---

## Project & Submission Details

| Field | Detail |
|---|---|
| **Project title** | Global Multidimensional Talent Marketplace and Casting Management System (product name: ATELIER Talent) |
| **Candidate** | Sandun Prabath (A.M.S.P Athapaththu) |
| **Student / Index number** | 28607 |
| **Degree programme** | BSc (Hons) Software Engineering |
| **Institution** | NSBM Green University, Sri Lanka — Faculty of Computing |
| **Supervisor** | Ms. Lakni Peiris |
| **Submission period** | September 2026 |
| **Research approach** | Design and Development Research (DDR) with an Agile, sprint-based build (4 monthly sprints) |
| **Repository** | [github.com/SithijaPrabhashEkanayake/atelier-talent](https://github.com/SithijaPrabhashEkanayake/atelier-talent) |
| **Live demo (free hosting)** | [atelier-talent.onrender.com](https://atelier-talent.onrender.com/) |
| **Candidate contact** | `<add university email>` |

> Fill in the candidate contact placeholder before submitting. Everything else above is taken from the project's own documents in `Docs/`.

### Problem, aim and scope (summary)
- **Problem:** Fashion, media and pageant recruitment still relies on unverified social-media DMs, agency lock-in and manual portfolio review, which creates a trust gap, slow casting cycles and little access for independent talent.
- **Aim:** One secure, role-based platform where models, industry professionals and pageant organizers can publish verified profiles and casting calls, apply and shortlist, and communicate — with transparent, explainable candidate ranking.
- **In scope:** multi-role auth and RBAC, role-specific profiles, multimedia portfolios, country-aware search/filtering, casting calls and applications, rule-based matching, in-platform chat and notifications, admin moderation and analytics.
- **Out of scope (by design):** payments/escrow, legal-grade identity verification, facial-recognition or ML scoring, native mobile apps, e-signatures. Full list in `Docs/PRD_Global_Talent_Marketplace_and_Casting_Management_System.md` §6.2.

### Project deliverables checklist
| Deliverable | Location |
|---|---|
| Working web application (frontend + backend) | `frontend/`, `backend/` |
| Automated tests (67 tests, 12 suites) | `backend/__tests__/` — run `npm test` |
| Demo data seeders | `backend/scripts/` — `seed:demo`, `seed:sl` |
| Deployment configuration | `render.yaml`, `docker-compose.yml`, `frontend/nginx.conf` |
| Engineering documents | `Docs/` (see index below) |
| Dissertation / proposal / slides (PDF, PPTX) | `../PDFs/` (outside this folder, in the parent project directory) |
| Viva demo script and Q&A | `Docs/viva_demo_script.md` |

### Documentation index (`Docs/`)
| Document | Purpose |
|---|---|
| **`Sandun_Distinction_Viva_Defense_Encyclopedia.md`** | **⭐ Definitive All-in-One Master Defense Manual, Screen-by-Screen Catalog, 25 Rebuttals & Technical Encyclopedia** |
| **`Mac_Quickstart_and_Presentation_Guide.md`** | **🍎 macOS Zero-Friction Setup, Presentation Choreography & Hardware Survival Guide** |
| `PRD_Global_Talent_Marketplace_and_Casting_Management_System.md` | Vision, personas, goals, KPIs, scope, roadmap |
| `SRS_Global_Talent_Marketplace_and_Casting_Management_System.md` | Functional (FR) and non-functional (NFR) requirements |
| `System_Architecture_Design_Document.md`, `system_architecture_diagram.md` | Architecture, decisions, diagrams |
| `Database_Design_Document.md` | ERD, collections, indexes |
| `API_Specification.md`, `api_documentation.md` | REST and WebSocket contracts |
| `UI_UX_Design_Document.md` | Design system and screen layouts |
| `Security_Data_Protection_Policy.md` | Security controls and threat model |
| `Test_Plan_QA_Strategy.md`, `uat_report.md` | Testing strategy and user-acceptance results |
| `Coding_Standards_Git_Workflow_Guide.md` | Conventions and workflow |
| `Deployment_Environment_Setup_Guide.md` | Environment and deployment guide |
| `Risk_Register.md`, `Sprint_Backlog.md`, `Project_Plan_Gantt_Timeline.md` | Project management artefacts |
| `Admin_Guide.md`, `User_Guide.md` | End-user and admin manuals |
| `Project Proposal SAndun Prabath.md`, `Final Project Chap 1,2,3.md`, `Final Project 2.md`, `Sandun Presentation.md` | Proposal, interim and final report text, presentation |
| `docs_codebase_alignment_matrix.md` | Document-to-code traceability |
| `viva_demo_script.md` | Timed viva walkthrough |

### Requirements traceability (where each feature lives)
| Capability | Backend | Frontend |
|---|---|---|
| Authentication, refresh tokens, password reset | `controllers/authController.js`, `middleware/` | `pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` |
| Role profiles | `controllers/profileController.js`, `models/*Profile.js` | `pages/ProfileEditor.jsx`, `PublicProfile.jsx` |
| Portfolio and media | `controllers/portfolioController.js`, Cloudinary | `pages/PortfolioManager.jsx`, `components/MediaLightbox.jsx` |
| Casting calls and applications | `controllers/castingController.js`, `applicationController.js` | `pages/CastingBoard.jsx`, `CastingDetail.jsx`, `CreateCasting.jsx`, `MyApplications.jsx`, `ManageApplicants.jsx` |
| Search and matching | `controllers/searchController.js`, `services/matchingEngine.js` | `pages/TalentSearch.jsx` |
| Chat and notifications | `sockets/chatSocket.js`, `controllers/messageController.js`, `notificationController.js` | `pages/Chat.jsx`, `Notifications.jsx` |
| Admin, moderation, analytics | `controllers/adminController.js`, `analyticsController.js`, `reportController.js` | `pages/AdminDashboard.jsx` |

### Pre-submission checklist for the student
1. Rotate the MongoDB Atlas password and Cloudinary API secret (they have appeared in shared logs), then update `backend/.env` and the hosting environment variables.
2. Deploy to Render (see Free Hosting), then paste the live URL and repository URL into the table above.
3. Run `npm run seed:demo` and `npm run seed:sl` against the live database so the demo has data.
4. Run `cd backend && npm test` and `cd frontend && npm run build && npm run lint` and confirm all pass.
5. Open the live URL a few minutes before the viva (free tier sleeps when idle) and rehearse with `Docs/viva_demo_script.md`.
6. Quote the real numbers in the viva: 67 tests across 12 suites, 12 Mongoose models, 4 roles.
7. Be ready to explain: the matching engine is deterministic and rule-based (not AI/ML); the evaluation sample was small; payments and localization (Sinhala/Tamil) are documented limitations.

### Academic integrity and third-party material
- All seeded people, agencies and pageants are fictional; placeholder photos come from `i.pravatar.cc` and Unsplash and belong to their respective sources.
- Open-source libraries are used under their own licences (see each `package.json`). The backend `package.json` declares the ISC licence.
- Cite this repository, the dissertation and the supervisor's guidance where the university requires it.

---

## Table of Contents
0. [Project & Submission Details](#project--submission-details)
1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Responsive Design & QA](#responsive-design--qa)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Local Development Setup](#local-development-setup)
7. [Demo Accounts & Seed Data](#demo-accounts--seed-data)
8. [Free Hosting (Render, single service)](#free-hosting-render-single-service)
9. [Docker Deployment](#docker-deployment)
10. [Testing](#testing)
11. [Security](#security)
12. [Environment Variables Reference](#environment-variables-reference)
13. [Known Limitations](#known-limitations)
14. [Viva / Live Demo Notes](#viva--live-demo-notes)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite, Tailwind CSS v4, Framer Motion, Zustand, Recharts, Socket.io-client |
| Backend | Node.js, Express 5, Mongoose 9 (MongoDB), Socket.io 4, JWT, bcryptjs |
| Media storage | Cloudinary (portfolio images/video) |
| Database | MongoDB (Atlas free tier in production, `mongodb-memory-server` for tests, local Mongo binary for offline dev) |
| Testing | Jest + Supertest (backend), 67 tests across 12 suites |
| Deployment | Render (Node web service), Docker + Nginx (self-hosted alternative) |

---

## Features

**All roles**
- Registration and login as Model, Industry Professional, or Pageant Organizer; JWT access token (memory-only, never stored in `localStorage`) + rotating httpOnly refresh-token cookie; password reset by email (or console-logged link if no SMTP is configured); double-submit-cookie CSRF protection; per-route rate limiting.

**Models**
- Role-specific profile: measurements, category, representation status (freelance/agency), experience history, skills, social links.
- Multimedia portfolio manager (Cloudinary upload, drag-to-reorder, cover photo).
- Public comp-card profile page with a full-screen lightbox gallery.
- Browse and apply to open casting calls; track application status; direct chat unlocks once accepted.

**Industry Professionals**
- Organization profile (agency / brand / photographer / director) with verification badge.
- Publish, edit, and close casting calls with structured criteria (age, height, category, experience, skills).
- Manage Applicants view with a per-candidate **compatibility score** and an explainable factor-by-factor breakdown (deterministic weighted scoring — not a black-box ML model, and the UI is worded to say exactly that).
- Talent Scout search/filter directory with a compare tray and a rough casting-budget estimator.

**Pageant Organizers**
- Institutional profile with pageant history and official status.
- Same casting-call and applicant-management tooling as industry professionals.

**Admin**
- Platform-wide analytics (registrations, castings, applications over time).
- User suspend/reactivate, casting-call moderation (remove/restore), a user-report review queue, and an admin action audit log.

---

## Responsive Design & QA

The UI targets three consistent breakpoints across every page: mobile (< 1024px, hamburger navigation), and desktop (≥ 1024px, full navbar). Every screen was audited at 375px (mobile), 768px (tablet), and 1280px (desktop) widths, checking for real horizontal overflow (`document.body.scrollWidth` vs viewport width) rather than just eyeballing screenshots.

Notable fixes from that audit, kept here as a record of what to watch for if the design changes again:
- **Navbar breakpoint mismatch** — the desktop nav previously appeared in three different pieces at three different breakpoints (`sm`/`md`/`lg`), so at tablet widths (~768px) the full set of nav links, search bar, and action buttons all tried to render together without enough room — the "Join Network" button was pushed ~127px off the right edge of the viewport, completely inaccessible. Fixed by unifying the mobile-hamburger/desktop-nav switch to a single `lg` (1024px) breakpoint everywhere in `Navbar.jsx`.
- **Category/tab pills wrapping inside their own badge** — filter chips on Talent Scout (`TalentSearch.jsx`) and the Admin Dashboard's main tab row were missing `whitespace-nowrap`, so labels like "All Disciplines" or "Analytics & Intelligence" wrapped onto two lines inside a pill shaped for one, while sibling pills stayed single-line — visually broken and inconsistent row heights.
- **Missing scrollbar-hiding utility** — `no-scrollbar` and `scrollbar-none` were referenced on four horizontally-scrollable rows (category pills, admin tabs, the talent carousel) but never actually defined anywhere in CSS, so the browser's default chunky scrollbar rendered unstyled under each of those rows instead of being hidden. Added the missing utility classes to `index.css`.
- **CSP blocking hosted images** — unrelated to layout, but found during the same pass: Helmet's default Content-Security-Policy in production mode only allowed `img-src 'self' data:`, silently blocking every Cloudinary/pravatar/Unsplash-hosted photo on the real hosted deployment. Fixed with an explicit CSP in `server.js` matching the one already used by `frontend/nginx.conf`.

---

## Project Structure

```
talent-marketplace/
├── backend/
│   ├── controllers/      # Route handlers (business logic)
│   ├── middleware/       # auth, RBAC, rate limiting, CSRF, sanitization
│   ├── models/           # 12 Mongoose schemas
│   ├── routes/           # Express routers
│   ├── services/         # matchingEngine.js — the compatibility scoring algorithm
│   ├── sockets/          # Socket.io chat namespace
│   ├── scripts/          # seed-dev.js, seed-demo.js, seed-sri-lanka.js, dev-mongo.js
│   ├── __tests__/        # Jest + Supertest suites
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/        # Route-level views
│   │   ├── components/   # Navbar, Footer, modals, shared UI
│   │   ├── store/        # Zustand stores (auth, theme, compare)
│   │   └── api/          # axios instance + interceptors
│   └── vite.config.js
├── docker-compose.yml
├── render.yaml
└── README.md              # you are here
```

---

## Prerequisites

- Node.js 20+
- A MongoDB connection — one of:
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) M0 cluster (recommended for anything beyond local testing), **or**
  - A local MongoDB instance, **or**
  - No install needed at all: `backend/scripts/dev-mongo.js` spins up a disposable, real MongoDB binary via `mongodb-memory-server` on a fixed local port — use this if you don't want to install MongoDB or can't reach Atlas from your network.
- A free [Cloudinary](https://cloudinary.com/users/register/free) account (for portfolio media upload).

---

## Local Development Setup

### ⚡ One-Click Cross-Platform Launchers (Recommended)

To make running and presenting the application as smooth as butter, automated single-command launchers are provided for both operating systems:

#### 🍎 macOS (Apple Silicon M1/M2/M3/M4 & Intel Mac)
```bash
cd talent-marketplace
bash start-mac.sh
```
* **Auto-Dependency Management:** If you copied this folder from a Windows PC via USB/SSD, `start-mac.sh` automatically detects incompatible Windows binaries in `node_modules`, purges them, and installs native macOS packages!
* **AirPlay Port 5000 Guard:** macOS AirPlay Receiver uses port 5000 by default. `start-mac.sh` alerts you and offers an automatic fallback to **Port 5001** if AirPlay is running.
* **Auto-Configuration:** Generates working `backend/.env` with pre-configured Atlas credentials if missing.
* **Dual Server Boot:** Boots both Backend API and Frontend Vite client simultaneously.
*(See [`MAC_SETUP.md`](MAC_SETUP.md) or [`Docs/Mac_Quickstart_and_Presentation_Guide.md`](../Docs/Mac_Quickstart_and_Presentation_Guide.md) for full instructions).*

#### 🪟 Windows PC
Double-click `start-pc.bat` (or run `start-pc.bat` from terminal) inside `talent-marketplace/`. It launches both the backend and frontend in separate synchronized command windows.

---

### 🛠️ Manual Step-by-Step Setup

1. **Environment files**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   Fill in `backend/.env`: `MONGO_URI`, a generated `JWT_SECRET` (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`), and your Cloudinary credentials. The frontend `.env` can usually stay untouched in local dev (see comments in the file).

2. **Install and run the backend**
   ```bash
   cd backend
   npm install
   npm run dev          # nodemon, http://localhost:5000
   ```
   If you don't have MongoDB installed and can't reach Atlas, run a local disposable database instead, in its own terminal, and point `MONGO_URI` at it:
   ```bash
   node scripts/dev-mongo.js
   # then, in another terminal:
   MONGO_URI=mongodb://127.0.0.1:27117/talent-marketplace npm run dev
   ```

3. **Install and run the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev           # http://localhost:5173
   ```

4. **Seed demo data** (see next section for account details) — run one or both:
   ```bash
   cd backend
   npm run seed:demo     # small narrative set: 8 models, 4 agencies, 2 pageant orgs, chat history, notifications
   npm run seed:sl       # large Sri Lanka dataset: 100 accounts per role, realistic-looking
   ```

---

## Demo Accounts & Seed Data

All seeded accounts share the password **`Password123`**.

### Narrative demo set (`npm run seed:demo`) — small, story-driven
Includes chat history, notifications, and admin reports so every screen has something to show.

| Role | Login | Notes |
|---|---|---|
| Admin | `admin@demo.talent` | |
| Model | `model1@demo.talent` | Amara Silva — verified, agency-represented |
| Industry Professional | `organizer1@demo.talent` | Serendib Fashion House |
| Pageant Organizer | `pageant1@demo.talent` | Miss Island Pageant Org |

8 models total (`model1`–`model8`@demo.talent), 4 industry profiles (`organizer1`–`organizer4`), 2 pageant orgs (`pageant1`–`pageant2`), 8 casting calls, applications across every status, and a few accepted applications with live chat threads.

### Bulk Sri Lanka demo set (`npm run seed:sl`) — 100 accounts per role
Generates a realistic-looking, volume-scale dataset so search, filtering, pagination, and the admin analytics dashboard have real numbers to show instead of 2-3 rows. Every name is generated by combining common Sri Lankan given-name and surname pools and every organization/pageant name is templated from generic descriptors plus real Sri Lankan city names — **none of it represents a real person, agency, or pageant brand.**

| Role | Login pattern | Count |
|---|---|---|
| Model | `model1@sl.demo.talent` – `model100@sl.demo.talent` | 100 |
| Industry Professional | `industry1@sl.demo.talent` – `industry100@sl.demo.talent` | 100 |
| Pageant Organizer | `pageant1@sl.demo.talent` – `pageant100@sl.demo.talent` | 100 |

Also generates ~40-55 open casting calls (spread across the industry-professional accounts) and a realistic scatter of applications in every status, so the search/filter grid, casting board, and admin analytics all have real depth to browse.

Run with a different count if you want more or fewer than 100 per role:
```bash
node scripts/seed-sri-lanka.js 50   # 50 per role instead of 100
```

Both scripts are idempotent — re-running either one clears and regenerates only its own accounts (by email suffix), and both refuse to run with `NODE_ENV=production` as a safety guard against accidentally wiping a real database.

---

## Free Hosting (Render, single service)

The app is set up to deploy as **one free Render web service** — the Node backend serves both the REST/WebSocket API *and* the built React app from the same origin. This isn't just for convenience: the refresh-token cookie is `sameSite: 'strict'` and CSRF uses a double-submit cookie, both of which require the frontend and API to share an origin. Splitting them across two separate free hosts (e.g. a static frontend host + a separate API host) would silently break login persistence and every write request.

### One-time setup
1. **Rotate your credentials first.** If your `backend/.env` has ever been shared or committed, rotate the MongoDB password and Cloudinary API secret before deploying.
2. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Render's outbound IPs aren't static on the free tier).
3. Push this repository to GitHub (`.env` is already git-ignored).
4. In Render: **New → Blueprint**, point it at the repo — it reads `render.yaml` automatically.
5. Fill in the env vars Render prompts for (marked `sync: false` in `render.yaml`): `MONGO_URI`, `CLIENT_URL` (set this to the Render URL once it's assigned, e.g. `https://talent-marketplace.onrender.com`), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are auto-generated by Render.
6. Deploy. Render runs `render.yaml`'s build (`frontend build` → `backend install`) and start (`backend serves everything`) commands automatically.
7. Seed the live database once, from your own machine:
   ```bash
   MONGO_URI="<your Atlas URI>" npm run seed:demo
   MONGO_URI="<your Atlas URI>" npm run seed:sl
   ```

### Free-tier caveat
Render's free web services sleep after 15 minutes idle; the first request afterward takes 30–60 seconds to wake up. Open the URL a few minutes before you need it (e.g. before a viva demo), or set up a free [UptimeRobot](https://uptimerobot.com) monitor pinging `/api/health` every 5 minutes to keep it warm.

---

## Docker Deployment

An alternative, self-hosted path (VPS, DigitalOcean, AWS, etc.) using the included `docker-compose.yml` (Nginx + backend + a bundled Mongo container):

```bash
# In the project root, create a .env with:
#   JWT_SECRET=<random 64-char hex>
#   MONGO_ROOT_PASSWORD=<strong password>
#   CLIENT_URL=<public URL>
#   CLOUDINARY_CLOUD_NAME=...
#   CLOUDINARY_API_KEY=...
#   CLOUDINARY_API_SECRET=...
docker-compose up -d --build
```
Nginx serves the app on port 80; the backend and MongoDB containers are not exposed to the host.

---

## Testing

```bash
cd backend
npm test
```
Runs against a disposable in-memory MongoDB (`mongodb-memory-server`) — no network access, no Atlas allowlist, no shared state with dev/production data. Current suite: **67 tests across 12 files, all passing.**

```bash
cd frontend
npm run build   # production build sanity check
npm run lint    # oxlint
```

`.github/workflows/ci.yml` runs backend lint+test and frontend lint+build on every push/PR once this repo is on GitHub.

---

## Security

- Passwords hashed with bcrypt (cost factor 10), never logged or returned in any API response.
- JWT access tokens (15 min) held in memory only on the client, never `localStorage`; 7-day single-use rotating refresh tokens in an `httpOnly`, `sameSite: strict` cookie.
- Double-submit-cookie CSRF protection on all state-mutating requests.
- Hand-rolled Mongo-operator sanitization middleware strips `$`/dotted keys from `body`/`params`/`query` before they reach Mongoose.
- Rate limiting: 300 req/15 min baseline on `/api`, a tighter 10 req/15 min on `/api/auth`.
- Server-side RBAC on every mutating route (`protect` + `authorize(role)` middleware) — the frontend hiding a button is never treated as the actual access control.
- Full detail: `Docs/Security_Data_Protection_Policy.md`.

---

## Environment Variables Reference

### `backend/.env`
| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | Atlas, local, or Docker connection string |
| `JWT_SECRET` | Yes | Generate with the command shown in `.env.example` |
| `JWT_EXPIRE` | No | Default `15m` |
| `CLIENT_URL` | Yes | Frontend origin, used for CORS |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Yes | Portfolio media upload |
| `FRONTEND_URL` | No | Used to build password-reset email links; defaults to `CLIENT_URL` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | No | If unset, password-reset links are logged to the console instead of emailed |
| `NODE_ENV` | No | `development` (default), `test`, or `production` — `production` also switches `server.js` to serve `frontend/dist` |
| `PORT` | No | Default `5000` |

### `frontend/.env`
| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | No | Defaults to `http://localhost:5000/api` in dev, same-origin `/api` in a production build |
| `VITE_SOCKET_URL` | No | Defaults to `http://localhost:5000` in dev, same-origin in a production build |

---

## Known Limitations

- Prototype/pilot-scale system — not a payment/escrow platform, no legal-grade identity verification, no native mobile app (see `Docs/PRD_Global_Talent_Marketplace_and_Casting_Management_System.md` §6.2 for the full non-goals list).
- English-only UI; no Sinhala/Tamil localization yet.
- The compatibility-matching engine is a deterministic weighted-scoring algorithm (age/height/category/country/skills), not a machine-learning model — the UI is intentionally worded to describe it accurately.
- Free-tier hosting (Render) sleeps when idle — see the caveat above.

---

## Viva / Live Demo Notes

- Log in as `admin@demo.talent` / `organizer1@demo.talent` / `model1@demo.talent` (password `Password123`) to walk through each role.
- For the real-time chat/notification demo: open two browser windows, one as an industry professional managing applicants, one as the model they're about to accept — changing an application's status pushes a live toast to the model's window with no page refresh.
- For search/filter/pagination depth, use the bulk `seed:sl` dataset rather than the narrative set — it's what makes the Talent Scout directory and Admin analytics dashboard look like a real, populated platform instead of a handful of rows.
- See `Docs/viva_demo_script.md` for a full timed walkthrough and anticipated examiner Q&A.
