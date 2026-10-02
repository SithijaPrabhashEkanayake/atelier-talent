# Test Plan & QA Strategy
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Test Plan & Quality Assurance Strategy |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Companion Documents** | PRD v2.0, SRS v2.0, System Architecture Design Document v2.0, Database Design Document v2.0, API Specification v2.0, UI/UX Design Document v2.0 |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial comprehensive test plan covering all test levels, module-level test case suites, NFR verification, and traceability back to SRS-FR/NFR IDs | QA/Engineering Team |
| 2.0 | 2026-09-08 | Added test cases for: refresh token endpoint (`POST /auth/refresh-token`), token revocation, Socket.io connection/authentication, real-time message delivery, Cloudinary upload verification (confirm `res.cloudinary.com` URL format), notifications API; updated companion documents to v2.0; updated status to Active | Engineering Team |

---

## Table of Contents

1. Introduction
2. Test Objectives
3. Scope of Testing
4. Test Strategy & Levels
5. Test Environment & Tools
6. Entry, Exit, and Suspension Criteria
7. Roles & Responsibilities
8. Risk-Based Test Prioritization
9. Functional Test Case Suites (Module by Module)
10. Non-Functional Test Plan
11. Security Test Plan
12. Regression Testing Strategy
13. User Acceptance Testing (UAT) Plan
14. Defect Management
15. Test Schedule
16. Requirement Traceability Matrix
17. Test Deliverables
18. Assumptions, Constraints & Open Questions

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete testing strategy and test case suites for the Global Multidimensional Talent Marketplace and Casting Management System. It operationalizes PRD §15 (Testing Plan) and SRS §5 (Non-Functional Requirements) into concrete, executable test cases with pass/fail criteria, and provides full traceability from every functional and non-functional requirement to at least one test case — a requirement the academic examination process and the DSRM evaluation phase both depend on.

### 1.2 Audience
- The developer (acting as both implementer and primary tester, given solo/small-team academic project scope)
- The academic supervisor/examiners assessing testing rigor
- Any future contributor or maintainer who needs to understand what "done and verified" means for each feature
- UAT participants executing task-based scenarios

### 1.3 Relationship to Other Documents
This plan tests against contracts already fixed elsewhere: functional correctness is verified against SRS §3 requirement IDs and API Specification endpoint behavior; data integrity is verified against the Database Design Document's schema and constraints; UI behavior is verified against the UI/UX Design Document's screen specifications; and non-functional targets (performance, security, usability) are verified against SRS §5 and PRD §3.3 KPIs. This document does not redefine any of those contracts — it only defines how each is checked.

---

## 2. Test Objectives

1. Verify that every P0 and P1 functional requirement in the SRS behaves exactly as specified, for every role permitted to use it and rejected for every role that should not be able to.
2. Verify that role-based access control cannot be bypassed under any tested condition (zero tolerance — PRD §3.3 states 0 RBAC violations as a pass criterion).
3. Verify the platform meets its stated performance targets (sub-3-second search, sub-5-second matching for up to 500 candidates, sub-1-second standard CRUD) under realistic pilot-scale load.
4. Verify the system resists common web vulnerabilities (injection, XSS, broken auth, insecure file upload) to a level appropriate for an academic prototype following OWASP guidance.
5. Verify the system is usable without instruction by first-time users of each role, and achieves a System Usability Scale (SUS) score ≥ 68.
6. Establish a repeatable regression suite so that fixes and new features do not silently break previously verified behavior over the Mar–Aug 2026 development window.
7. Produce a documented, traceable body of evidence (test case results, defect log, UAT summary) suitable for inclusion in the thesis evaluation chapter.

---

## 3. Scope of Testing

### 3.1 In Scope
- All ten feature modules defined in SRS §3: Authentication, RBAC, Profile Management, Portfolio Management, Casting Management, Application Management, Search & Filtering, Matching & Recommendation, Messaging, Administration.
- All 13 API modules defined in the API Specification (§3–§13 of that document).
- All 20 screens defined in the UI/UX Design Document (§8 of that document), for functional and usability testing.
- Non-functional characteristics explicitly listed in SRS §5: Performance, Security, Reliability/Availability, Usability, Scalability/Maintainability, Accessibility.
- Cross-browser testing on the two most recent major versions of Chrome, Firefox, Safari, and Edge, per SRS §2.4.
- Responsive testing across desktop (≥1280px), tablet, and mobile (≥360px) viewports, per SRS §4.1 and UI/UX Design Document §10.

### 3.2 Out of Scope
Consistent with PRD §6.2 and SRS §2.5, the following are explicitly **not tested** because they are not built in this release:
- Payment/escrow processing.
- Legal-grade identity verification or biometric/facial-recognition accuracy.
- Native mobile application testing (iOS/Android app stores) — web-responsive only.
- Digital contract e-signature workflows.
- Load testing beyond pilot scale (≤100 concurrent users per NFR-PERF-1); full commercial-scale load/stress testing is explicitly deferred to a post-MVP phase.
- Penetration testing by a certified third party (this plan includes developer-executed security testing only, not a formal external penetration test).

---

## 4. Test Strategy & Levels

| Level | Purpose | Primary Technique | Primary Owner |
|---|---|---|---|
| **Unit Testing** | Verify individual functions/modules in isolation (password hashing, validation logic, score calculation) | Automated (Jest for Node.js backend; React Testing Library for frontend components) | Developer |
| **Integration Testing** | Verify correct interaction between backend controllers, database, and cloud storage; verify frontend API integration | Automated (Supertest against Express routes; mocked/staging MongoDB) + manual Postman collection | Developer/QA |
| **System Testing** | Verify complete end-to-end user journeys across the deployed staging environment | Manual scripted test cases (this document §9) + Cypress/Playwright for critical-path automation | QA |
| **Security Testing** | Verify RBAC enforcement, input sanitization, auth robustness, upload safety | Manual adversarial testing + automated tooling (OWASP ZAP baseline scan) | QA/Developer |
| **Performance Testing** | Verify response-time and throughput targets under pilot-scale simulated load | Automated load testing (k6 or Apache JMeter) against staging environment | Developer/QA |
| **Usability / UAT** | Verify real users can complete core tasks without instruction and rate the system ≥ 68 SUS | Moderated task-based sessions with pilot participants | Developer (as facilitator) + pilot participants |
| **Regression Testing** | Verify new changes do not break previously passing functionality | Automated suite (Jest/Supertest/Cypress) re-run on every merge to main branch | Developer, via CI pipeline |

