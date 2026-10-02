# Coding Standards & Git Workflow Guide
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Engineering Process — Coding Standards & Git Workflow Guide |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Companion Documents** | PRD v2.0, SRS v2.0, System Architecture Design Document v2.0, Database Design Document v2.0, API Specification v2.0, Test Plan & QA Strategy v2.0 |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial coding standards and Git workflow, aligned to the modular-monolith architecture and MERN-adjacent stack defined in the Architecture doc | Engineering Team |
| 2.0 | 2026-09-08 | Added Cloudinary SDK integration pattern (upload helper module structure); added Socket.io server initialization pattern (separation from Express app); added `CLOUDINARY_*` and `SENDGRID_API_KEY` to the env-variable validation checklist; updated companion document references to v2.0 | Engineering Team |

---

## Table of Contents

1. Introduction & Purpose
2. General Engineering Principles
3. Repository Structure
4. Naming Conventions
5. Backend Coding Standards (Node.js / Express)
6. Frontend Coding Standards (React)
7. Database & Schema Conventions (MongoDB / Mongoose)
8. API Design Conventions
9. Error Handling Standards
10. Security Coding Practices
11. Comments & Documentation Standards
12. Formatting, Linting & Static Analysis
13. Testing Conventions
14. Git Branching Strategy
15. Commit Message Convention
16. Pull Request & Code Review Process
17. Versioning & Release Tagging
18. Environment & Secrets Management
19. CI/CD Integration
20. Quick Reference Cheat Sheet

---

## 1. Introduction & Purpose

### 1.1 Purpose
This document defines the coding conventions, project structure, and Git workflow to be followed throughout development of the Global Multidimensional Talent Marketplace and Casting Management System. Even in a solo-developer academic project, a documented standard matters for three concrete reasons: (1) it keeps a multi-month, multi-module codebase consistent enough to navigate without re-learning conventions per file, (2) it produces the kind of engineering artifact examiners expect alongside a thesis prototype, and (3) it is the baseline any future contributor — or the developer's future self — needs to safely extend the system post-submission.

### 1.2 Scope
Applies to all code in both the frontend (React SPA) and backend (Node.js/Express API) repositories/directories, as well as all Git history, branch naming, commit messages, and pull request practice for the duration of the project (Nov 2025 – Oct 2026 per PRD §14).

### 1.3 Relationship to Other Documents
This guide implements the modular boundaries defined in the System Architecture Design Document (§3.2, the eight functional modules) and the naming already fixed in the Database Design Document (schema field names) and API Specification (endpoint/route naming, response envelope). It does not redefine any business rule — it defines *how the code that implements those rules is organized, named, formatted, and merged.*

---

## 2. General Engineering Principles

1. **Consistency over personal preference.** Where this document specifies a convention, follow it even if a different style is equally valid — a single consistent codebase is easier to review, test, and extend than one with locally "correct" but globally inconsistent choices.
2. **Server is the source of truth.** Every validation, authorization, and business rule enforced in the frontend for UX responsiveness must also be enforced server-side (per NFR-SEC-7 and SRS-FR-2.1) — client-side code is never trusted as the sole gate for anything, and this document's error-handling and security sections assume that discipline throughout.
3. **Small, reviewable units of work.** Prefer many small commits and small pull requests over large, multi-feature ones — this makes the Git history itself a useful piece of project documentation (see §15) and keeps the diff-based review process in §16 meaningful.
4. **Explicit over clever.** Favor readable, slightly more verbose code over dense one-liners, especially in business-logic-heavy areas like the matching algorithm (PRD §12.2) and RBAC middleware, where correctness matters more than terseness and where the SRS explicitly requires explainability (SRS-FR-8.3).
5. **Fail loudly in development, gracefully in production.** Development/staging environments should surface errors with full detail to speed debugging; production responses always follow the sanitized error envelope defined in §9 and the API Specification (§2.3–2.4), per NFR-REL-1/2.
6. **Every module is independently testable.** Code should be structured (dependency injection where reasonable, no hidden global state) so that the Test Plan's unit/integration suites (Test Plan §4) can exercise a module without spinning up the entire application.

