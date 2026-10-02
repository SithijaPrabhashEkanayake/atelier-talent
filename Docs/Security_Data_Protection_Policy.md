# Security & Data Protection Policy
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Security & Data Protection Policy |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Companion Documents** | PRD v2.0 (§13), SRS v2.0 (NFR-SEC-1 to 7), System Architecture Design Document v2.0 (§7), Database Design Document v2.0, Coding Standards & Git Workflow Guide v2.0, Test Plan & QA Strategy v2.0, API Specification v2.0 |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial policy formalizing PRD §13 and NFR-SEC-1..7 into concrete controls, threat model, and OWASP-aligned checklist | Product/Engineering Team |
| 2.0 | 2026-09-08 | Added refresh-token security controls (token hashing, HTTP-only cookie, rotation on use); updated JWT access token lifetime to 15min; updated Cloudinary-specific media upload security controls; added Socket.io authentication section; updated status to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This document formalizes the security and data protection posture of the Global Multidimensional Talent Marketplace and Casting Management System. It translates the high-level security intentions in the PRD (§13) and the testable non-functional requirements in the SRS (NFR-SEC-1 through NFR-SEC-7) into concrete, implementable controls: authentication and session management, authorization enforcement, data classification and handling, encryption, input/file validation, abuse mitigation, incident response, and an OWASP Top 10–aligned control checklist.

This policy exists so that security is not an afterthought bolted onto individual features but a set of consistently applied rules that every module, endpoint, and schema in the system must satisfy — and so that the security testing chapter of the academic submission has a concrete standard to test against.

### 1.2 Intended Audience
- Backend engineers implementing authentication, authorization, and data-handling logic
- Database engineers applying field-level access restrictions and encryption
- QA engineers designing and executing the security test suite (Test Plan §Security)
- Academic supervisor/examiners evaluating the rigor of the system's security design

### 1.3 Scope
This policy covers the application, database, media storage, and transport layers of the system as defined in the System Architecture Design Document. It does not cover payment processing, legal-grade identity verification, or biometric infrastructure, as these are explicitly out of scope for this release (PRD §6.2, Architecture §2.2).

### 1.4 Relationship to Other Documents
| Document | Relationship |
|---|---|
| PRD §13 (Security & Trust Considerations) | This policy is the detailed expansion of that section |
| SRS NFR-SEC-1 to NFR-SEC-7 | Each control in this policy is traced back to the NFR it satisfies |
| System Architecture Design Document §7 (Security Architecture) | This policy specifies the concrete rules the architecture's security layer must enforce |
| Database Design Document | Field-level classification in §4 of this policy maps directly onto the data dictionary |
| Coding Standards & Git Workflow Guide | Secure coding practices in that guide are restated and expanded here with policy-level authority |
| Test Plan & QA Strategy | The OWASP-aligned checklist in §9 of this policy is the basis for the security test suite |

---

## 2. Security Principles

The system's security design is governed by the following principles, consistently applied across all modules:

| Principle | Application |
|---|---|
| **Server-side enforcement, never client-side trust** | Every authorization, validation, and business rule is enforced on the backend. The frontend may hide UI elements for UX purposes, but this is never treated as a security control. |
| **Least privilege** | Each role (Model, Industry Professional, Pageant Organizer, Admin) is granted only the permissions required for its function. No role has implicit elevated access. |
| **Defense in depth** | No single control is relied upon exclusively — e.g., file upload safety combines MIME allowlisting, size limits, and storage isolation rather than any one alone. |
| **Fail securely** | On error, ambiguity, or failure of a security check, the system denies access and returns a generic error rather than defaulting to permissive behavior. |
| **Data minimization** | Only data necessary for the platform's stated purpose is collected; sensitive contact details are shielded from open visibility by default (PRD §13). |
| **Auditability** | Security-relevant actions (admin decisions, verification status changes, login attempts) are logged for traceability. |
| **Secure by default, not by configuration** | Security controls (HTTPS, password hashing, RBAC middleware) are structurally required by the architecture, not optional flags a developer must remember to enable. |

---

## 3. Authentication and Session Management

### 3.1 Password Handling (NFR-SEC-1)
- Passwords shall never be stored, logged, or transmitted in plaintext at any point after initial submission over HTTPS.
- Passwords shall be hashed server-side using **bcrypt** with a minimum work factor (cost factor) of **10**, re-evaluated periodically as hardware capability increases.
- Password fields shall be excluded from all Mongoose query results by default (`select: false` on the schema field) and only explicitly selected during the login credential-check operation.
- The API shall never return `passwordHash` in any response payload, including admin-facing user-management endpoints.
- Minimum password complexity rules shall be enforced at registration: minimum 8 characters, at least one letter and one number (aligned with SRS-FR-1.x registration requirements).