### 4.1 Test Design Techniques Used
- **Equivalence partitioning** for form inputs (e.g., valid/invalid password lengths, valid/invalid file types).
- **Boundary value analysis** for numeric ranges (age range, height range, file size limits, 5-failed-login lockout threshold).
- **Decision-table testing** for role × permission combinations (RBAC matrix, §9.2).
- **State-transition testing** for lifecycle entities (Casting Call: Draft → Open → Closed/Expired; Application: Submitted → Shortlisted → Accepted/Rejected; Verification: Unverified → Pending → Verified/Rejected).
- **Exploratory testing** sessions scheduled at the end of each development sprint to catch issues scripted cases miss.

---

## 5. Test Environment & Tools

### 5.1 Environments

| Environment | Purpose | Configuration |
|---|---|---|
| **Local (Development)** | Developer-run unit/integration tests during coding | Local MongoDB instance or MongoDB Atlas free-tier dev cluster; local Node server |
| **Staging** | Full system testing, security testing, performance testing, UAT | Deployed per System Architecture Design Document — Vercel (frontend), Render (backend), MongoDB Atlas (staging cluster), isolated from production data |
| **Production/Pilot** | Final smoke testing only, post sign-off | Live pilot deployment; no destructive testing performed here |

### 5.2 Tooling

| Purpose | Tool |
|---|---|
| Backend unit/integration testing | Jest, Supertest |
| Frontend component testing | React Testing Library, Jest |
| End-to-end browser automation | Cypress or Playwright (either acceptable; Playwright recommended for multi-browser coverage per §3.1) |
| Manual API testing | Postman (collection maintained per API Specification §16), Newman for CI-driven collection runs |
| Performance/load testing | k6 or Apache JMeter |
| Security scanning | OWASP ZAP (baseline automated scan against staging) |
| Accessibility spot-checks | Axe DevTools browser extension, manual keyboard-navigation walkthroughs |
| Defect tracking | GitHub Issues (labeled by severity/module) or equivalent lightweight tracker |
| CI/CD test execution | GitHub Actions (test suite run on every pull request and merge to main) |

### 5.3 Test Data Strategy
- A seed dataset representing all four roles (minimum 20 Model profiles across varied countries/categories/verification states, 5 Industry Professional profiles, 3 Pageant Organizer profiles, 1 Admin account) shall be scripted and re-creatable via a seed script, so the staging environment can be reset to a known state before each test cycle.
- Test data shall include deliberately edge-case records: a profile with zero portfolio items, a casting call at its deadline boundary, a user with 4 failed login attempts (one below lockout), and a casting call with 500+ eligible candidates for matching-algorithm performance testing (NFR-PERF-3).
- No real personal data shall be used in any environment other than production/pilot with informed consent (per SRS §7.1).

---

## 6. Entry, Exit, and Suspension Criteria

### 6.1 Entry Criteria (per test cycle)
- The feature/module under test has a corresponding, merged implementation deployed to the staging environment.
- Unit and integration tests for the module pass in CI.
- The relevant SRS-FR/API/UI-spec sections are stable (no pending design changes for that module).

### 6.2 Exit Criteria (to consider testing of a module complete)
- 100% of P0 test cases for the module pass.
- ≥ 95% of P1 test cases for the module pass, with any failures triaged as non-blocking (see §14.2 severity classification).
- Zero open **Critical** or **High** severity defects for the module.
- All P0 SRS-FR IDs for the module have at least one passing test case mapped in the traceability matrix (§16).

### 6.3 Suspension/Resumption Criteria
Testing on a module is **suspended** if a Critical defect blocks execution of more than 30% of that module's remaining test cases (e.g., authentication failure blocking all role-gated tests). Testing **resumes** once the blocking defect is fixed and redeployed to staging, starting with a smoke-test re-run of previously passed cases in that module before continuing.

---

## 7. Roles & Responsibilities

Given the academic/single-developer project context, one individual may hold multiple roles below; they are separated for clarity of responsibility, not to imply a larger team is required.

| Role | Responsibility |
|---|---|
| **Developer** | Writes unit/integration tests alongside code; fixes defects; maintains CI pipeline |
| **QA / Tester** | Executes system, security, and performance test cases; logs defects; maintains this document and the traceability matrix |
| **UAT Facilitator** | Recruits pilot participants, runs moderated sessions, administers SUS survey, compiles findings |
| **Academic Supervisor** | Reviews test evidence and traceability as part of thesis evaluation (not an execution role) |

---

## 8. Risk-Based Test Prioritization

Testing effort is allocated in proportion to risk, not evenly across all features. High-risk areas receive the deepest test coverage and the earliest testing slot in the schedule (§15).

| Area | Risk Level | Rationale | Testing Depth |
|---|---|---|---|
| Authentication & RBAC | **Critical** | A bypass undermines the platform's entire trust proposition (PRD §2, "trust gap") | Exhaustive: every role × every protected endpoint combination (§9.2) |
| File Upload (Portfolio, Verification Documents) | **High** | Malicious upload is a direct security/availability threat (NFR-SEC-4) | Adversarial testing with invalid MIME types, oversized files, disguised extensions |
| Application/Casting state transitions | **High** | Incorrect state handling causes double-applications, phantom listings, or lost applicant data | Full state-transition coverage (§4.1) |
| Matching Algorithm correctness | **Medium** | Incorrect ranking reduces product value but is not a security/data-integrity risk since it is explicitly decision-support only (SRS-FR-8.5) | Representative scoring scenarios + boundary cases |
| Messaging | **Medium** | Context-scoping failure (SRS-FR-9.5) could enable spam/abuse | Verify thread creation is always tied to a valid application context |
| Admin Metrics / Logs | **Low** | Read-only, non-user-facing, low blast radius if imperfect | Basic functional verification only |

---

## 9. Functional Test Case Suites (Module by Module)

Each test case ID follows the pattern `TC-<MODULE>-<NUMBER>`. Every case cites the SRS-FR ID(s) and API endpoint it verifies. Priority (P0/P1/P2) mirrors the priority of the requirement it tests, per SRS §3.

### 9.1 Module: Authentication (`TC-AUTH`)