---

## 3. Repository Structure

### 3.1 Overall Layout
Two repositories (or two top-level directories in a monorepo — either is acceptable; this project uses a **monorepo** for simplicity given the academic timeline):

```
talent-marketplace/
├── backend/
├── frontend/
├── docs/                     ← PRD, SRS, Architecture doc, this guide, etc.
├── .github/
│   └── workflows/            ← CI pipeline definitions
├── .gitignore
├── README.md
└── docker-compose.yml        ← optional, for local MongoDB if not using Atlas dev cluster
```

### 3.2 Backend Structure (mirrors the module decomposition in Architecture doc §3.2)

```
backend/
├── src/
│   ├── config/                 ← env loading, DB connection, cloud storage client setup
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.test.js
│   │   ├── users/
│   │   ├── profiles/
│   │   ├── portfolio/
│   │   ├── castings/
│   │   ├── applications/
│   │   ├── search/
│   │   ├── matching/
│   │   ├── messaging/
│   │   └── admin/
│   ├── middleware/
│   │   ├── authenticate.js      ← JWT verification
│   │   ├── authorize.js         ← RBAC role-check middleware
│   │   ├── validateRequest.js   ← schema validation wrapper
│   │   ├── errorHandler.js      ← centralized error-handling middleware
│   │   └── rateLimiter.js
│   ├── models/                  ← Mongoose schemas (one file per entity, per Database Design Document)
│   ├── utils/                   ← shared helpers (pagination, scoring functions, file validation)
│   ├── app.js                   ← Express app assembly (middleware registration, route mounting)
│   └── server.js                ← entry point (starts HTTP server)
├── tests/
│   ├── integration/
│   └── fixtures/                ← seed data per Test Plan §5.3
├── .env.example
├── package.json
└── jest.config.js
```

Each module folder is **self-contained**: its controller, route, service (business logic), and validation schema live together, and its own test file sits alongside it. This directly supports the Architecture doc's modularity goal (§2.1) and lets a single module be handed off, refactored, or extracted into a separate service later without touching unrelated code.

### 3.3 Frontend Structure

```
frontend/
├── src/
│   ├── api/                     ← one file per backend module, wrapping fetch/axios calls (auth.api.js, castings.api.js, ...)
│   ├── components/
│   │   ├── common/               ← Button, Badge, MediaCard, Modal, Toast, etc. (design system components, per UI/UX Design Document §6.5)
│   │   └── layout/                ← AppShell, Sidebar, TopBar
│   ├── pages/
│   │   ├── auth/                  ← Login, Register, ForgotPassword
│   │   ├── onboarding/
│   │   ├── model/                 ← Dashboard, Profile, Portfolio, BrowseCastings, MyApplications
│   │   ├── recruiter/             ← Dashboard, MyCastingCalls, CastingCallDetail, TalentSearch
│   │   ├── admin/                 ← Overview, Verifications, Reports, Users, Logs
│   │   └── messaging/
│   ├── context/                   ← AuthContext, CountryContext (global country selector state)
│   ├── hooks/                     ← useAuth, usePagination, useDebouncedFilter
│   ├── styles/                    ← Tailwind config, design tokens from UI/UX Design Document §6.1–6.3
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── tests/
├── .env.example
└── package.json
```

Pages are grouped **by role**, mirroring the Information Architecture in the UI/UX Design Document §4, so the folder structure itself communicates who a screen is for.

---