### 3.2 Authentication Tokens (NFR-SEC-2)
- The system uses stateless **JSON Web Tokens (JWT)** signed with a server-held secret (HMAC SHA-256 minimum).
- JWT payload shall contain only non-sensitive claims: `userId`, `role`, `issuedAt`, `expiresAt`. Email, name, or any profile data shall not be embedded in the token.
- Access tokens shall have a bounded expiry (recommended: 1 hour) to limit the window of misuse if a token is intercepted.
- A refresh-token mechanism (longer-lived, stored securely, single-use rotation recommended) shall be used to obtain new access tokens without requiring re-login, balancing usability against exposure risk.
- Every request to a protected endpoint shall pass through authentication middleware that verifies token signature and expiry before any controller logic executes. Requests with missing, malformed, expired, or invalid-signature tokens are rejected with `401 Unauthorized`.

### 3.3 Session Termination and Token Revocation
- Logout shall invalidate the client-held token by instructing the client to discard it; because JWTs are stateless, true server-side revocation before natural expiry requires either a short access-token lifetime (primary mitigation) or a maintained denylist of revoked token IDs (recommended enhancement if the short-expiry approach alone is judged insufficient during implementation — this is flagged as an open decision in the Test Plan §18.3 and must be resolved before the corresponding auth test case is finalized).
- Refresh tokens shall be revocable server-side (e.g., stored by ID and marked invalid on logout or detected compromise), since they are longer-lived and represent greater risk if reused after logout.

### 3.4 Brute-Force and Credential-Stuffing Mitigation
- Login and registration endpoints shall be rate-limited per IP address and per account identifier (e.g., a sliding window such as 10 attempts per 15 minutes).
- After a defined number of consecutive failed login attempts (SRS-FR-1.10), the account shall be temporarily locked with a cooldown period, and the failure shall be logged for monitoring.
- Generic error messages ("Invalid email or password") shall be returned on failed login rather than differentiating "email not found" from "wrong password," to avoid account enumeration.

---

## 4. Data Classification and Handling

### 4.1 Classification Scheme
All data stored by the system is classified into one of four sensitivity tiers, each with a defined handling rule:

| Tier | Definition | Examples | Handling Rule |
|---|---|---|---|
| **Tier 0 — Public** | Data intended for open discovery/search | Published model category, country, height range, public portfolio media, casting call description | No access restriction; served directly through search/discovery endpoints |
| **Tier 1 — Restricted-Internal** | Visible to authenticated platform users under context rules, not to anonymous visitors | Full profile detail behind login, application history, message content | Requires authentication; visibility further scoped by role and relationship context (see §4.3) |
| **Tier 2 — Sensitive** | Personal data requiring active protection | Email address, phone/contact details, date of birth, verification documents | Encrypted at rest and/or access-restricted at the database level; never included in public/search API responses |
| **Tier 3 — Credentials/Secrets** | Data whose exposure directly compromises account or system security | Password hash, JWT signing secret, third-party API keys, cloud storage credentials | Never logged, never returned in any API response, stored using the strongest available protection (bcrypt hash for passwords; environment-managed secrets, never committed to source control, for system credentials) |

### 4.2 Field-Level Classification (Representative Mapping to Database Design Document §9)

| Collection.Field | Tier | Rationale |
|---|---|---|
| `users.email` | Tier 2 | Personal identifier; login credential |
| `users.passwordHash` | Tier 3 | Credential material |
| `users.role`, `verificationStatus`, `isActive` | Tier 1 | Needed for platform function; not sensitive personal data but not public either |
| `model_profiles.country`, `category`, `heightCm` | Tier 0 | Core search/discovery attributes, intentionally public once profile is published |
| `model_profiles.dateOfBirth` | Tier 2 | Used to derive public "age" attribute at query time; raw DOB itself never exposed |
| `*_profiles` direct contact fields (phone, personal email, if modeled separately from `users.email`) | Tier 2 | Contact details revealed only after mutual application/shortlist context, per PRD §13 |
| `portfolio_items.mediaUrl` / `thumbnailUrl` | Tier 0 | Public once profile is published; storage URLs are not treated as secrets but access is via signed/expiring URLs where the storage provider supports it |
| `verification_records.*` (including any document reference) | Tier 2 | Verification documents are handled as sensitive personal data, access-restricted to the Admin role only |
| `messages.*` | Tier 1 | Visible only to the two parties on the thread |
| `admin_action_logs.*` | Tier 1 | Internal accountability record; Admin-only visibility |

