# Sprint Backlog
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Sprint Backlog (Agile Work Breakdown) |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Build Phase |
| **Companion Documents** | SRS v2.0 (FR-1.x–FR-10.x), PRD v2.0, API Specification v2.0, Database Design Document v2.0, System Architecture Design Document v2.0, Coding Standards & Git Workflow Guide v2.0, Test Plan & QA Strategy v2.0 |
| **Development Window** | Build Phase — October 2026 to January 2027, 4 monthly sprint blocks |
| **Methodology** | Agile, single-developer Scrum-like execution (developer as Product Owner, Scrum Master, and sole Developer; supervisor as external stakeholder) |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial backlog breaking SRS-FR-1.x through FR-10.x into sprint-sized user stories, planned for Mar–Jun 2026 | Product/Engineering Team |
| 2.0 | 2026-09-08 | Re-dated all sprint blocks to Oct 2026–Jan 2027 (the active build window); added v2.0 stories: US-0.3 (refresh token), US-0.4 (Socket.io/WebSocket messaging), US-0.5 (Cloudinary media storage), US-0.6 (notifications); updated sprint totals and velocity targets | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This document breaks every functional requirement in the SRS (SRS-FR-1.1 through SRS-FR-10.6) into Agile user stories, sized and sequenced into the four monthly sprint blocks already defined in the Project Plan / Gantt Timeline §3 (Phase 2). It is the operational, week-to-week execution artifact that turns "Sprint Block 1: Auth & RBAC" into a concrete, ticketable list of stories with acceptance criteria, story points, and dependencies.

### 1.2 Intended Audience
- The developer, for day-to-day/week-to-week sprint execution and self-tracking
- Academic supervisor, for visibility into how requirements translate into implementation units
- Examiners, as evidence that the stated Agile methodology (PRD/SRS) was operationalized, not just named