## 4. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Backend files/folders | `kebab-case`, module-scoped suffix | `auth.controller.js`, `casting-calls.service.js` |
| React component files | `PascalCase.jsx` | `ApplicantRow.jsx`, `CastingCallCard.jsx` |
| React hooks | `camelCase`, prefixed `use` | `useAuth.js`, `useCountryFilter.js` |
| Variables & functions (JS) | `camelCase` | `computeSuitabilityScore()`, `verificationStatus` |
| Classes/constructors | `PascalCase` | `class MatchingEngine { ... }` |
| Constants (true immutable config) | `SCREAMING_SNAKE_CASE` | `MAX_IMAGE_SIZE_MB`, `JWT_EXPIRY_SECONDS` |
| Mongoose model names | `PascalCase`, singular | `User`, `ModelProfile`, `CastingCall` (matches Database Design Document entity names exactly) |
| MongoDB field names | `camelCase` | `verificationStatus`, `representationStatus` (matches Database Design Document field names exactly — no translation layer between DB field and API field) |
| REST endpoint paths | `kebab-case`, plural nouns | `/casting-calls` if renamed from the current `/castings`; current spec uses `/castings`, `/applications`, `/portfolio` per API Specification — **new endpoints must follow the same plural-noun pattern already established** |
| React Router routes | mirrors page hierarchy | `/dashboard`, `/castings/:id/applicants` |
| Git branches | `type/short-description` | `feature/talent-search-filters`, `fix/duplicate-application-bug` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `MONGODB_URI`, `JWT_SECRET`, `CLOUD_STORAGE_BUCKET` |
| Test files | co-located, `*.test.js` suffix | `auth.controller.test.js` |
| CSS/Tailwind custom tokens | `kebab-case`, matches UI/UX Design Document tokens | `color-accent-600`, `text-display-md` |

**Rule of thumb:** database field names, API payload keys, and frontend variable names referring to the same concept should use the **identical camelCase name** end-to-end (e.g., `verificationStatus` appears unchanged in the Mongoose schema, the API response JSON, and the React component prop) — this eliminates an entire class of "which name means what" bugs and mapping code.

---

## 5. Backend Coding Standards (Node.js / Express)

### 5.1 Module Internal Structure
Each module (per §3.2) follows a strict responsibility split:
- **`*.routes.js`** — declares Express routes only; wires middleware (auth, validation) to controller functions. Contains no business logic.
- **`*.controller.js`** — parses the request, calls the service layer, shapes the HTTP response using the standard envelope (API Specification §2.3). Contains no direct database queries.
- **`*.service.js`** — contains the actual business logic and database calls (via Mongoose models). This is the layer unit tests target most heavily, since it has no HTTP concerns mixed in.
- **`*.validation.js`** — request schema validation (e.g., using Joi or Zod), applied via the shared `validateRequest` middleware before the controller runs.

This split exists specifically so business logic (e.g., the matching algorithm, application state-transition rules) can be unit-tested without spinning up an HTTP server, satisfying Test Plan §4's "Unit Testing" level.

### 5.2 Example Skeleton (Casting module)
```javascript
// castings.routes.js
router.post('/', authenticate, authorize(['industry_professional', 'pageant_organizer']),
  validateRequest(createCastingSchema), castingsController.create);

// castings.controller.js
async function create(req, res, next) {
  try {
    const casting = await castingsService.createCasting(req.user.id, req.body);
    return res.status(201).json({ success: true, data: { casting } });
  } catch (err) {
    next(err); // delegated to centralized errorHandler middleware
  }
}

// castings.service.js
async function createCasting(creatorId, payload) {
  if (payload.criteria.minAge > payload.criteria.maxAge) {
    throw new AppError('INVALID_STATE_TRANSITION', 422, 'minAge cannot exceed maxAge');
  }
  return CastingCall.create({ ...payload, creatorId, status: 'open' });
}
```

### 5.3 Async/Error Handling
- All async route handlers wrap logic in `try/catch` and call `next(err)` — never leave a rejected promise unhandled. A shared `asyncHandler` wrapper utility is acceptable and encouraged to reduce repetitive `try/catch` boilerplate, as long as it still funnels errors into the centralized `errorHandler` middleware (§9).
- No business logic inside `.then()` chains — use `async/await` exclusively for readability and consistent stack traces.

### 5.4 Controller Rules
- A controller function never queries the database directly — it only calls a service function.
- A controller function is the only place that knows about HTTP status codes and the response envelope shape.