### 4.3 Contextual Visibility Rules (PRD §13 — Privacy)
- Contact details are **not** included in open search or public profile views under any circumstance.
- Contact details become visible to a counterpart only after a defined relationship context is established — e.g., an Industry Professional/Pageant Organizer gains visibility of a Model's contact information only once that Model has been shortlisted or accepted on a specific casting call (exact gating point is confirmed against SRS-FR-x application-lifecycle requirements at implementation time).
- Messaging is scoped to `message_threads` tied to a specific `applicationId`; no platform-wide direct-messaging capability exists that would bypass the application-context gate.
- Verification documents (Tier 2) are visible only to the Admin role performing verification review and are never exposed through any Model/Industry/Organizer-facing endpoint.

### 4.4 Encryption at Rest
- MongoDB Atlas encryption-at-rest (provider-managed, AES-256) shall be enabled at the cluster level as the baseline protection for all stored data (NFR-SEC-6).
- For Tier 2 fields identified in §4.2 that warrant protection beyond cluster-level encryption (e.g., a raw contact phone number, if stored as a discrete field), **application-level field encryption** shall be applied before persistence, using a server-held encryption key (AES-256-GCM or equivalent), decrypted only when returned through an endpoint that has already passed the contextual visibility check in §4.3.
- Encryption keys and JWT signing secrets shall be stored as environment variables injected at deploy time (Render/hosting provider secret management), never committed to source control, consistent with the Coding Standards & Git Workflow Guide's `.env` exclusion rule.

### 4.5 Encryption in Transit (NFR-SEC-5)
- HTTPS/TLS shall be enforced for all client-server communication, with no HTTP fallback in any deployed environment (development, staging, production).
- The hosting platforms specified in the Architecture Document (Vercel, Render) provide managed TLS termination by default; this shall be verified, not assumed, during deployment configuration.
- HTTP Strict Transport Security (HSTS) headers shall be set on all API responses to instruct browsers to prefer HTTPS on subsequent requests.

---

## 5. Authorization and Access Control (NFR-SEC-7)

### 5.1 Role-Based Access Control (RBAC) Model
The system defines four roles, consistent with the SRS and Database Design Document:

| Role | Core Permissions |
|---|---|
| **Model** | Manage own profile/portfolio, browse/apply to casting calls, message within own application threads, view own application status |
| **Industry Professional** | Manage own profile, create/manage own casting calls, view applicants to own casting calls, use search/matching on published Model profiles, message within own application threads |
| **Pageant Organizer** | Same category of permissions as Industry Professional, scoped to pageant-specific casting calls |
| **Admin** | Manage verification queue, review reported content, view/manage all users (moderation actions only, not arbitrary profile editing), view audit logs |

### 5.2 Enforcement Rules
- Every route that is not explicitly public (e.g., login, registration, published-profile search) shall pass through an authorization middleware layer that checks the authenticated user's role against the route's required permission set, **before** any controller logic executes.
- Ownership checks are enforced in addition to role checks where relevant — e.g., an Industry Professional may edit only casting calls where `creatorProfileId` matches their own profile ID, not any casting call of that type. Role membership alone is never sufficient for record-level mutation endpoints.
- Authorization logic shall be centralized (shared middleware/utility functions), not re-implemented ad hoc per route, to avoid inconsistent enforcement — consistent with the Architecture Document's stated principle that RBAC is applied at the architecture level, not bolted on per feature.
- Client-side role-based UI hiding (e.g., not rendering an "Edit" button) is a UX convenience only. The corresponding API endpoint independently re-verifies authorization; the frontend is never a trust boundary.

### 5.3 Privilege Escalation Prevention
- A user's `role` field is set at registration and modifiable only by an Admin through a dedicated, logged admin action — never through a self-service profile-update endpoint.
- JWT claims carrying `role` are set server-side at token issuance and are not derived from any client-supplied field on subsequent requests.

---

## 6. Input Validation and Injection Prevention (NFR-SEC-3)

### 6.1 Server-Side Validation
- All incoming request data (body, query parameters, path parameters) shall be validated against an explicit schema (e.g., Joi or Zod, per Architecture §7.3) before reaching business logic. Requests failing validation are rejected with `400 Bad Request` and a structured error response; they are never partially processed.
- Client-side validation may improve UX but is never treated as a security control — every validation rule enforced in the React frontend has a corresponding server-side rule.

