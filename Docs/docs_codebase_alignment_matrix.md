# Comprehensive Academic Alignment & Traceability Matrix

**Project Title:** Global Multidimensional Talent Marketplace and Casting Management System  
**Author / Candidate:** Sandun Prabath (A.M.S.P Athapaththu) — Reg No: 28607  
**Degree Program:** BSc (Hons) in Software Engineering, NSBM Green University  
**Supervisor:** Ms. Lakni Peiris  
**Document Version:** 2.0 (Active & Verified)  
**Evaluation Date:** September 2026  

---

## 1. Executive Research & Architecture Alignment

The **Global Multidimensional Talent Marketplace and Casting Management System** addresses the systemic trust gap, recruitment fragmentation, and manual administrative overhead in the global fashion, commercial, and pageant recruitment sectors.

Following the **Design Science Research Methodology (DSRM)**, the artifact was conceived, designed, developed, and evaluated through iterative sprint cycles. This document cross-references the **26 engineering and academic documents** in `Docs/`, the **dissertation reports** in `PDFs/`, and the **defense slide deck** against the live production codebase and test suites.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RESEARCH & SYSTEM TRAJECTORY                      │
├──────────────────┬──────────────────────┬──────────────────────────────┤
│ 1. Problem & DSRM│ 2. Formal Specs      │ 3. Verified Codebase         │
│  - Research Prop │  - PRD v2.0 & SRS    │  - React 19 Frontend         │
│  - Interim Ch1-3 │  - SADD & DDD v2.0   │  - Express 5 REST & Sockets  │
│  - Final Ch 1-4  │  - API & Security    │  - MongoDB & Cloudinary      │
│  - Slide Deck    │  - Sprint Backlog    │  - 67 Passing Jest Tests (12 Suites) │
└──────────────────┴──────────────────────┴──────────────────────────────┘
```

---

## 2. Cross-Document Traceability Matrix (26 Docs vs Codebase)

| Document | Primary Focus & Sections | Live Codebase Implementation File(s) | Status |
|---|---|---|---|
| **1. PRD v2.0** | Vision, Personas, DSRM Goals, KPIs | Multi-role platform architecture | ✅ Fully Implemented |
| **2. SRS v2.0** | Functional Requirements FR-1.x to FR-10.x | Controllers, Routes, Models & React Views | ✅ 100% Traceable |
| **3. System Architecture (SADD)** | 3-Tier Modular Monolith, ADRs, Cloudinary lock | `backend/server.js`, `docker-compose.yml` | ✅ Verified Architecture |
| **4. Database Design (DDD)** | ERD, Collections, Indexes, Polymorphism | `backend/models/*.js` (12 Mongoose Models) | ✅ Verified Schema |
| **5. API Specification** | REST Contracts, Response Envelopes, WebSockets | `backend/routes/*.js`, `backend/sockets/` | ✅ Verified Contracts |
| **6. UI/UX Design Document** | Haute Couture Obsidian/Gold, CompCards, Layouts | `frontend/src/index.css`, `components/` | ✅ Verified Design System |
| **7. Security & Data Policy** | Dual JWT tokens, Rate limits, Mongo sanitize | `backend/middleware/security.js`, `auth.js` | ✅ Hardened Controls |
| **8. Test Plan & QA Strategy** | 12 Test Suites, Unit/Integration/Security cases | `backend/__tests__/*.test.js` (67 tests pass) | ✅ 100% Tests Passing |
| **9. Coding Standards Guide** | Conventional Commits, Linting, Architecture | Oxlint & ESLint rules, Code structure | ✅ Clean Lints |
| **10. Deployment Guide** | Docker Compose, Nginx, Render, Atlas | `docker-compose.yml`, `frontend/nginx.conf` | ✅ Configured |
| **11. Risk Register** | 30 Project Risks across 6 categories & Mitigations | Rate limiters, Fallbacks, In-memory auth | ✅ Mitigated |
| **12. Sprint Backlog** | 68 User Stories across Sprints 1–4 | `backend/controllers/`, `frontend/src/pages/` | ✅ MVP Completed |
| **13. Gantt Timeline** | 4 Monthly Sprint Blocks | Sprints 1–4 development roadmap | ✅ On Schedule |
| **14. Admin Guide** | Member oversight, incident review, moderation | `frontend/src/pages/AdminDashboard.jsx` | ✅ Completed |
| **15. User Guide** | Model portfolio setup, casting submission | `PortfolioManager.jsx`, `CastingBoard.jsx` | ✅ Completed |
| **16. Project Proposal** | Problem statement, research question, scope | Final dissertation background | ✅ Aligned |
| **17. Interim Report (Ch 1–3)** | Literature review, theoretical frameworks | Methodology and conceptual design | ✅ Aligned |
| **18. Final Report (Ch 1–4)** | Full dissertation with implementation & results | Prototype execution & evaluation metrics | ✅ Aligned |
| **19. Sandun Presentation** | Viva presentation slide structure (20 slides) | Slide deck narrative & system demo points | ✅ Aligned |
| **20. Viva Defense Encyclopedia** | Screen-by-screen defense manual, examiner rebuttals | Full-stack walkthrough, all modules | ✅ Aligned |
| **21. Mac Quickstart & Presentation Guide** | macOS setup, AirPlay port handling, demo choreography | `start-mac.sh`, `MAC_SETUP.md` | ✅ Aligned |
| **22. REST & WebSocket Reference Manual** (`api_documentation.md`) | Companion API reference to the formal API Specification | `backend/routes/*.js`, `backend/sockets/` | ✅ Verified Contracts |
| **23. System Architecture Diagram** | Visual companion to the SADD | `backend/server.js` topology | ✅ Aligned |
| **24. UAT Report** | User-acceptance test results and sign-off | Manual QA pass summary | ✅ Aligned |
| **25. Viva Demo Script** | Timed live-demo walkthrough and Q&A prep | Full-stack walkthrough, all modules | ✅ Aligned |
| **26. This Alignment Matrix** | Document-to-codebase traceability (this document) | — | ✅ Self-referential |

---

## 3. Functional Requirements (SRS FR-1.x – FR-10.x) Codebase Audit

### 🔐 Module 1: Authentication & Identity (`SRS-FR-1.x`)
- **SRS-FR-1.1 to 1.3 (Role Registration & Passwords):** Implemented in [`authController.js`](talent-marketplace/backend/controllers/authController.js). Registration supports `model`, `industry_professional`, and `pageant_organizer` (admin self-assignment blocked). Passwords hashed with bcrypt (cost factor 10).
- **SRS-FR-1.4 to 1.6 (Session & Dual Token Architecture):** Short-lived 15m JWT access tokens held in-memory; 7-day single-use rotating refresh tokens stored as `httpOnly`, `sameSite: strict` cookies.
- **SRS-FR-1.7 (Password Reset via Email):** Implemented in `authController.forgotPassword` and `resetPassword`, storing SHA-256 digested tokens.
- **Automated Tests:** Covered by [`__tests__/auth.test.js`](talent-marketplace/backend/__tests__/auth.test.js) and [`__tests__/passwordReset.test.js`](talent-marketplace/backend/__tests__/passwordReset.test.js).

### 🛡️ Module 2: Role-Based Access Control (`SRS-FR-2.x`)
- **SRS-FR-2.1 to 2.5 (Server-side RBAC & Ownership):** Implemented in [`authMiddleware.js`](talent-marketplace/backend/middleware/authMiddleware.js) (`protect`, `authorize('admin')`, etc.). Frontend uses declarative `<RoleRoute roles={[...]}>` in `App.jsx`.
- **Ownership Verification:** Implemented on casting updates, portfolio deletion, and message thread access.
- **Automated Tests:** Covered across all test files with 401/403 assertions.

### 👤 Module 3: Profile Management (`SRS-FR-3.x`)
- **SRS-FR-3.1 to 3.5 (Polymorphic Profiles):** Partitioned into distinct 1:1 referenced collections:
  - [`ModelProfile.js`](talent-marketplace/backend/models/ModelProfile.js): Standardized measurements (bust, waist, hips, height, eye color), representation status (freelance vs agency).
  - [`IndustryProfile.js`](talent-marketplace/backend/models/IndustryProfile.js): Organization name, professional title, website.
  - [`PageantOrgProfile.js`](talent-marketplace/backend/models/PageantOrgProfile.js): Franchise titles, national accreditation.
- **Automated Tests:** Covered by [`__tests__/profile.test.js`](talent-marketplace/backend/__tests__/profile.test.js).

### 📸 Module 4: Multimedia Portfolio Management (`SRS-FR-4.x`)
- **SRS-FR-4.1 to 4.7 (Cloudinary Storage & Metadata):** Binary files are never stored in MongoDB. Handled via `multer-storage-cloudinary` into Cloudinary CDN. Metadata tracked in `PortfolioItem.js`.
- **Frontend Atelier:** Implemented in [`PortfolioManager.jsx`](talent-marketplace/frontend/src/pages/PortfolioManager.jsx) and [`PublicProfile.jsx`](talent-marketplace/frontend/src/pages/PublicProfile.jsx) with high-resolution full-screen `MediaLightbox.jsx`.

### 📢 Module 5: Casting Calls & Lifecycle (`SRS-FR-5.x`)
- **SRS-FR-5.1 to 5.7 (Casting Notices & Lazy Expiry):** Implemented in [`castingController.js`](talent-marketplace/backend/controllers/castingController.js). Casting calls include demographic/physical criteria, categories, deadlines, and status (`open`, `closed`, `expired`). Deadlines are lazily evaluated via `expireOverdueCastingCalls()`.
- **Automated Tests:** Covered by [`__tests__/casting.test.js`](talent-marketplace/backend/__tests__/casting.test.js).

### 📝 Module 6: Application Pipeline (`SRS-FR-6.x`)
- **SRS-FR-6.1 to 6.6 (Submissions & Review):** Implemented in [`applicationController.js`](talent-marketplace/backend/controllers/applicationController.js). Status pipeline: `submitted` ➔ `under_review` ➔ `shortlisted` ➔ `accepted` / `rejected`. Unique compound index prevents duplicate submissions (`castingCallId_1_modelProfileId_1`).
- **Automated Tests:** Covered by [`__tests__/application.test.js`](talent-marketplace/backend/__tests__/application.test.js).

### 🔍 Module 7: Country-Partitioned Search & Filtering (`SRS-FR-7.x`)
- **SRS-FR-7.1 to 7.6 (Multi-Attribute Scouting):** Implemented in [`searchController.js`](talent-marketplace/backend/controllers/searchController.js). Allows filtering by country, category, height range, and age with compound indexes.
- **Frontend Explorer:** Implemented in [`TalentSearch.jsx`](talent-marketplace/frontend/src/pages/TalentSearch.jsx) with Studio Grid and Runway Carousel view modes.

### 🎯 Module 8: Algorithmic Suitability & Matching (`SRS-FR-8.x`)
- **SRS-FR-8.1 to 8.6 (Explainable 100-Pt Scoring):** Implemented in [`backend/utils/matchScore.js`](talent-marketplace/backend/utils/matchScore.js):
  - Age: 25 pts
  - Height: 20 pts
  - Category: 20 pts
  - Country: 15 pts
  - Skills: 20 pts
- **Safety Bounds:** [`matchController.js`](talent-marketplace/backend/controllers/matchController.js) caps candidate evaluation at `MAX_CANDIDATES = 500` and `MAX_RESULTS = 50` to safeguard node event loops.
- **Automated Tests:** Covered by [`__tests__/matching.test.js`](talent-marketplace/backend/__tests__/matching.test.js) and [`__tests__/matching.enhanced.test.js`](talent-marketplace/backend/__tests__/matching.enhanced.test.js).

### 💬 Module 9: Real-Time Messaging (`SRS-FR-9.x`)
- **SRS-FR-9.1 to 9.5 (Match Chat via WebSockets):** Implemented in [`sockets/chatSocket.js`](talent-marketplace/backend/sockets/chatSocket.js) using Socket.io. Chat rooms are strictly restricted to accepted applicant/creator pairs (`isAuthorizedForApplication` verified on both `join_match` and `send_message`).
- **Automated Tests:** Covered by [`__tests__/chat.test.js`](talent-marketplace/backend/__tests__/chat.test.js) and [`__tests__/notifications.test.js`](talent-marketplace/backend/__tests__/notifications.test.js).

### ⚖️ Module 10: Administration, Verification & Moderation (`SRS-FR-10.x`)
- **SRS-FR-10.1 to 10.6 (Command Center & Incident Handling):** Implemented in [`adminController.js`](talent-marketplace/backend/controllers/adminController.js) and styled in [`AdminDashboard.jsx`](talent-marketplace/frontend/src/pages/AdminDashboard.jsx). Superadmins can suspend users, unlist casting calls, review community reports, and view global audit stats.
- **Automated Tests:** Covered by [`__tests__/adminModeration.test.js`](talent-marketplace/backend/__tests__/adminModeration.test.js) and [`__tests__/analytics.test.js`](talent-marketplace/backend/__tests__/analytics.test.js).

---

## 4. Test Suite Alignment & Verification Summary

| Test Suite | Associated Module | Tests Passed | Execution Engine |
|---|---|---|---|
| `adminModeration.test.js` | Module 10: Admin Controls & Auditing | 12 / 12 | In-Memory MongoDB (`mongodb-memory-server`) |
| `analytics.test.js` | Module 10: Platform Telemetry & Funnel | 4 / 4 | In-Memory MongoDB |
| `application.test.js` | Module 6: Application Pipeline | 5 / 5 | In-Memory MongoDB |
| `auth.test.js` | Module 1: JWT & RBAC Controls | 4 / 4 | In-Memory MongoDB |
| `casting.test.js` | Module 5: Casting Calls & Lazy Expiry | 6 / 6 | In-Memory MongoDB |
| `chat.test.js` | Module 9: Real-Time Sockets & Match Chat | 5 / 5 | In-Memory MongoDB |
| `matching.enhanced.test.js` | Module 8: Enhanced Explainable Matching | 4 / 4 | In-Memory MongoDB |
| `matching.test.js` | Module 8: Algorithmic Scoring & Rubric | 5 / 5 | In-Memory MongoDB |
| `notifications.test.js` | Module 9: Notification Dispatch Service | 5 / 5 | In-Memory MongoDB |
| `passwordReset.test.js` | Module 1: Crypto SHA-256 Token Recovery | 4 / 4 | In-Memory MongoDB |
| `profile.test.js` | Module 3: Polymorphic Profile System | 6 / 6 | In-Memory MongoDB |
| `search.test.js` | Module 7: Country & Measurement Search | 7 / 7 | In-Memory MongoDB |
| **TOTAL** | **Full System Coverage (12 Suites)** | **67 / 67 (100%)** | **Zero Failures** |

---

## 5. Viva Defense Q&A Cheatsheet for Sandun Prabath

### Q1: Why choose a 3-tier modular monolith over microservices?
> **Answer:** "Given the scope and research timeline under DSRM, a modular monolith minimizes network latency, deployment overhead, and inter-service authentication complexity. By maintaining clear domain separation across controllers, schemas, and routes, domain services (e.g., the Matching Engine or Notification Service) can easily be extracted into independent microservices in Phase 2 without rewriting core business logic."

### Q2: How does your matching algorithm guarantee fairness and explainability?
> **Answer:** "Unlike black-box neural networks, our suitability scoring uses an explainable, deterministic 100-point attribute weighting model (Age: 25, Height: 20, Category: 20, Country: 15, Skills: 20). Every computed match generates an itemized JSON breakdown (`breakdown.age`, `breakdown.height`, etc.), ensuring recruiters and models can inspect exactly why an application scored as it did."

### Q3: How do you safeguard user sessions against Cross-Site Scripting (XSS) and CSRF?
> **Answer:** "We implemented a dual-token strategy: the short-lived 15-minute JWT access token is stored exclusively in client memory (never in `localStorage` or `sessionStorage`), preventing XSS token exfiltration. The 7-day refresh token is protected in an `httpOnly`, `sameSite: strict`, `secure` cookie that cannot be read by JavaScript, with cryptographic SHA-256 single-use token rotation in MongoDB."

### Q4: Why is Cloudinary utilized instead of storing images in MongoDB?
> **Answer:** "Storing multimedia binaries in MongoDB causes document bloat, degrades B-tree index performance, and exceeds MongoDB's 16MB BSON document cap. Cloudinary provides isolated cloud object storage, on-the-fly responsive transformations, WebP compression, and CDN edge caching, ensuring fast comp-card load times across global geographies."