### 5.5 Environment-Dependent Code
No `console.log` left in committed code for debugging; use the shared logger utility (e.g., a thin wrapper around `pino` or `winston`) so log verbosity is environment-controlled and production logs stay free of debug noise (supports NFR-REL-2).

---

## 6. Frontend Coding Standards (React)

### 6.1 Component Conventions
- **Function components with hooks only** — no class components (consistent with the React version and hooks-based patterns already assumed in the Architecture doc's stack).
- One component per file; the file name matches the component's export name exactly (`ApplicantRow.jsx` exports `ApplicantRow`).
- Presentational (design-system) components in `components/common/` accept props only and contain no API calls — they render what they're given. Page components in `pages/` own data-fetching (via hooks) and pass data down.
- Shared design-system components (Button, Badge, MediaCard, StatusPill, etc., per UI/UX Design Document §6.5) are built once and reused everywhere that pattern appears — a new one-off "verified badge" implementation inside a single page is a code-review rejection reason, not a style choice.

### 6.2 State Management
- Local component state via `useState`/`useReducer` for UI-only state (form inputs, modal open/closed).
- Cross-cutting state (authenticated user, JWT, selected country per UI/UX Design Document §5.2) lives in React Context (`AuthContext`, `CountryContext`) — no additional state-management library (Redux, Zustand) is introduced unless a specific, documented need arises; the Architecture doc's "pragmatic over premature complexity" principle (§2.1) applies to the frontend too.
- Server data (casting lists, applicant tables, search results) is fetched via a small custom hook per resource (e.g., `useCastingCalls(filters)`) that wraps the corresponding `api/*.api.js` function, so loading/error/data states are handled once and reused, not re-implemented per page.

### 6.3 API Call Layer
All HTTP calls go through the `api/` directory's per-module files, never directly via `fetch`/`axios` inside a component. Each `api/*.api.js` file:
- Reads the base URL from environment config, never hardcoded.
- Attaches the `Authorization: Bearer <token>` header automatically via a shared request wrapper.
- Returns the parsed `data` payload (unwrapping the `{ success, data }` envelope from API Specification §2.3) or throws a typed error the calling hook can catch.

### 6.4 Styling
- Tailwind utility classes are the default; the custom theme extends Tailwind's config with the exact design tokens defined in the UI/UX Design Document §6.1–6.3 (colors, spacing, radii, type scale) rather than using Tailwind's default palette — visual consistency with that document is a code-review criterion.
- No inline `style={{ }}` objects except for values that are genuinely dynamic/computed at runtime (e.g., a progress-bar width percentage) — static styling always goes through Tailwind classes.

### 6.5 Accessibility in Code
Per UI/UX Design Document §11: every interactive element must be a semantically correct element (`<button>` not `<div onClick>`), every image/video upload requires an alt-text/label field before submission is enabled, and focus-visible styles are never suppressed via `outline: none` without a replacement focus style.

---

## 7. Database & Schema Conventions (MongoDB / Mongoose)

- One Mongoose model file per entity, matching the Database Design Document's entity names and field names exactly (§4 of this document's naming table).
- Every schema declares explicit validation (`required`, `enum`, `min`/`max`, `match` for regex) at the schema level — this is a second line of defense behind the `*.validation.js` request-schema layer (§5.1), consistent with SRS §6.3's "mandatory fields enforced via schema-level validation in addition to frontend validation."
- Timestamps (`createdAt`, `updatedAt`) are enabled via Mongoose's built-in `{ timestamps: true }` schema option on every model, rather than manually managed fields.
- Indexes required for search/filter performance (country, category, age, height, per NFR-SCAL-2) are declared directly in the schema file via `schema.index(...)`, not created ad-hoc in the database console, so the index strategy is version-controlled and reproducible in any environment.
- No business logic inside Mongoose schema methods beyond simple derived-field helpers (e.g., a virtual `age` computed from `dateOfBirth`) — anything more complex belongs in the service layer (§5.1).