### 6.2 NoSQL Injection Prevention
- All database queries shall be constructed via Mongoose's parameterized query builders. Raw string concatenation into query objects, and unsanitized use of user input as MongoDB query operators (e.g., a user-supplied object containing `$where` or `$gt`), are prohibited.
- Request bodies shall be sanitized to strip or reject keys beginning with `$` or containing `.` before being passed to any Mongoose query, closing the common NoSQL-injection vector where a client sends an object instead of an expected primitive value.

### 6.3 Cross-Site Scripting (XSS) Prevention
- React's default JSX escaping is relied upon for rendering user-generated content (profile bios, casting descriptions, messages); use of `dangerouslySetInnerHTML` is prohibited unless content passes through an explicit sanitization library, and any such use requires justification recorded in code review.
- A Content-Security-Policy (CSP) header shall be set on API/application responses to restrict script sources as a defense-in-depth measure.
- User-generated text fields are stored as-is (not pre-escaped in the database) with escaping applied at render time, consistent with standard React practice, so that data remains portable and correctly escaped regardless of rendering context.

### 6.4 Output Handling
- API error responses never include stack traces, raw database error messages, or internal file paths in production. The centralized error-handling middleware (Architecture §9.1) maps internal errors to generic `500` responses while logging full detail server-side only.

---

## 7. File Upload Security (NFR-SEC-4)

### 7.1 Upload Validation Pipeline
Every media upload (portfolio photos/videos, verification documents) shall pass through the following checks, in order, before persistence:

1. **Authentication & authorization check** — uploader must be authenticated and own the profile/context the file is being attached to.
2. **File size limit** — enforced both client-side (UX) and server-side (authoritative); oversized requests are rejected before the full payload is read into memory where feasible (streamed validation).
3. **MIME-type allowlisting** — only explicitly permitted types are accepted (e.g., `image/jpeg`, `image/png`, `image/webp` for photos; a defined video codec/container allowlist for video). Validation checks actual file content signature (magic bytes), not merely the client-supplied `Content-Type` header or file extension, since both are trivially spoofable.
4. **Filename sanitization** — original filenames are never used directly as storage keys; a generated identifier (e.g., UUID) is used instead to prevent path traversal and collision.
5. **Malware/content scanning** (recommended for pilot/production) — files are scanned before being made publicly retrievable, or at minimum before being marked "published"/visible.

### 7.2 Storage Isolation
- Media files are stored in cloud object storage (S3/Firebase/GCS per Architecture §10), never on the application server's local filesystem or embedded as binary in MongoDB, isolating a compromised or malformed file from the application runtime.
- Verification documents (Tier 2) are stored in a storage location/bucket-path separated from public portfolio media, with access permissions restricted so only the Admin-facing verification endpoint can generate retrieval URLs for them.

---

## 8. Abuse, Fraud, and Content Moderation

### 8.1 Verification Workflow Integrity
- The "Verified" badge is granted only through the administrative verification workflow (document submission → Admin review → status update in `verification_records`), never through a self-service toggle.
- Verification decisions are logged with the reviewing Admin's ID, decision, and timestamp for accountability (`verification_records`, `admin_action_logs`).
- The system communicates verification as an administrative trust signal, not a legal identity guarantee, consistent with PRD §13's explicit scope boundary — this framing shall also be reflected in user-facing copy (UI/UX Design Document) so users do not over-rely on the badge.

### 8.2 Reporting and Moderation Queue
- Users may report profiles, casting calls, or messages; reports are written to the `reports` collection with `targetEntityType`, `targetEntityId`, and `status`, and routed to the Admin moderation queue.
- Reported content is not automatically hidden pending review (to avoid abuse of the reporting mechanism as a takedown tool) unless a report volume/severity threshold is met, at which point automatic temporary hiding pending review is applied.
- All admin moderation actions (content removal, account suspension, verification rejection) are written to `admin_action_logs` with sufficient detail to reconstruct the decision later.

### 8.3 Scraping and Enumeration Mitigation
- Search and profile-listing endpoints are rate-limited per IP/account and enforce server-side pagination limits, preventing bulk extraction of the full talent database in a small number of requests (Architecture §7.5).
- Sequential, predictable resource identifiers are not relied upon as an access control — MongoDB ObjectIds are used, and authorization checks (not obscurity of the ID) are the actual control against unauthorized access to a specific record.