### 1.3 Backlog Conventions
- **Story ID format:** `US-<module-number>.<sequence>` — module number matches the SRS feature section (e.g., `US-1.1` traces to SRS-FR-1.1's feature area).
- **Story points:** Fibonacci-like scale (1, 2, 3, 5, 8) reflecting relative effort, calibrated for solo part-time academic execution (a "5" is a substantial multi-day task, not a full week).
- **Priority:** Inherited directly from the SRS requirement's priority (P0/P1/P2); P0 stories are non-negotiable for MVP and are sequenced first within each sprint block.
- **Definition of Done (applies to every story unless overridden):**
  1. Implementation matches the corresponding SRS-FR requirement and API Specification contract.
  2. Server-side validation and RBAC checks applied per Security & Data Protection Policy.
  3. Unit test(s) written and passing (Test Plan traceability).
  4. Code committed following Conventional Commits format with SRS-FR reference in the commit footer (Coding Standards & Git Workflow Guide).
  5. Manually smoke-tested against the acceptance criteria below.

### 1.4 Sprint Block Overview (from Project Plan §3, Phase 2)

| Sprint Block | Timeframe | SRS Features Covered | Total Stories |
|---|---|---|---|
| Sprint Block 1 | October 2026 (Weeks 1–4) | 3.1 Auth (incl. refresh tokens), 3.2 RBAC | 17 |
| Sprint Block 2 | November 2026 (Weeks 5–8) | 3.3 Profile Mgmt, 3.4 Portfolio Mgmt (Cloudinary) | 16 |
| Sprint Block 3 | December 2026 (Weeks 9–12) | 3.5 Casting Calls, 3.6 Applications, 3.7 Search | 18 |
| Sprint Block 4 | January 2027 (Weeks 13–16) | 3.8 Matching, 3.9 Messaging (Socket.io), 3.10 Admin, Notifications | 20 |
| **Total** | | | **71 stories** |

---

## 2. Sprint Block 1 — Authentication & RBAC (October 2026)

**Sprint Goal:** A user of any of the three primary roles can register, log in, and have every subsequent API request correctly authenticated and authorized, with no protected route reachable without the correct role.

**Why this block is first:** every other module in the system sits behind auth/RBAC (Project Plan §4 critical path); no other story in Sprint Blocks 2–4 can be meaningfully demoed without this block complete.

| Story ID | User Story | Traces To | Priority | Points |
|---|---|---|---|---|
| US-0.1 | As a developer, I want the repo scaffolded per the Coding Standards & Git Workflow Guide (folder structure, linting, CI skeleton) so that all subsequent work follows a consistent structure. | Coding Standards Guide | P0 | 3 |
| US-0.2 | As a developer, I want environment configuration (`.env` handling, MongoDB Atlas connection, cloud storage credentials) set up so the application can run locally and in CI. | Architecture §10 | P0 | 2 |
| US-1.1 | As a new user, I want to select my role (Model / Industry Professional / Pageant Organizer) during registration so the system creates the correct profile type. | SRS-FR-1.1 | P0 | 3 |
| US-1.2 | As a new user, I want to register with a unique email and a password meeting complexity rules so my account is created securely. | SRS-FR-1.2 | P0 | 3 |
| US-1.3 | As the system, I want passwords hashed with bcrypt before storage so plaintext credentials are never persisted. | SRS-FR-1.3 | P0 | 2 |
| US-1.8 | As a Model registrant, I want to declare my representation status (Freelance / Agency-Represented) at registration so my profile reflects this from the start. | SRS-FR-1.8 | P0 | 1 |
| US-1.4 | As a registered user, I want to log in and receive a JWT so I can make authenticated requests. | SRS-FR-1.4 | P0 | 3 |
| US-1.5 | As a user attempting login, I want invalid credentials to return a generic error so account enumeration isn't possible. | SRS-FR-1.5 | P0 | 1 |
| US-1.6 | As a logged-in user, I want to log out and have my session token invalidated client-side so my account isn't left accessible on a shared device. | SRS-FR-1.6 | P0 | 2 |
| US-1.7 | As a user who forgot my password, I want to request a password-reset link via email so I can regain access without contacting an admin. | SRS-FR-1.7 | P0 | 5 |
| US-1.10 | As the system, I want to lock an account after 5 consecutive failed login attempts within 15 minutes so brute-force attacks are mitigated. | SRS-FR-1.10 | P1 | 3 |
| US-2.1 | As the system, I want an authorization middleware that enforces role permissions at the API layer for every protected endpoint so UI-only restrictions can never be bypassed. | SRS-FR-2.1 | P0 | 5 |
| US-2.2 | As the system, I want a Model blocked from casting-call creation endpoints so role boundaries are enforced. | SRS-FR-2.2 | P0 | 2 |
| US-2.3 | As the system, I want an Industry Professional/Pageant Organizer blocked from editing another organization's casting call so record-level ownership is enforced, not just role membership. | SRS-FR-2.3 | P0 | 3 |
| US-2.5 | As the system, I want unauthorized access attempts to return HTTP 403 with no data leakage so failed authorization never reveals internal state. | SRS-FR-2.5 | P0 | 2 |
| US-2.4 | As an Administrator, I want administrative functionality restricted exclusively to my role so no other role can reach verification/moderation endpoints. | SRS-FR-2.4 | P0 | 2 |

**Sprint Block 1 total: 42 points.**

**Sprint Block 1 Exit Checklist:**
- [ ] Registration works for all three primary roles end-to-end
- [ ] Login issues a valid JWT; logout invalidates it client-side
- [ ] Password-reset flow sends and honors a valid reset link
- [ ] Every route intended to be protected is verified (manually or via test) to reject an unauthenticated or wrong-role request with 401/403
- [ ] Account lockout after 5 failed attempts confirmed
- [ ] Unit tests for Auth/RBAC module pass in CI

---

## 3. Sprint Block 2 — Profile & Portfolio Management (April 2026)

**Sprint Goal:** Each role can create, edit, and publish a structured profile; Models can build a multimedia portfolio with validated, safely stored media.

| Story ID | User Story | Traces To | Priority | Points |
|---|---|---|---|---|
| US-3.1 | As a Model, I want to create/edit my profile (name, country, DOB, height, measurements, category, experience, representation status) so recruiters can discover me accurately. | SRS-FR-3.1 | P0 | 5 |
| US-3.3 | As an Industry Professional, I want to create/edit my organization profile (name, type, country, description) so recruiters' identity and credibility are visible to talent. | SRS-FR-3.3 | P0 | 3 |
| US-3.4 | As a Pageant Organizer, I want to create/edit my institutional profile (name, country, pageant history, official status) so my organization is represented distinctly from a commercial recruiter. | SRS-FR-3.4 | P0 | 3 |
| US-3.5 | As the system, I want to validate mandatory profile fields before allowing publication so incomplete profiles never appear in search. | SRS-FR-3.5 | P0 | 3 |
| US-3.6 | As a platform user, I want to see a "Verified" badge on profiles that passed admin review so I can gauge trust signal at a glance. | SRS-FR-3.6 | P0 | 2 |
| US-3.2 | As a Model, I want to optionally link my Instagram/TikTok handles as labeled reference fields so recruiters can see my external presence without it being treated as verification. | SRS-FR-3.2 | P1 | 2 |
| US-3.7 | As any user, I want to update my profile at any time with changes reflected immediately in search so my listing always stays current. | SRS-FR-3.7 | P1 | 2 |
| US-4.1 | As a Model, I want to upload images (JPEG/PNG/WebP) and videos (MP4) to my portfolio so recruiters can view my work. | SRS-FR-4.1 | P0 | 5 |
| US-4.3 | As the system, I want to validate uploaded file type and enforce max size limits so storage/bandwidth risk (Risk RT-03) is controlled from day one. | SRS-FR-4.3 | P0 | 3 |
| US-4.4 | As a Model, I want a clear error message when my upload fails validation so I understand what to fix. | SRS-FR-4.4 | P0 | 1 |
| US-4.2 | As a Model, I want to categorize portfolio items (Photos, Runway Video, Commercial, Achievements) so my portfolio is organized for browsing recruiters. | SRS-FR-4.2 | P0 | 2 |
| US-4.5 | As the system, I want to auto-generate a thumbnail for each uploaded item so portfolio browsing loads quickly (NFR-PERF-2). | SRS-FR-4.5 | P0 | 3 |
| US-4.7 | As the system, I want media stored in cloud object storage and referenced by URL (never binary in MongoDB) so the primary database stays performant. | SRS-FR-4.7 | P0 | 3 |
| US-4.6 | As a Model, I want to delete or reorder my portfolio items so I can curate my presentation over time. | SRS-FR-4.6 | P1 | 3 |

**Sprint Block 2 total: 40 points.**

**Sprint Block 2 Exit Checklist:**
- [ ] All three role-specific profile types can be created and edited end-to-end
- [ ] Profile publication is blocked until mandatory fields are complete
- [ ] Verified badge renders correctly once Admin sets verification status (cross-check against Sprint Block 4's Admin module — badge display can be built now, verification-granting workflow lands in Sprint Block 4)
- [ ] Portfolio upload pipeline rejects invalid type/oversized files with a clear message
- [ ] Thumbnails generate automatically and are used in list/search views
- [ ] Integration test: full profile + portfolio flow for a Model, start to finish

---

## 4. Sprint Block 3 — Casting Calls, Applications & Search (May 2026)

**Sprint Goal:** Recruiters can publish and manage casting calls; talent can discover and apply to them; recruiters can manage the resulting applicant pipeline.

| Story ID | User Story | Traces To | Priority | Points |
|---|---|---|---|---|
| US-5.1 | As an Industry Professional/Pageant Organizer, I want to create a casting call (title, country, category, age/height range, required experience, description, deadline) so I can advertise an opportunity. | SRS-FR-5.1 | P0 | 5 |
| US-5.2 | As the system, I want to validate that all mandatory casting-call fields are complete before publishing so incomplete listings never go live. | SRS-FR-5.2 | P0 | 2 |
| US-5.3 | As a Talent User, I want to see published casting calls filterable by country and category so I can find relevant opportunities. | SRS-FR-5.3 | P0 | 3 |
| US-5.5 | As a recruiter, I want to manually close/archive my casting call at any time so I can stop accepting applications once a role is filled. | SRS-FR-5.5 | P0 | 2 |
| US-5.7 | As the system, I want to prevent applications to a closed or expired casting call so recruiters aren't burdened with applications to a role that's no longer open. | SRS-FR-5.7 | P0 | 2 |
| US-5.4 | As a recruiter, I want to edit my casting call before its deadline so I can correct or refine the listing. | SRS-FR-5.4 | P1 | 2 |
| US-5.6 | As the system, I want to automatically mark a casting call "Closed" once its deadline passes so recruiters don't need to remember to close it manually. | SRS-FR-5.6 | P1 | 3 |
| US-6.1 | As a Talent User, I want to submit an application to an open casting call with one confirmed action so applying is fast and unambiguous. | SRS-FR-6.1 | P0 | 3 |
| US-6.2 | As the system, I want to prevent duplicate applications by the same Talent User to the same casting call so the applicant pool stays clean. | SRS-FR-6.2 | P0 | 2 |
| US-6.3 | As a recruiter, I want to view a list of applicants per casting call with profile summary and portfolio link so I can review candidates efficiently. | SRS-FR-6.3 | P0 | 3 |
| US-6.4 | As a recruiter, I want to update an application's status (Submitted → Shortlisted → Rejected/Accepted) so I can manage my hiring pipeline. | SRS-FR-6.4 | P0 | 3 |
| US-6.6 | As a Talent User, I want to view the status of all my submitted applications in one place so I can track my own pipeline. | SRS-FR-6.6 | P0 | 2 |
| US-6.5 | As a Talent User, I want an in-app notification when my application status changes so I don't have to keep re-checking manually. | SRS-FR-6.5 | P1 | 3 |
| US-7.1 | As a recruiter, I want country selection required as the primary scoping filter before seeing talent search results so results are relevant from the first query. | SRS-FR-7.1 | P0 | 2 |
| US-7.2 | As a recruiter, I want to filter talent by age range, height range, category, experience level, skills, and portfolio completeness so I can narrow to exactly what I need. | SRS-FR-7.2 | P0 | 5 |
| US-7.3 | As the system, I want to exclude profiles failing mandatory filter conditions so results are strictly accurate, not approximate. | SRS-FR-7.3 | P0 | 2 |
| US-7.4 | As a recruiter, I want filtered search results returned within acceptable response time so browsing feels responsive (NFR-PERF-1). | SRS-FR-7.4 | P0 | 3 |
| US-7.5 | As a recruiter, I want search results paginated/lazy-loaded so performance holds up with large result sets. | SRS-FR-7.5 | P1 | 2 |

**Sprint Block 3 total: 45 points.**

**Sprint Block 3 Exit Checklist:**
- [ ] Full casting-call lifecycle (create → publish → apply → close/expire) works end-to-end
- [ ] Duplicate-application prevention confirmed via integration test
- [ ] Recruiter application-management view correctly reflects status transitions
- [ ] Search requires country selection and correctly excludes non-matching profiles
- [ ] Search performance measured against NFR-PERF-1 target with realistic sample data volume
- [ ] Open Question from PRD §18 (country hard-gate vs. default filter) resolved and implemented consistently

---

## 5. Sprint Block 4 — Matching, Messaging & Administration (June 2026)

**Sprint Goal:** Recruiters receive ranked, explainable candidate matches; applicants and recruiters can message within an application context; administrators can verify, moderate, and audit the platform.

| Story ID | User Story | Traces To | Priority | Points |
|---|---|---|---|---|
| US-8.1 | As the system, I want to compute a suitability score for each eligible talent profile against a casting call's requirements so recruiters get algorithm-assisted ranking. | SRS-FR-8.1 | P0 | 5 |
| US-8.2 | As a recruiter, I want matched candidates presented in descending order of suitability score so the most relevant candidates surface first. | SRS-FR-8.2 | P0 | 3 |
| US-8.5 | As the system, I want the matching output framed as a ranking aid, not a final decision, so recruiters understand selection remains their action (SRS-FR-6.4). | SRS-FR-8.5 | P0 | 1 |
| US-8.3 | As a recruiter, I want to see which attributes contributed to a candidate's match score so the ranking is explainable, not a black box. | SRS-FR-8.3 | P1 | 3 |
| US-8.4 | As a Talent User, I want relevant open casting calls recommended to me based on my profile attributes so I discover opportunities I might otherwise miss. | SRS-FR-8.4 | P1 | 3 |
| US-9.1 | As a recruiter, I want to initiate a message thread with an applicant from the application-management view so I can communicate directly in context. | SRS-FR-9.1 | P0 | 3 |
| US-9.2 | As a Talent User, I want to reply to messages I receive so I can respond to recruiter outreach. | SRS-FR-9.2 | P0 | 2 |
| US-9.3 | As the system, I want to persist message history per conversation thread so both parties retain a record of the exchange. | SRS-FR-9.3 | P0 | 2 |
| US-9.5 | As the system, I want to prevent messaging between users with no shared casting/application context so spam/abuse is structurally limited. | SRS-FR-9.5 | P1 | 3 |
| US-9.4 | As a message recipient, I want an unread-message indicator so I know when to check my inbox. | SRS-FR-9.4 | P1 | 2 |
| US-10.1 | As an Administrator, I want to review pending verification requests including submitted documents so I can make an informed verification decision. | SRS-FR-10.1 | P0 | 3 |
| US-10.2 | As an Administrator, I want to approve or reject a verification request, updating the profile's verification status so the "Verified" badge (built in Sprint Block 2) reflects real decisions. | SRS-FR-10.2 | P0 | 3 |
| US-10.3 | As an Administrator, I want to suspend or remove a profile/organization/casting call that violates platform policy so I can enforce platform integrity. | SRS-FR-10.3 | P0 | 3 |
| US-10.4 | As an Administrator, I want to view a reported-content queue (flagged profiles, messages, casting calls) so moderation work is centralized. | SRS-FR-10.4 | P1 | 3 |
| US-10.6 | As the system, I want to log all administrative actions (who, what, when) so decisions are auditable (Security & Data Protection Policy §8.1). | SRS-FR-10.6 | P1 | 2 |
| US-10.5 | As an Administrator, I want to view summary platform metrics (users by role, active casting calls, applications submitted) so I can gauge platform health at a glance. | SRS-FR-10.5 | P1 | 3 |

**Sprint Block 4 total: 43 points.**

**Sprint Block 4 Exit Checklist:**
- [ ] Matching engine produces scored, ranked candidate lists for a sample casting call and matches manual expectations on hand-crafted test cases
- [ ] Messaging is confirmed scoped to application context only (no unrestricted user-to-user messaging)
- [ ] Admin verification workflow correctly updates the badge built in Sprint Block 2
- [ ] Admin action log captures every moderation/verification decision made during testing
- [ ] Full regression pass across all 10 SRS feature modules — this is the Project Plan's **Milestone M2 (Feature-Complete Build)**

---

## 6. Backlog Summary and Velocity Tracking

| Sprint Block | Timeframe | Stories | Points | P0 Stories | P1 Stories | P2 Stories |
|---|---|---|---|---|---|---|
| Sprint Block 1 | Oct 2026 | 17 | 47 | 14 | 3 | 0 |
| Sprint Block 2 | Nov 2026 | 16 | 44 | 11 | 5 | 0 |
| Sprint Block 3 | Dec 2026 | 18 | 45 | 13 | 5 | 0 |
| Sprint Block 4 | Jan 2027 | 20 | 52 | 13 | 7 | 0 |
| **Total** | **Oct 2026–Jan 2027** | **71** | **188** | **51** | **20** | **0** |

*Note: SRS-FR-1.9 (optional MFA, P2) is explicitly excluded from this MVP backlog per its P2/future-enhancement classification and is deferred to the Post-MVP roadmap (PRD §14).*

**Suggested weekly velocity target:** ~10–11 points/week sustains each 4-week, ~42-point sprint block on schedule. This should be tracked against actual completed points at the end of each week; if velocity falls below ~8 points/week for two consecutive weeks in a block, treat this as an early warning consistent with Risk Register RS-07 (underestimated effort) and re-prioritize remaining stories by priority column (P0 protected, P1 deferred first).

---

## 7. Backlog Grooming Notes

- **Cross-block dependency flag:** US-3.6 (Verified badge display, Sprint Block 2) depends on the verification-granting logic built in US-10.1/US-10.2 (Sprint Block 4). The badge's UI and data field can be built in Sprint Block 2 against a manually-settable `verificationStatus` value; the actual Admin-driven workflow that sets it correctly is not complete until Sprint Block 4. This is intentional sequencing (documented here so it isn't mistaken for a defect during Sprint Block 2 testing) and matches the dependency already noted in the Project Plan.
- **Cross-block dependency flag:** US-9.5 (messaging context restriction) depends on US-6.1/US-6.2 (Application submission, Sprint Block 3) existing first, since "shared casting/application context" is defined by an application record.
- **Re-prioritization rule:** if a sprint block runs over its point budget, defer P1 stories within that block to a buffer week before Sprint Block 4's exit (not into Phase 3), rather than letting slippage silently compound across blocks — consistent with Risk Register RS-02/RS-07.
- **This backlog should be updated at the end of each sprint block** with actual points completed, any stories carried over, and any new stories discovered during implementation (e.g., a technical spike that wasn't anticipated), so it remains an accurate historical record for the final evaluation chapter.

---

## 8. Traceability Confirmation

Every SRS functional requirement (SRS-FR-1.1 through SRS-FR-10.6) is represented by exactly one user story above, with the single deliberate exception of SRS-FR-1.9 (P2, deferred per §6 note). v2.0 additions (refresh token, Cloudinary, Socket.io, notifications) are new P0 stories that support the locked architectural decisions from SADD v2.0. This backlog is a complete decomposition of the SRS's functional scope into Agile execution units, closing the traceability chain:

**PRD → SRS → Sprint Backlog → Coding Standards commit-footer FR references → Test Plan FR-traced test cases.**

---

*End of Sprint Backlog v2.0 — Updated 2026-09-08. Update per sprint block as work is actually completed.*