---

## 8. API Design Conventions

This section restates, for code-writing purposes, conventions already fixed in the API Specification (companion document) — every new endpoint added during development must follow these without exception:

- All routes are prefixed `/api/v1` (API Specification §2.1).
- Every response uses the standard success/error envelope (API Specification §2.3) — no endpoint returns a bare array or bare object outside that envelope.
- Every error uses one of the defined `errorCode` values (API Specification §2.6); a new error condition requires adding a new documented code to that table, not inventing an undocumented string inline.
- List endpoints implement pagination via `page`/`limit` query params and the `meta` object (API Specification §2.5) from the first version of that endpoint — pagination is not retrofitted later.
- Role restrictions on a route are declared explicitly via the `authorize([...])` middleware at the route-declaration line, so the permitted roles for any endpoint are visible by reading the routes file alone, without needing to trace into the controller.

---

## 9. Error Handling Standards

### 9.1 Centralized Error Middleware
All errors funnel through a single Express error-handling middleware (`middleware/errorHandler.js`), registered last in `app.js`. It:
1. Logs the full error (stack trace, request context) server-side via the shared logger, regardless of environment.
2. Returns the sanitized client-facing envelope (`{ success: false, errorCode, message, details }`) with no stack trace or internal file paths, in every environment (development included, so bugs in error handling itself are caught early rather than only in production).
3. Maps a small set of known error types (`AppError` subclasses for `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`, etc.) to their correct HTTP status; anything unrecognized defaults to `500 INTERNAL_ERROR`.

### 9.2 Custom Error Class
```javascript
class AppError extends Error {
  constructor(errorCode, statusCode, message, details = []) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.details = details;
  }
}
```
Services throw `AppError` for expected business-rule violations (duplicate application, invalid state transition, forbidden action); only truly unexpected exceptions reach the generic `500` path.

### 9.3 Frontend Error Handling
Every data-fetching hook (§6.2) exposes an `error` state consumed by the calling page to render the error patterns defined in the UI/UX Design Document §13.1 (inline validation, toast, full-page forbidden state) — a component never lets a rejected promise surface as an unhandled console error to the end user.

---

## 10. Security Coding Practices

Directly implements SRS §5.2 (NFR-SEC-1 to NFR-SEC-7):

1. **Passwords:** hashed with `bcrypt` (work factor ≥ 10) in the `auth.service.js` layer only; the plaintext password is never logged, never included in any object passed to the logger, and never returned in any API response.
2. **JWT handling:** signing secret loaded from environment variables only (never hardcoded, never committed); token payload contains only `id`, `role`, `verificationStatus` — no sensitive PII in the token itself, since JWTs are not encrypted, only signed.
3. **Input validation:** every request body is validated against an explicit schema (`*.validation.js`) before it reaches a controller — this is the primary defense against injection, applied consistently rather than per-field ad-hoc checks.
4. **NoSQL injection prevention:** request validation schemas reject unexpected object-shaped values in fields that should be primitives (e.g., rejecting `{"$gt": ""}` submitted where a string email is expected) — do not rely on Mongoose alone to prevent this class of attack.
5. **XSS prevention:** all user-generated free text (bios, casting descriptions, messages) is treated as data, never rendered via `dangerouslySetInnerHTML` on the frontend; if any rich-text rendering is ever introduced, it must go through a sanitization library, not raw HTML injection.
6. **File upload safety:** uploaded file type is validated server-side by inspecting actual file content/magic bytes (not trusting the client-supplied MIME type or file extension), size limits are enforced server-side even though the frontend also checks for UX responsiveness, and generated storage filenames/keys are server-generated (never the raw client-supplied filename) to prevent path-traversal or overwrite attacks.
7. **Secrets never committed:** `.env` files are git-ignored; only `.env.example` (with placeholder values, no real secrets) is committed.
8. **Dependency hygiene:** `npm audit` is run before each merge to `main`; any high/critical vulnerability must be resolved or explicitly documented as an accepted risk before the affected code ships.