| ID | Description | Precondition | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|---|
| TC-AUTH-01 | Register as Model with valid data | None | 1. Navigate to `/register`. 2. Select role = Model. 3. Enter valid email/password. 4. Select representation status. 5. Submit. | `201 Created`; user record created with `role=model`, `verificationStatus=unverified`; JWT returned | SRS-FR-1.1, 1.2, 1.8 | P0 |
| TC-AUTH-02 | Register with duplicate email | A user with `test@example.com` already exists | Attempt registration with the same email | `409 DUPLICATE_RESOURCE`; no new record created | SRS-FR-1.2 | P0 |
| TC-AUTH-03 | Register with weak password | None | Submit password `"abc"` (below min. 8 chars / complexity rule) | `400 VALIDATION_ERROR`; account not created | SRS-FR-1.2 | P0 |
| TC-AUTH-04 | Register as Model without representation status | None | Submit registration with role=model, omitting `representationStatus` | `400 VALIDATION_ERROR` | SRS-FR-1.8 | P0 |
| TC-AUTH-05 | Password stored hashed, never plaintext | User registered successfully | Inspect the database record directly | `password_hash` field contains a bcrypt hash, not the plaintext password; no plaintext password appears in server logs | SRS-FR-1.3, NFR-SEC-1 | P0 |
| TC-AUTH-06 | Login with valid credentials | Registered user exists | Submit correct email/password to `POST /auth/login` | `200 OK`; JWT returned containing `id`, `role`, `verificationStatus` claims | SRS-FR-1.4 | P0 |
| TC-AUTH-07 | Login with incorrect password | Registered user exists | Submit correct email, wrong password | `401 UNAUTHORIZED`; generic message "invalid credentials" — does not reveal whether email or password was wrong | SRS-FR-1.5 | P0 |
| TC-AUTH-08 | Login with non-existent email | None | Submit an unregistered email | `401 UNAUTHORIZED`; identical generic message to TC-AUTH-07 (no user-enumeration signal) | SRS-FR-1.5 | P0 |
| TC-AUTH-09 | Account lockout after 5 failed attempts | Registered user exists | Submit wrong password 5 times within 15 minutes, then attempt with correct password | 6th attempt (even with correct password) returns `403 FORBIDDEN` / `ACCOUNT_LOCKED` until lockout window expires | SRS-FR-1.10 | P1 |
| TC-AUTH-10 | Logout invalidates session client-side | Logged-in user | Call `POST /auth/logout`, then attempt an authenticated request reusing the old token | Logout returns `200 OK`; subsequent request behavior matches documented session policy (client discards token; server-side denylist behavior verified per Architecture doc's stated implementation) | SRS-FR-1.6 | P0 |
| TC-AUTH-11 | Forgot-password does not reveal account existence | None | Submit `forgot-password` for both a registered and an unregistered email | Both return identical `200 OK` "If an account exists, a reset link has been sent." message | SRS-FR-1.7 | P0 |
| TC-AUTH-12 | Reset password with valid token | Reset flow initiated, valid reset token available | Submit new password with valid token | `200 OK`; user can subsequently log in with the new password; old password no longer works | SRS-FR-1.7 | P0 |
| TC-AUTH-13 | Reset password with expired/invalid token | Reset token expired or tampered | Submit reset request with the invalid token | `401 UNAUTHORIZED` / `INVALID_OR_EXPIRED_RESET_TOKEN` | SRS-FR-1.7 | P1 |
| TC-AUTH-14 | Expired JWT rejected on protected route | Valid JWT that has passed its expiry | Call any protected endpoint (e.g., `GET /auth/me`) with the expired token | `401 UNAUTHORIZED` / `TOKEN_EXPIRED` | SRS-FR-1.4, NFR-SEC-2 | P0 |
| TC-AUTH-15 | Rate limiting on auth endpoints | None | Submit 11+ requests to `/auth/login` within 15 minutes from the same IP | 11th+ request returns `429 RATE_LIMITED` | API Spec §2.7 | P1 |

### 9.2 Module: Role-Based Access Control (`TC-RBAC`)

A full decision-table sweep: every protected endpoint tested against every role that should be **denied**, in addition to the role that should be **allowed** (already covered implicitly by the functional cases in other suites). This suite exists specifically to hunt for RBAC gaps.

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-RBAC-01 | Model cannot create a casting call | Authenticate as Model; call `POST /castings` | `403 FORBIDDEN`, no casting call created | SRS-FR-2.2 | P0 |
| TC-RBAC-02 | Industry Professional cannot edit another organization's casting call | Authenticate as Org A; attempt `PUT /castings/{id}` on a casting call created by Org B | `403 FORBIDDEN` | SRS-FR-2.3 | P0 |
| TC-RBAC-03 | Non-admin cannot access any `/admin/*` endpoint | Authenticate as Model, Industry Professional, and Pageant Organizer in turn; call each `/admin/*` endpoint | `403 FORBIDDEN` for all three roles on every admin endpoint | SRS-FR-2.4 | P0 |
| TC-RBAC-04 | Unauthenticated request to any protected endpoint | Omit the `Authorization` header entirely; call a sample of protected endpoints from each module | `401 UNAUTHORIZED` for every one, with no data returned in the response body | SRS-FR-2.1, 2.5 | P0 |
| TC-RBAC-05 | Forbidden response contains no data leakage | Trigger a `403` on a resource the user is not permitted to view (e.g., another user's draft casting call) | Response body contains only the standard error envelope — no fragment of the protected resource's data | SRS-FR-2.5 | P0 |
| TC-RBAC-06 | Talent User cannot access another Talent User's private application list | Authenticate as Model A; call `GET /applications/me` expecting only Model A's own applications; attempt to query Model B's applications via any parameter manipulation | Only the authenticated user's own applications are ever returned; no endpoint accepts an arbitrary `modelId` override | SRS-FR-6.6, NFR-SEC-7 | P0 |
| TC-RBAC-07 | Non-participant cannot read a message thread | Authenticate as a user who is not part of Thread X; call `GET /messages/threads/{X}` | `403 FORBIDDEN` | API Spec §10.3 | P0 |
| TC-RBAC-08 | Client-side route restriction is not the only defense | Directly call the API for an admin-only action while authenticated as a non-admin, bypassing the UI entirely | Server rejects the call identically to TC-RBAC-03, confirming enforcement is server-side, not merely a hidden UI element | NFR-SEC-7 | P0 |

### 9.3 Module: Profile Management (`TC-PROF`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-PROF-01 | Model creates a complete profile | Fill all fields in §SRS-FR-3.1 (name, country, DOB, height, measurements, category, experience, representation status); save | `200 OK`; `GET /profiles/me` returns all saved fields correctly | SRS-FR-3.1 | P0 |
| TC-PROF-02 | Profile publication blocked with missing mandatory fields | Omit a mandatory field (e.g., country); attempt to publish | `400 VALIDATION_ERROR`; profile not marked as search-visible | SRS-FR-3.5 | P0 |
| TC-PROF-03 | Social media link stored as labeled, non-verifying reference | Add an Instagram handle | Handle is saved and rendered in the UI with a visible "unverified external link" label (per UI/UX Design Document §8.5) | SRS-FR-3.2 | P1 |
| TC-PROF-04 | Industry Professional org profile creation | Fill org name, type, country, description | Profile saved; distinct schema from ModelProfile (per Database Design Document) | SRS-FR-3.3 | P0 |
| TC-PROF-05 | Pageant Organizer institutional profile creation | Fill org name, country, pageant history, official status | Profile saved correctly | SRS-FR-3.4 | P0 |
| TC-PROF-06 | Verified badge appears after admin approval | Admin approves a pending verification (see TC-ADMIN-02) | Profile now displays the "Verified" badge everywhere it is rendered (own profile, search results, applicant rows) | SRS-FR-3.6 | P0 |
| TC-PROF-07 | Profile edits reflected immediately in search | Edit a searchable field (e.g., category); immediately re-run a matching search | Updated value is reflected in search results without delay or caching staleness | SRS-FR-3.7 | P1 |
| TC-PROF-08 | Age is derived from DOB, not independently editable | Attempt to submit an `age` value directly that conflicts with DOB | System derives/validates age server-side from DOB; a mismatched client-submitted age is ignored or rejected | SRS-FR-3.1 | P1 |

### 9.4 Module: Portfolio Management (`TC-PORT`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-PORT-01 | Upload valid image (JPEG) | Upload a 2MB JPEG to `/portfolio/upload` | `201 Created`; item appears with a generated thumbnail | SRS-FR-4.1, 4.5 | P0 |
| TC-PORT-02 | Upload valid video (MP4) | Upload a 50MB MP4 | `201 Created`; item appears with a generated thumbnail/preview frame | SRS-FR-4.1, 4.5 | P0 |
| TC-PORT-03 | Categorize a portfolio item | Upload with `category=runway` | Item is correctly tagged and filterable by category in the Portfolio Manager UI | SRS-FR-4.2 | P0 |
| TC-PORT-04 | Reject oversized image | Upload a 40MB image (exceeds the 25MB limit) | `400 FILE_TOO_LARGE`; item not created | SRS-FR-4.3, 4.4 | P0 |
| TC-PORT-05 | Reject oversized video | Upload a 250MB video (exceeds the 200MB limit) | `400 FILE_TOO_LARGE` | SRS-FR-4.3, 4.4 | P0 |
| TC-PORT-06 | Reject unsupported file type | Upload a `.exe` or `.pdf` file renamed to `.jpg` | `400 UNSUPPORTED_FILE_TYPE` — validated by actual file content/MIME sniffing, not filename extension alone | SRS-FR-4.3, 4.4, NFR-SEC-4 | P0 |
| TC-PORT-07 | Delete a portfolio item | Delete an existing item | `204 No Content`; item no longer appears in `GET /portfolio/{profileId}` or in the underlying cloud storage reference | SRS-FR-4.6 | P1 |
| TC-PORT-08 | Reorder portfolio items | Reorder via `PATCH /portfolio/{itemId}/reorder` | New order persists and is reflected on next page load | SRS-FR-4.6 | P1 |
| TC-PORT-09 | Media referenced by URL, not stored as binary in primary DB | Inspect the database record for an uploaded item | Record contains a cloud storage URL/key, not embedded binary data | SRS-FR-4.7 | P0 |
| TC-PORT-10 | Non-owner cannot delete or reorder another user's portfolio item | Authenticate as Model B; attempt to delete/reorder Model A's item | `403 FORBIDDEN` | SRS-FR-4.6, NFR-SEC-7 | P0 |

### 9.5 Module: Casting Call / Advertisement Management (`TC-CAST`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-CAST-01 | Create casting call with all required fields | Submit title, country, category, age/height range, experience, description, deadline | `201 Created`; casting call visible in `GET /castings` for matching country/category filters | SRS-FR-5.1 | P0 |
| TC-CAST-02 | Reject casting call with missing mandatory field | Omit `deadline` | `400 VALIDATION_ERROR` | SRS-FR-5.2 | P0 |
| TC-CAST-03 | Reject casting call with invalid range (minAge > maxAge) | Submit `minAge: 40, maxAge: 20` | `422 UNPROCESSABLE_ENTITY` | SRS-FR-5.2 | P0 |
| TC-CAST-04 | Talent user browses casting calls filtered by country/category | Set filters; call `GET /castings?country=X&category=Y` | Only casting calls matching both filters are returned | SRS-FR-5.3 | P0 |
| TC-CAST-05 | Creator edits casting call before deadline | Call `PUT /castings/{id}` before the deadline passes | `200 OK`; changes reflected in subsequent reads | SRS-FR-5.4 | P1 |
| TC-CAST-06 | Creator manually closes a casting call | Call `PATCH /castings/{id}/close` | Status becomes `closed`; casting call no longer appears in open browse results | SRS-FR-5.5 | P0 |
| TC-CAST-07 | Casting call auto-closes at deadline | Advance system/test clock past a casting call's deadline (or use a pre-seeded expired record) | Status automatically reflects `closed`/`expired` on next read, without manual intervention | SRS-FR-5.6 | P1 |
| TC-CAST-08 | Application blocked on closed casting call | Attempt `POST /applications` against a closed casting call | `400 INVALID_STATE_TRANSITION` | SRS-FR-5.7 | P0 |
| TC-CAST-09 | Application blocked on expired casting call | Attempt to apply to an auto-expired casting call | Same rejection as TC-CAST-08 | SRS-FR-5.7 | P0 |

### 9.6 Module: Application Management (`TC-APPL`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-APPL-01 | Submit application to open casting call | Call `POST /applications` with a valid, open `castingCallId` | `201 Created`; status `submitted` | SRS-FR-6.1 | P0 |
| TC-APPL-02 | Prevent duplicate application | Apply to the same casting call twice with the same user | Second attempt returns `409 DUPLICATE_RESOURCE`; only one application record exists | SRS-FR-6.2 | P0 |
| TC-APPL-03 | Recruiter views applicant list with profile summary | Call `GET /castings/{id}/applicants` as the creating recruiter | Returns applicant list with profile summary and portfolio link per applicant | SRS-FR-6.3 | P0 |
| TC-APPL-04 | Recruiter shortlists an applicant | `PATCH /applications/{id}/status` with `status=shortlisted` | Status updates; visible immediately in both recruiter and applicant views | SRS-FR-6.4 | P0 |
| TC-APPL-05 | Recruiter rejects an applicant | `PATCH /applications/{id}/status` with `status=rejected` | Status updates correctly; application remains visible (not deleted) in the applicant's history | SRS-FR-6.4 | P0 |
| TC-APPL-06 | Invalid status transition rejected | Attempt to move an application directly from `rejected` back to `submitted` | `400 INVALID_STATE_TRANSITION` (per the state machine defined in Database Design Document) | SRS-FR-6.4 | P1 |
| TC-APPL-07 | Applicant notified in-app of status change | Change an application's status | An in-app notification/badge appears for the affected talent user | SRS-FR-6.5 | P1 |
| TC-APPL-08 | Talent user views all own application statuses in one place | Call `GET /applications/me` | Returns all applications for the authenticated user with current status, correctly grouped/filterable | SRS-FR-6.6 | P0 |

### 9.7 Module: Search & Filtering (`TC-SRCH`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-SRCH-01 | Country selection required before results | Call `GET /search/talent` without a country parameter | System applies a default/required country scope (per UI/UX Design Document §5.2's soft-gate behavior) rather than returning an unscoped global result set unexpectedly | SRS-FR-7.1 | P0 |
| TC-SRCH-02 | Filter by age range | Search with `minAge=20&maxAge=25` | Only profiles with derived age in range are returned | SRS-FR-7.2 | P0 |
| TC-SRCH-03 | Filter by height range | Search with height bounds | Only matching profiles returned | SRS-FR-7.2 | P0 |
| TC-SRCH-04 | Filter by category, experience, skills | Combine multiple optional filters | Result set satisfies the intersection of all applied filters | SRS-FR-7.2 | P0 |
| TC-SRCH-05 | Filter by portfolio completeness | Toggle "has ≥3 portfolio items" | Only profiles meeting the threshold are returned | SRS-FR-7.2 | P0 |
| TC-SRCH-06 | Mandatory filter conditions exclude non-matching profiles | Apply a mandatory filter (e.g., country) alongside optional filters | Profiles failing the mandatory filter never appear, regardless of optional-filter match strength | SRS-FR-7.3 | P0 |
| TC-SRCH-07 | Search performance under normal load | Run search queries against a seeded dataset with ≤100 simulated concurrent users | 95th percentile response time ≤ 3 seconds | SRS-FR-7.4, NFR-PERF-1 | P0 |
| TC-SRCH-08 | Pagination/lazy-load on large result sets | Query a filter combination returning >100 results | Results are paginated per API Specification §2.5; `meta.totalPages` is correct | SRS-FR-7.5 | P1 |

### 9.8 Module: Talent Matching & Recommendation (`TC-MATCH`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-MATCH-01 | Compute suitability scores for a casting call | `POST /match/castings/{id}/compute` against a casting call with 10 eligible candidates of varying attribute fit | Each eligible candidate receives a suitability score; scores reflect the weighted-attribute logic defined in PRD §12.2 | SRS-FR-8.1 | P0 |
| TC-MATCH-02 | Results ranked descending by score | `GET /match/castings/{id}/results` | Candidates are returned in strictly descending suitability-score order | SRS-FR-8.2 | P0 |
| TC-MATCH-03 | Match score breakdown transparency | Inspect a single match result's detail | Response/UI indicates which specific attributes matched or didn't (age ✓, height ✓, skills partial), per UI/UX Design Document §8.14 | SRS-FR-8.3 | P1 |
| TC-MATCH-04 | Recommendation of casting calls to talent | `GET /match/recommendations/castings` as a Model with a complete profile | Returns a relevance-ranked list of open casting calls whose criteria overlap the model's attributes | SRS-FR-8.4 | P1 |
| TC-MATCH-05 | Matching engine performance at scale | Compute matches for a casting call with 500 eligible candidates (seeded test data) | Ranked results returned within 5 seconds | NFR-PERF-3 | P0 |
| TC-MATCH-06 | Matching output is not an automatic decision | Verify no code path automatically shortlists/rejects an applicant purely from a match score without a recruiter action | No application status changes as a side effect of running the matching computation alone | SRS-FR-8.5 | P0 |
| TC-MATCH-07 | Boundary case — candidate with zero attribute overlap | Run matching for a casting call against a profile with no overlapping attributes at all | Candidate is still included in results at the bottom (score ≈ 0), not silently excluded or causing an error | SRS-FR-8.1, 8.2 | P1 |
| TC-MATCH-08 | Boundary case — no eligible candidates exist | Run matching for a casting call in a country/category with zero seeded profiles | System returns an empty results array (not an error), and UI shows the designed empty state (UI/UX Design Document §13.2) | SRS-FR-8.1 | P1 |

### 9.9 Module: Messaging (`TC-MSG`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-MSG-01 | Recruiter initiates a thread from an applicant context | `POST /messages/threads` with a valid `applicationId` | `201 Created`; thread linked to that application | SRS-FR-9.1 | P0 |
| TC-MSG-02 | Talent user replies within an existing thread | `POST /messages/threads/{id}` as the talent participant | `201 Created`; message appears in thread history for both participants | SRS-FR-9.2 | P0 |
| TC-MSG-03 | Message history persists across sessions | Send messages, log out, log back in, reopen the thread | All prior messages are present, in correct chronological order | SRS-FR-9.3 | P0 |
| TC-MSG-04 | Unread indicator shown to recipient | Send a message; check the recipient's thread list before they open it | Thread shows an unread indicator; disappears after `PATCH /messages/{id}/read` | SRS-FR-9.4 | P1 |
| TC-MSG-05 | Cannot initiate a thread with no shared application context | Attempt `POST /messages/threads` referencing an `applicationId` that does not belong to either party, or with no `applicationId` at all | Request rejected (`400`/`403` as appropriate); no thread created | SRS-FR-9.5 | P1 |
| TC-MSG-06 | Empty/over-length message content rejected | Submit an empty string or a message exceeding the defined max length | `400 VALIDATION_ERROR` | API Spec §10.4 | P1 |

### 9.10 Module: Administration (`TC-ADMIN`)

| ID | Description | Steps | Expected Result | Traces To | Priority |
|---|---|---|---|---|---|
| TC-ADMIN-01 | Admin views pending verification queue | `GET /admin/verifications?status=pending` | Returns all pending `VerificationRecord`s with linked user summary | SRS-FR-10.1 | P0 |
| TC-ADMIN-02 | Admin approves a verification request | `PATCH /admin/verifications/{id}` with `status=verified` | Record updates; linked `User.verificationStatus` becomes `verified`; action appears in admin log | SRS-FR-10.2 | P0 |
| TC-ADMIN-03 | Admin rejects a verification request | `PATCH /admin/verifications/{id}` with `status=rejected` and a `reviewNotes` reason | Record updates to `rejected`; user's profile reflects the rejection and reason | SRS-FR-10.2 | P0 |
| TC-ADMIN-04 | Admin suspends a user | `PATCH /admin/users/{id}/suspend` with a reason | User's `isActive` becomes `false`; suspended user can no longer log in or is logged out immediately | SRS-FR-10.3 | P0 |
| TC-ADMIN-05 | Admin removes a policy-violating casting call | `DELETE /admin/castings/{id}` | `204 No Content`; casting call no longer appears in browse/search; existing applications handled per defined data-integrity rule (Database Design Document) | SRS-FR-10.3 | P0 |
| TC-ADMIN-06 | Admin views the reports/moderation queue | `GET /admin/reports?status=open` | Returns open reports with target entity details | SRS-FR-10.4 | P1 |
| TC-ADMIN-07 | Admin resolves a report | `PATCH /admin/reports/{id}` with `status=resolved` | Report updates; removed from the open queue | SRS-FR-10.4 | P1 |
| TC-ADMIN-08 | Admin views platform metrics | `GET /admin/metrics` | Returns accurate counts matching the seeded/actual database state (spot-checked against direct DB queries) | SRS-FR-10.5 | P1 |
| TC-ADMIN-09 | All admin actions are logged | Perform each of TC-ADMIN-02 through TC-ADMIN-07 | Each action produces a corresponding `AdminActionLog` entry with correct `adminId`, `actionType`, `targetEntity`, and `timestamp` | SRS-FR-10.6 | P1 |
| TC-ADMIN-10 | Any authenticated user can file a report | `POST /reports` as a Model/Industry Pro/Pageant Org | `201 Created`; report appears in the admin queue with `status=open` | SRS-FR-10.4 | P0 |

---

## 10. Non-Functional Test Plan

### 10.1 Performance Testing

| ID | Requirement | Test Method | Pass Criterion |
|---|---|---|---|
| TC-PERF-01 | NFR-PERF-1: Search/filter response time | k6/JMeter script simulating 100 concurrent users issuing search queries against a seeded dataset of ≥1,000 profiles | 95th percentile response time ≤ 3 seconds |
| TC-PERF-02 | NFR-PERF-2: Progressive/thumbnail-first media loading | Network-throttled browser test (simulate 3G) loading a Portfolio Manager page with 20 items | Thumbnails render before full-resolution assets; perceived time-to-first-content is materially faster than a naive full-load baseline |
| TC-PERF-03 | NFR-PERF-3: Matching algorithm at 500 candidates | Run `POST /match/castings/{id}/compute` against a seeded casting call with exactly 500 eligible candidates | Completes and returns ranked results within 5 seconds |
| TC-PERF-04 | NFR-PERF-4: Standard CRUD response time | Automated timing of representative CRUD calls (profile update, casting create, application submit) under normal load | 95th percentile ≤ 1 second |

### 10.2 Reliability & Availability Testing

| ID | Requirement | Test Method | Pass Criterion |
|---|---|---|---|
| TC-REL-01 | NFR-REL-1: Graceful error handling | Submit malformed JSON, missing required headers, and unexpected data types to multiple endpoints | System returns structured `400`/`422` errors with user-friendly messages; no raw stack traces or internal paths exposed |
| TC-REL-02 | NFR-REL-2: Server-side error logging without leakage | Trigger a deliberate server error (e.g., malformed DB query in a test build) | Error is logged server-side with sufficient diagnostic detail; the client response contains only the generic error envelope |
| TC-REL-03 | NFR-REL-3: Staging/pilot availability | Monitor the `/health` endpoint over the evaluation period using an uptime checker (e.g., a scheduled ping every 5 minutes) | ≥ 99% successful health-check responses over the monitored pilot window |

### 10.3 Scalability & Maintainability Verification

| ID | Requirement | Test Method | Pass Criterion |
|---|---|---|---|
| TC-SCAL-01 | NFR-SCAL-1: Independent horizontal scaling of application layer | Architecture review + staging test of running two backend instances behind the same database | Both instances serve requests correctly with no session-affinity requirement (stateless JWT auth confirmed) |
| TC-SCAL-02 | NFR-SCAL-2: Indexing on search/filter fields | Run `explain()` on MongoDB queries for country/category/age/height filters | Query plans show index usage, not full collection scans, on the seeded dataset |
| TC-MAINT-01 | NFR-MAINT-2: Versioned, documented API contract | Review API Specification versioning scheme (§2.1 of that document) | Confirmed `/api/v1` prefixing strategy is implemented as documented |

### 10.4 Usability Testing (Automated/Heuristic Portion)

| ID | Requirement | Test Method | Pass Criterion |
|---|---|---|---|
| TC-USE-01 | NFR-USE-1: First-time registration without instruction | Observe a first-time participant attempting registration with zero guidance | Participant completes registration and initial profile setup unassisted |
| TC-USE-02 | NFR-USE-3: Core actions reachable within 3 clicks/taps | Click-path audit from each role's dashboard to: register (n/a, pre-dashboard), create/edit profile, search, apply/create casting, message | Each action reachable in ≤ 3 clicks/taps, matching the navigation model in UI/UX Design Document §5 |
| TC-USE-03 | NFR-USE-2: SUS ≥ 68 | Full moderated UAT session, see §13 | Aggregate SUS score ≥ 68 across pilot participants |

### 10.5 Accessibility Testing

| ID | Requirement | Test Method | Pass Criterion |
|---|---|---|---|
| TC-ACC-01 | NFR-ACC-1: Color contrast | Run Axe DevTools automated scan across all 20 screens | Zero critical contrast violations on body text and primary CTAs |
| TC-ACC-02 | Keyboard navigation | Manually tab through each screen's interactive elements, including modals and the portfolio drag-reorder control | All actions reachable and operable via keyboard alone, including the documented "Move up/Move down" fallback for drag-reorder |
| TC-ACC-03 | NFR-ACC-2: Alt text on portfolio media | Attempt to publish a portfolio item without an alt-text/label field | Upload flow enforces the field per UI/UX Design Document §11.6 (P2 target, tested to confirm current implementation status) |

---

## 11. Security Test Plan

Aligned to PRD §13 and NFR-SEC-1 through NFR-SEC-7, informed by OWASP Top 10 categories relevant to this architecture.

| ID | OWASP Category | Test | Pass Criterion |
|---|---|---|---|
| TC-SEC-01 | A01 Broken Access Control | Full RBAC sweep (§9.2, TC-RBAC-01–08) | Zero unauthorized access successes |
| TC-SEC-02 | A02 Cryptographic Failures | Inspect stored passwords, verification documents, and contact fields at rest; inspect network traffic | Passwords bcrypt-hashed; TLS in use on all traffic; sensitive fields encrypted or access-restricted per NFR-SEC-6 |
| TC-SEC-03 | A03 Injection | Submit NoSQL injection payloads (e.g., `{"$gt": ""}` in login fields) and script-tag/XSS payloads in free-text fields (bio, casting description, message content) | Payloads are rejected or safely escaped/sanitized; no query manipulation or script execution occurs |
| TC-SEC-04 | A04 Insecure Design | Review whether verification, messaging-context restriction, and duplicate-application prevention are enforced server-side, not merely UI-hidden | All three confirmed as server-enforced (cross-reference TC-AUTH, TC-MSG-05, TC-APPL-02) |
| TC-SEC-05 | A05 Security Misconfiguration | Check staging/production for exposed debug endpoints, verbose error responses, default credentials | No debug endpoints reachable in staging/production; error responses match TC-REL-01 |
| TC-SEC-06 | A07 Identification & Authentication Failures | Combine TC-AUTH-06 through TC-AUTH-15 | All pass; no bypass of lockout, token expiry, or generic-error requirements found |
| TC-SEC-07 | A08 Software & Data Integrity Failures | Verify uploaded file content is validated against actual MIME type/magic bytes, not just extension (TC-PORT-06), and that dependency versions are pinned/audited (`npm audit`) | File-type spoofing rejected; no high/critical vulnerabilities in `npm audit` at time of security test pass |
| TC-SEC-08 | Automated baseline scan | Run OWASP ZAP baseline scan against the staging deployment | No high-risk alerts unresolved; medium/low alerts triaged and documented with rationale if accepted |
| TC-SEC-09 | File upload — path traversal / malicious filename | Upload a file with a crafted filename (e.g., `../../etc/passwd`, or embedded null bytes) | Filename is sanitized/regenerated server-side (e.g., using a generated storage key rather than the raw client filename); no path traversal occurs |
| TC-SEC-10 | Rate limiting effectiveness | Re-verify TC-AUTH-15 specifically as a brute-force mitigation, using an automated script simulating rapid login attempts | Rate limit engages consistently, not only on the first test run |

---

## 12. Regression Testing Strategy

- A **core regression suite** (automated: all P0 test cases from §9 that can be scripted via Supertest/Cypress, plus the full RBAC sweep from §9.2) runs on every pull request via CI, before merge to `main`.
- A **full regression pass** (all P0 + P1 automated and manual cases) runs before each of the milestone gates in the project roadmap (end of each development sprint, and before the formal Testing & Evaluation phase begins per PRD §14).
- Any defect fix must include a new or updated automated test case that would have caught the defect, added to the regression suite before the fix is considered closed — preventing the same class of bug from silently reappearing.
- The seed dataset (§5.3) is versioned alongside the test suite so regression runs are deterministic and reproducible.

---

## 13. User Acceptance Testing (UAT) Plan

This section operationalizes PRD §15's UAT row and the SUS target in PRD §3.3/NFR-USE-2.

### 13.1 Participants
Minimum one participant per primary persona category (PRD §4): a freelance model, an agency-represented model (if available), an industry professional (brand/director/agency/photographer), a pageant organizer, and the developer acting as admin-role observer. Given the academic pilot constraints (PRD §16), a small purposive sample is acceptable; the limitation is explicitly noted in the thesis evaluation chapter rather than concealed.

### 13.2 Task Script (representative, expand per role as needed)

| Role | Task |
|---|---|
| Model | "Register as a freelance model, complete your profile, upload two portfolio photos, then find and apply to one casting call in your country." |
| Industry Professional | "Create a casting call for a fashion shoot in your country, then view the ranked match results for it." |
| Pageant Organizer | "Create an institutional profile, then publish a contestant recruitment casting call." |
| Admin (developer-observed) | "Review the verification queue and approve the oldest pending request; then check the reports queue for anything requiring action." |

### 13.3 Metrics Captured Per Session
- Task completion (yes / completed with difficulty / no).
- Time on task.
- Number of errors or unexpected paths taken.
- Verbal think-aloud notes (usability friction points, confusing labels, unexpected navigation).
- Post-session System Usability Scale (10-item, 5-point Likert) survey.

### 13.4 Success Criteria
- ≥ 80% task completion rate across all scripted tasks (aligned with PRD §3.3's "≥80% of test casting calls receive ≥1 qualified application" as a related functional-validation benchmark).
- Aggregate SUS score ≥ 68 (NFR-USE-2).
- No participant requires developer intervention to complete registration or profile creation (NFR-USE-1).

### 13.5 Reporting
Findings are compiled into a UAT summary report (task completion table, SUS score with per-item breakdown, prioritized list of usability issues found) and fed back into the UI/UX Design Document as revisions before final submission, per that document's §15.

---

## 14. Defect Management

### 14.1 Defect Lifecycle
`New → Triaged → In Progress → Fixed → Retest → Closed` (or `Reopened` if retest fails). All defects are logged with: description, steps to reproduce, expected vs. actual result, severity, affected module/requirement ID, and environment.

### 14.2 Severity Classification

| Severity | Definition | Example | Exit Impact |
|---|---|---|---|
| **Critical** | System crash, data loss, or a security/RBAC bypass | A Model can access `/admin/verifications` and approve their own profile | Blocks exit criteria (§6.2) unconditionally |
| **High** | Major functional requirement fails entirely | Applying to a casting call returns a 500 error for all users | Blocks exit criteria for the affected module |
| **Medium** | Functional requirement partially works or has a workaround | Match score breakdown tooltip doesn't render, but ranking itself is correct | Must be fixed or explicitly deferred with sign-off before final submission |
| **Low** | Cosmetic, copy, or minor UX inconsistency | A button label doesn't match §12 microcopy standards | May be deferred to a documented backlog |

### 14.3 Triage Cadence
Defects are triaged at the end of each testing session (not batched weekly), given the fast iteration loop of a single-developer academic project — this keeps Critical/High defects from silently accumulating across the compressed Jul–Aug 2026 testing window.

---

## 15. Test Schedule

Aligned to the PRD §14 roadmap; testing is continuous alongside development, not a single phase bolted on at the end.

| Phase | Timeframe | Testing Activity |
|---|---|---|
| Phase 2 — Development (Core Modules) | Mar – Jun 2026 | Unit + integration tests written alongside each module as it is built; CI regression suite established early (Auth/RBAC first, per §8 risk prioritization) |
| Phase 3 — Testing & Evaluation | Jul 2026 | Full system testing (§9) executed against staging; security test plan (§11) executed; performance testing (§10.1) executed |
| Phase 3 — Testing & Evaluation (cont.) | Aug 2026 | UAT sessions (§13) conducted; defects triaged and fixed; full regression pass; accessibility spot-checks (§10.5) |
| Phase 4 — Deployment | Aug – Sep 2026 | Smoke test suite run against the production/pilot deployment; `/health` monitoring (TC-REL-03) begins |
| Phase 5 — Documentation & Submission | Sep – Oct 2026 | Test evidence, defect log, and UAT summary compiled into the thesis evaluation chapter |

---

## 16. Requirement Traceability Matrix

A summary view; the full matrix (every SRS-FR/NFR to every test case ID) is the union of the "Traces To" columns across §9–§11 of this document. This table confirms **coverage completeness** at the feature level — every SRS §3 feature has at least one P0 test case.

| SRS Feature (§3.x) | FR ID Range | Test Suite | P0 Cases | Coverage Status |
|---|---|---|---|---|
| 3.1 Registration & Authentication | SRS-FR-1.1–1.10 | TC-AUTH-01–15 | 11 | ✔ Full |
| 3.2 Role-Based Access Control | SRS-FR-2.1–2.5 | TC-RBAC-01–08 | 8 | ✔ Full |
| 3.3 Profile Management | SRS-FR-3.1–3.7 | TC-PROF-01–08 | 5 | ✔ Full |
| 3.4 Portfolio Management | SRS-FR-4.1–4.7 | TC-PORT-01–10 | 8 | ✔ Full |
| 3.5 Casting Call Management | SRS-FR-5.1–5.7 | TC-CAST-01–09 | 7 | ✔ Full |
| 3.6 Application Management | SRS-FR-6.1–6.6 | TC-APPL-01–08 | 5 | ✔ Full |
| 3.7 Search & Filtering | SRS-FR-7.1–7.5 | TC-SRCH-01–08 | 6 | ✔ Full |
| 3.8 Matching & Recommendation | SRS-FR-8.1–8.5 | TC-MATCH-01–08 | 5 | ✔ Full |
| 3.9 Messaging | SRS-FR-9.1–9.5 | TC-MSG-01–06 | 3 | ✔ Full |
| 3.10 Administration | SRS-FR-10.1–10.6 | TC-ADMIN-01–10 | 6 | ✔ Full |
| 5.1 Performance NFRs | NFR-PERF-1–4 | TC-PERF-01–04 | 4 | ✔ Full |
| 5.2 Security NFRs | NFR-SEC-1–7 | TC-SEC-01–10 | 10 | ✔ Full |
| 5.3 Reliability/Availability NFRs | NFR-REL-1–3 | TC-REL-01–03 | 3 | ✔ Full |
| 5.4 Usability NFRs | NFR-USE-1–3 | TC-USE-01–03 | 3 | ✔ Full |
| 5.5 Scalability/Maintainability NFRs | NFR-SCAL-1–2, NFR-MAINT-1–2 | TC-SCAL-01–02, TC-MAINT-01 | 2 | ✔ Full (NFR-MAINT-1 verified by architecture review, not a runtime test) |
| 5.6 Accessibility NFRs | NFR-ACC-1–2 | TC-ACC-01–03 | 1 | ✔ Full (NFR-ACC-2 explicitly P2 per SRS) |

**Total test cases defined in this document: 106** across functional (74), performance (4), reliability (3), scalability/maintainability (3), usability (3), accessibility (3), and security (10) suites — plus the UAT task script (§13.2).

---

## 17. Test Deliverables

- This Test Plan & QA Strategy document (living document, updated as requirements evolve).
- Automated test suites (Jest/Supertest backend, React Testing Library frontend, Cypress/Playwright E2E) committed to the repository under a `/tests` directory, run via CI.
- Postman collection per API Specification §16, exported and version-controlled alongside the codebase.
- Executed test case results log (pass/fail per TC ID, per test cycle) — can be maintained as a spreadsheet or lightweight tracker export.
- Defect log (per §14) exported at project completion for the thesis evaluation chapter.
- UAT summary report (§13.5), including raw SUS scores and the prioritized usability issue list.
- OWASP ZAP baseline scan report (§11, TC-SEC-08).

---

## 18. Assumptions, Constraints & Open Questions

### 18.1 Assumptions
- The staging environment mirrors the production/pilot stack closely enough (same MongoDB Atlas tier characteristics, same Node.js version) that performance results are representative.
- The seed dataset (§5.3) is maintained and kept in sync as the schema evolves.
- The single-developer project context means testing and development are interleaved rather than handed off between separate teams — this plan is written to still enforce rigor under that constraint via automated CI gates rather than relying purely on manual discipline.

### 18.2 Constraints
- No budget for a licensed load-testing SaaS or a professional third-party penetration test (per PRD §16 academic/prototype constraints) — performance and security testing rely on open-source tooling (k6/JMeter, OWASP ZAP) run by the developer.
- UAT sample size is small (PRD §16), limiting the statistical confidence of the SUS score; this is disclosed as a limitation, not treated as invalidating the result.

### 18.3 Open Questions (for resolution before/during the Testing & Evaluation phase)
1. Will the project have access to real (anonymized/consented) casting or modeling industry data for more realistic performance/matching test datasets, or will all test data remain synthetically generated?
2. What is the exact session-token revocation behavior on logout (client-only discard vs. server-side denylist) — this affects the precise expected result for TC-AUTH-10 and should be confirmed against the final Architecture implementation decision.
3. Should the Critical/High defect exit-criteria bar (§6.2, §14.2) be relaxed for any explicitly out-of-scope-adjacent feature (e.g., FR-20/FR-28 email notifications, marked P1) if development time runs short before the Aug 2026 deadline?

---

*End of Test Plan & QA Strategy.*