---

## 9. OWASP Top 10 (2021) Alignment Checklist

This checklist maps each OWASP Top 10 category to the specific control in this policy and is the basis for the security test cases in the Test Plan & QA Strategy.

| OWASP Category | System Control | Policy Reference |
|---|---|---|
| A01: Broken Access Control | Server-side RBAC + ownership checks on every protected route; role never trusted from client input | §5 |
| A02: Cryptographic Failures | bcrypt password hashing; TLS everywhere; field-level encryption for Tier 2 data; secrets never committed to source control | §3.1, §4.4, §4.5 |
| A03: Injection | Parameterized Mongoose queries; request-key sanitization against operator injection; schema validation on all input | §6.2 |
| A04: Insecure Design | Threat model (Architecture §7.5) and this policy produced during design phase, not retrofitted post-implementation | Whole document |
| A05: Security Misconfiguration | HTTPS-only deployment, HSTS, CSP headers, generic error responses hiding internals, environment-managed secrets | §4.5, §6.4 |
| A06: Vulnerable and Outdated Components | Dependency versions pinned and periodically reviewed (Coding Standards §Dependency Management); no unmaintained packages introduced without review | External: Coding Standards Guide |
| A07: Identification and Authentication Failures | Bounded JWT expiry, refresh-token rotation, rate-limited login, account lockout, generic auth error messages | §3 |
| A08: Software and Data Integrity Failures | File-upload content-signature validation; CI pipeline (Coding Standards §CI/CD) runs tests before merge; no unsigned/unverified third-party script inclusion in production build | §7.1, External: Coding Standards Guide |
| A09: Security Logging and Monitoring Failures | Structured logging excluding sensitive data (Architecture §9.2); admin action log; failed-login logging | §3.4, §8.2 |
| A10: Server-Side Request Forgery (SSRF) | No user-supplied URLs are fetched server-side by the application in this release's feature set (no URL-preview/webhook functionality); flagged as a control to re-evaluate if such a feature is added post-MVP | N/A for current scope |

---

## 10. Privacy and Informed Consent

- At registration, users are presented with a summary of what data is collected, why, and how contact details are shielded from open visibility (PRD §13), and must provide affirmative consent before an account is created.
- Users may request account deactivation; deactivation sets `isActive = false` and removes the profile from public search/discovery, while retaining underlying records for a defined retention period (see Database Design Document §10) to satisfy any pending application/casting obligations and academic evaluation audit needs.
- A full data-deletion request (beyond deactivation) is handled as an Admin-mediated process for this academic-prototype release rather than a fully automated self-service flow, given the limited scope and timeline (PRD §16); this is noted as a post-MVP enhancement area (Architecture §12) if the system moves toward production/public deployment, where full compliance with a specific data-protection regulation would need dedicated legal review beyond this project's academic scope.

---

## 11. Incident Response (Pilot-Scale Procedure)

Given the academic prototype/pilot scope, a lightweight incident response procedure is defined rather than a full enterprise runbook:

| Step | Action |
|---|---|
| 1. Detect | Identify the issue via monitoring/logs (Architecture §9.3), a user report, or a failed security test case |
| 2. Contain | Where credentials are suspected compromised, rotate the affected secret (JWT signing key, storage credentials) and force re-authentication; where a specific account is compromised, suspend it (`isActive = false`) |
| 3. Assess | Determine scope: which data tier (§4.1) was potentially exposed, and to whom |
| 4. Remediate | Patch the underlying cause (e.g., a missed authorization check) and add a regression test case to the Test Plan |
| 5. Record | Log the incident, root cause, and remediation in a simple incident log, to be referenced in the project's evaluation/documentation chapter |
| 6. Disclose (if applicable) | For a pilot with real user data, affected users are informed of the nature of the exposure and remediation taken, consistent with the informed-consent principle in §10 |

---

## 12. Compliance and Documentation Notes for Academic Submission

- This policy, together with the Architecture Document §7 and the Test Plan's security test suite, is intended to satisfy the security-analysis expectations typically required in a final-year software engineering evaluation chapter.
- Security testing results (penetration-style manual checks against §9's checklist) should be documented with evidence (request/response pairs, screenshots) in the evaluation chapter, referencing the specific control and OWASP category being validated.
- Any deviation from a control in this policy that occurs due to implementation time constraints (PRD §16) should be explicitly recorded as a known limitation in the final report rather than silently omitted, so the gap between designed and implemented security posture is transparent to examiners.

---

*End of Security & Data Protection Policy.*