---

## 11. Comments & Documentation Standards

- **JSDoc-style comments** on every exported function in the service and utility layers, describing purpose, parameters, return value, and thrown errors — this is where the matching algorithm's scoring logic (PRD §12.2) must be documented in enough detail that a reviewer can verify correctness without re-deriving it from the code alone.
- Inline comments explain **why**, not **what** — the code itself should make the "what" obvious through naming; a comment exists to record a non-obvious reason (e.g., *"we intentionally include zero-overlap candidates in results per SRS-FR-8.1 rather than excluding them"*).
- Every module folder (§3.2) includes a short `README.md` describing its responsibility, its public service functions, and which SRS-FR IDs it implements — a lightweight, always-current map from code to requirements that supplements the formal traceability matrix in the Test Plan (§16 of that document).
- No commented-out dead code committed to `main` — Git history is the record of what used to exist, not commented blocks in the source.

---

## 12. Formatting, Linting & Static Analysis

| Tool | Purpose | Configuration Approach |
|---|---|---|
| **ESLint** | Enforces code-quality rules (no unused vars, no implicit globals, consistent import order) | `airbnb-base` (backend) / `airbnb` with React plugin (frontend) as the starting ruleset, with project-specific overrides documented in `.eslintrc.js` |
| **Prettier** | Enforces formatting (indentation, quote style, line length) so formatting is never a code-review discussion point | 2-space indentation, single quotes, semicolons required, 100-character print width; run via `prettier --write` on save and enforced in CI |
| **Husky + lint-staged** | Pre-commit hook running ESLint/Prettier on staged files only | Prevents a badly formatted or lint-failing commit from ever entering history |

A commit that fails linting is rejected locally (via the pre-commit hook) before it ever reaches a pull request — formatting/lint issues should never appear in code review comments.

---

## 13. Testing Conventions

Directly supports the Test Plan & QA Strategy (companion document, §4 and §9):

- Test files are **co-located** with the code they test (`auth.service.js` / `auth.service.test.js`) for backend service/unit tests; integration tests spanning multiple modules live in `backend/tests/integration/`.
- Test IDs referenced in the Test Plan (e.g., `TC-AUTH-05`) should appear as a comment or `describe`/`it` block name in the corresponding automated test where one exists, so a reviewer can trace from the Test Plan document directly to the executable test.
- Every new P0/P1 functional requirement implemented must ship with at least one corresponding automated test in the same pull request — a feature PR without tests is not merge-eligible per §16.
- Frontend components with non-trivial logic (conditional rendering by role, form validation) get a React Testing Library test; purely presentational components (a static `Badge` wrapper) do not require dedicated tests.

---

## 14. Git Branching Strategy

### 14.1 Model: Trunk-Based with Short-Lived Feature Branches
Given the project's solo/small-team academic scale, a full Git Flow (with `develop`, `release/*`, `hotfix/*` branches) is unnecessary overhead. Instead:

- **`main`** — always deployable; every commit on `main` has passed CI (lint, unit, integration tests) and represents a working state of the staging environment.
- **Feature branches** — created from `main` for every unit of work (a feature, a fix, a chore), merged back via pull request, then deleted.
- No long-lived `develop` branch; `main` itself plays that role at this project's scale, with the *deployed pilot* being tagged separately (see §17) rather than gated behind a separate branch.

### 14.2 Branch Naming Convention
`type/short-kebab-case-description`, where `type` is one of:

| Type | Use For |
|---|---|
| `feature/` | New functionality (e.g., `feature/talent-search-filters`) |
| `fix/` | Bug fixes (e.g., `fix/duplicate-application-race-condition`) |
| `chore/` | Tooling, config, dependency updates, non-functional cleanup |
| `docs/` | Documentation-only changes (including updates to the docs in `/docs`) |
| `test/` | Test-only additions/fixes not tied to a feature branch |
| `refactor/` | Internal restructuring with no behavior change |

Examples: `feature/portfolio-drag-reorder`, `fix/rbac-admin-endpoint-leak`, `chore/upgrade-mongoose-v8`.

### 14.3 Branch Lifecycle Rules
- A feature branch should live for **days, not weeks** — if a feature is large enough to risk a long-lived branch, it should be broken into smaller incremental PRs behind a simple feature flag or an intentionally incomplete-but-non-breaking state, rather than accumulating a large divergent branch.
- Rebase (not merge) `main` into a feature branch to keep it up to date, to preserve a clean, linear-ish history; the final merge of the feature branch into `main` uses a **squash merge** (§14.4) so `main`'s history stays one logical commit per feature/fix.

### 14.4 Merge Strategy
**Squash-and-merge** into `main` for all feature/fix branches — the many small in-progress commits on a feature branch (which may include "wip", "fix typo", "address review comment") are squashed into one clean commit on `main`, whose message follows the Conventional Commit format (§15). This keeps `main`'s history readable as a changelog while still allowing free-form incremental committing during development.

---

## 15. Commit Message Convention

This project follows **Conventional Commits**:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer: SRS-FR reference, breaking change note, issue link]
```

| Type | Meaning |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting only, no code meaning change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Build process, tooling, dependency changes |
| `perf` | Performance improvement |

`<scope>` is the module name (`auth`, `castings`, `matching`, `portfolio`, `admin`, `ui`, etc.).

**Examples:**
```
feat(castings): add country and category filters to casting call browse endpoint

Implements SRS-FR-5.3. Adds indexed query support for country/category
combination and paginates results per API Specification §2.5.

Refs: SRS-FR-5.3
```
```
fix(auth): prevent account lockout counter reset on successful login within lockout window

Fixes a bug where a correct password submitted during an active
lockout window incorrectly reset the failed-attempt counter without
actually authenticating the user.

Refs: SRS-FR-1.10, TC-AUTH-09
```
```
test(matching): add boundary test for zero-attribute-overlap candidate

Refs: TC-MATCH-07
```

Referencing the relevant SRS-FR ID and/or Test Plan `TC-` ID in the commit footer is **required** for any commit implementing or fixing a specific requirement — this makes the Git log itself a secondary, always-up-to-date traceability artifact alongside the formal matrix in the Test Plan document.

---

## 16. Pull Request & Code Review Process

### 16.1 PR Requirements Checklist
Every pull request into `main` must satisfy, before merge:

- [ ] CI passes (lint, unit tests, integration tests, build).
- [ ] At least one new or updated automated test corresponding to the change (per §13).
- [ ] PR description states which SRS-FR ID(s) or defect ID this addresses.
- [ ] No `console.log` debug statements left in the diff.
- [ ] No secrets, API keys, or `.env` values included in the diff.
- [ ] New/changed endpoints match the API Specification exactly (route, verb, response envelope) — or the API Specification has been updated in the same PR if the contract intentionally changed.
- [ ] New UI matches the UI/UX Design Document's component and token usage (§6 of that document) — no ad-hoc colors/spacing outside the defined design tokens.
- [ ] Self-reviewed diff (author has read their own full diff before requesting review) — catches an obvious class of avoidable review comments.

### 16.2 Review Focus Areas
A reviewer (in a solo-developer context, this can be a structured self-review pass using this same checklist, ideally after stepping away from the code for at least a few hours) should specifically check:
1. **Security:** Does this change touch auth, RBAC, file upload, or any user input path? If so, walk through §10's checklist explicitly.
2. **Requirement fidelity:** Does the behavior match the cited SRS-FR wording exactly, including edge cases mentioned in that requirement?
3. **Consistency:** Does naming, error handling, and structure match §4–§9 of this document, or does it introduce a one-off pattern?
4. **Test adequacy:** Do the included tests actually exercise the new behavior's edge cases (per the relevant Test Plan `TC-` cases), or only the happy path?

### 16.3 Resolving Review Comments
Address every comment either by making the change or by replying with an explicit rationale for not changing it — comments are never silently dismissed. Once addressed, the PR is re-run through CI before merge.

---

## 17. Versioning & Release Tagging

- The project uses **Semantic Versioning** (`MAJOR.MINOR.PATCH`) for tagged milestones aligned to the PRD §14 roadmap phases (e.g., `v0.1.0` at end of Phase 2 core-module completion, `v0.2.0` at end of Phase 3 testing sign-off, `v1.0.0` at pilot deployment in Phase 4).
- Git tags are created on `main` at each milestone (`git tag -a v0.1.0 -m "Core modules complete: auth, profiles, portfolio, castings"`), giving the thesis documentation a concrete, citable snapshot of the codebase at each project phase.
- The API's own versioning (`/api/v1`, per API Specification §2.1) is independent of the Git/release tagging scheme — a breaking API change would warrant a new API path version (`/api/v2`) regardless of where the project sits in its Git tag sequence.

---

## 18. Environment & Secrets Management

- Three environment configurations: `development` (local), `staging` (matches Test Plan §5.1's staging environment), `production` (pilot deployment).
- Environment variables are the only source of configuration that varies by environment (`MONGODB_URI`, `JWT_SECRET`, `CLOUD_STORAGE_BUCKET`, `CLOUD_STORAGE_KEY`, `FRONTEND_URL` for CORS, `NODE_ENV`) — never hardcoded, never branched on via `if (isStaging)` string checks scattered through the code; instead, a single `config/index.js` module reads and validates all required environment variables at startup and fails fast with a clear error if one is missing.
- `.env.example` is committed and kept in sync with every environment variable the application actually reads, so any new contributor (or the developer returning after a break) can reconstruct a working local environment from that file alone.
- Vercel/Render environment variable dashboards are the source of truth for staging/production secrets (per System Architecture Design Document §2.2's deployment stack) — never a secrets file copied manually between machines.

---

## 19. CI/CD Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every pull request and on every push to `main`:

1. **Install** — `npm ci` for both `backend/` and `frontend/`.
2. **Lint** — ESLint + Prettier check (fails the build on any violation, per §12).
3. **Unit & Integration Tests** — `npm test` for backend (Jest/Supertest) and frontend (Jest/React Testing Library), per Test Plan §4.
4. **Build** — `npm run build` for the frontend, confirming no build-time errors.
5. **(main branch only) Deploy** — triggers Vercel (frontend) and Render (backend) deployments to staging automatically on merge to `main`; production/pilot deployment remains a manual promotion step, not automatic, to keep a deliberate human checkpoint before the pilot-facing environment changes.
6. **(scheduled, nightly) Full Regression** — a nightly workflow run executes the full Test Plan §12 regression suite (including any Cypress/Playwright E2E tests, which are slower and not required on every PR) against staging.

A pull request cannot be merged while steps 1–4 are failing — this is enforced via GitHub's branch protection rules on `main`.

---

## 20. Quick Reference Cheat Sheet

| Task | Convention |
|---|---|
| Starting new work | `git checkout main && git pull && git checkout -b feature/my-feature` |
| Committing | `git commit -m "feat(module): summary" ` + body referencing SRS-FR/TC ID |
| Before opening a PR | Run `npm run lint && npm test` locally; rebase onto latest `main` |
| Merging | Squash-and-merge only; delete branch after merge |
| New backend module | Create `module-name/` under `src/modules/` with `.routes.js`, `.controller.js`, `.service.js`, `.validation.js`, `.test.js`, and a short `README.md` |
| New React component | `PascalCase.jsx`, in `components/common/` if reusable, `pages/<role>/` if page-specific |
| New API error condition | Add the `errorCode` to API Specification §2.6 *and* use it via `AppError` — never an ad-hoc string |
| New environment variable | Add to `.env.example` and to `config/index.js`'s required-variable validation |
| Release milestone | Tag `main` with the next SemVer version matching the PRD §14 phase completed |

---

*End of Coding Standards & Git Workflow Guide.*
