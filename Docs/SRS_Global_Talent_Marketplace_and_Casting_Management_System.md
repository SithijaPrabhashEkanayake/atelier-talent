# Software Requirements Specification (SRS)
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Software Requirements Specification (IEEE 830-inspired structure) |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Companion Document** | Product Requirements Document (PRD) v2.0 |
| **Related Source Docs** | Project Proposal, Interim Research Report, Final Report (Ch. 1–4), Defense Presentation |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial SRS derived from PRD v1.0 and thesis chapters 1–4 | Product/Engineering Team |
| 2.0 | 2026-09-08 | Updated companion document references to v2.0 suite; cross-referenced with API Specification v2.0 WebSocket events and refresh-token endpoints; status updated to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the **Global Multidimensional Talent Marketplace and Casting Management System**. It translates the product vision and requirements captured in the PRD into precise, verifiable, and testable statements suitable for system design, implementation, and formal verification/validation (including academic examination and User Acceptance Testing).

This document is intended for:
- The development team (frontend, backend, database engineers)
- QA/testers, who will derive test cases directly from the requirements herein
- The academic supervisor/examiners evaluating the thesis project
- Future maintainers of the system

### 1.2 Scope
The software product is a **web-based, three-tier application** that provides a centralized marketplace connecting three primary stakeholder categories — **Models/Talent**, **Industry Professionals**, and **Pageant Organizers** — with a supporting **Administrator** role. The system will:

- Provide secure multi-role registration and authentication.
- Allow creation and management of role-specific profiles and multimedia portfolios.
- Allow industry professionals and pageant organizers to publish casting calls/advertisements.
- Allow talent users to discover and apply to casting calls via country-partitioned search and filtering.
- Provide algorithm-based talent search, talent-to-casting matching, and recommendation.
- Provide in-platform messaging between relevant parties.
- Provide an administrative panel for verification, moderation, and platform oversight.

The system does **not** include payment processing, legal-grade identity verification, AI/biometric scoring, native mobile applications, or digital contract signing in this release (see Section 2.5, Constraints, and PRD §6.2).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token, used for stateless authentication |
| **CRUD** | Create, Read, Update, Delete |
| **FR** | Functional Requirement |
| **NFR** | Non-Functional Requirement |
| **ERD** | Entity–Relationship Diagram |
| **UAT** | User Acceptance Testing |
| **SUS** | System Usability Scale |
| **Casting Call** | A published opportunity/advertisement created by an Industry Professional or Pageant Organizer describing talent requirements |
| **Portfolio** | A structured collection of a Model's multimedia content (photos, videos) and professional data |
| **Talent User** | A Model (freelance or agency-represented) using the platform to seek opportunities |
| **Recruiter** | Umbrella term for Industry Professionals and Pageant Organizers who post casting calls |
| **Verified Profile** | A profile that has passed administrative document-based review |

### 1.4 References
- Product Requirements Document (PRD) v1.0 — Global Multidimensional Talent Marketplace and Casting Management System
- Project Proposal — S. Prabath, NSBM Green University, Dec 2025
- Interim Research Report (Chapters 1–3), June 2026
- Final Report (Chapters 1–4)
- IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications
- Sandhu, R. et al. (1996). *Role-Based Access Control Models.* IEEE Computer, 29(2), 38–47.
- Davis, F. D. (1989). *Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology.* MIS Quarterly, 13(3), 319–340.

### 1.5 Overview of This Document
Section 2 provides a high-level description of the product, its users, and constraints. Section 3 defines detailed functional requirements organized by module/feature, each independently testable. Section 4 defines external interface requirements. Section 5 defines non-functional requirements. Section 6 covers data requirements. Section 7 lists other requirements (legal, verification, deployment). Appendices contain the data dictionary and requirement traceability matrix.

---

## 2. Overall Description

### 2.1 Product Perspective
The system is a **new, standalone, self-contained web application** — it is not a component of an existing system, though it references and improves upon existing informal channels (social media, agency-only platforms) and general-purpose platforms (LinkedIn, Model Mayhem, StarNow, Fiverr, Upwork) that fail to serve this industry's specialized needs (see PRD §5).

**System Context Diagram (textual description):**

```
                    ┌─────────────────────────────────────┐
                    │         Presentation Layer            │
                    │   (React.js Web Client — Browser)     │
                    └───────────────┬───────────────────────┘
                                    │ REST API (HTTPS/JSON)
                    ┌───────────────▼───────────────────────┐
                    │        Application Layer               │
                    │  (Node.js / Express.js Business Logic) │
                    │  Auth │ RBAC │ Casting │ Search │       │
                    │  Matching │ Messaging │ Admin           │
                    └───────────────┬───────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                                             ▼
   ┌─────────────────────┐                     ┌─────────────────────┐
   │      Data Layer        │                     │   Cloud Media Storage │
   │   (MongoDB Atlas)      │                     │  (S3 / Firebase / GCS)│
   └─────────────────────┘                     └─────────────────────┘
```

### 2.2 Product Functions (Summary)
A high-level summary of major functions (fully detailed in Section 3):

1. Multi-role user registration, authentication, and session management
2. Role-specific profile creation and management
3. Multimedia portfolio management (upload, categorize, preview)
4. Casting call/advertisement creation and lifecycle management
5. Country-partitioned talent search and advanced filtering
6. Algorithm-based talent-to-casting matching and recommendation
7. Application submission and candidate management
8. In-platform messaging
9. Administrative verification and moderation

### 2.3 User Classes and Characteristics

| User Class | Technical Expertise | Frequency of Use | Key Characteristics |
|---|---|---|---|
| **Freelance Model** | Low–Medium | Frequent (profile upkeep, applications) | Needs simple portfolio tools, mobile-friendly browsing |
| **Agency-Represented Model** | Low–Medium | Moderate | May have profile partially managed by agency staff |
| **Industry Professional (Brand/Director/Agency/Photographer)** | Medium | Frequent during active casting periods | Needs efficient search/filter and application management tools |
| **Pageant Organizer** | Low–Medium | Periodic (campaign-based) | Needs institutional profile and structured contestant application handling |
| **Administrator** | High | Ongoing | Needs oversight tools, verification workflows, moderation controls |

### 2.4 Operating Environment
- **Client side:** Modern web browsers (Chrome, Firefox, Safari, Edge — latest two major versions), desktop and mobile viewport support via responsive design.
- **Server side:** Node.js runtime hosted on a cloud platform (e.g., Render); horizontally scalable.
- **Database:** MongoDB Atlas (cloud-managed, multi-region capable).
- **Media storage:** Cloud object storage service with CDN-backed delivery for images/video.
- **Network:** HTTPS required for all client-server communication.

### 2.5 Design and Implementation Constraints
- Must be delivered as a web-based prototype within the academic project timeframe (Nov 2025–Oct 2026).
- Must use the technology stack defined in the PRD (React.js, Node.js/Express.js, MongoDB) unless a documented change is approved.
- Must not implement payment processing, legal identity verification, biometric/facial recognition, or contract e-signature functionality in this release.
- Must operate within the budget/resource constraints of an academic prototype (no dedicated enterprise-grade infrastructure).
- Evaluation limited to a defined pilot sample of users, not full-scale commercial deployment.

### 2.6 Assumptions and Dependencies
- Users have reliable internet access and a basic level of web-application familiarity.
- Third-party cloud services (hosting, storage, database) remain available and within free/low-tier usage limits during prototype evaluation.
- Data submitted by users is assumed accurate at the point of entry, subject to administrative verification.
- The matching/recommendation algorithm depends on sufficiently completed profile and casting-call data to produce meaningful results.

---

## 3. System Features (Detailed Functional Requirements)

Each feature includes: description, priority, and itemized, testable functional requirements (traceable to PRD FR IDs). Priority: **P0** = must-have for MVP, **P1** = important/near-term, **P2** = future enhancement.

### 3.1 Feature: User Registration and Authentication
**Description:** Allows new users to register under one of three primary roles and authenticate securely on return visits.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-1.1 | The system shall present a role-selection step (Model / Industry Professional / Pageant Organizer) during registration. | P0 |
| SRS-FR-1.2 | The system shall require a unique email address and a password meeting minimum complexity rules (min. 8 characters, at least one number and one letter) for registration. | P0 |
| SRS-FR-1.3 | The system shall hash and store passwords using bcrypt; plaintext passwords shall never be persisted or logged. | P0 |
| SRS-FR-1.4 | The system shall issue a JWT upon successful login, valid for a configurable session duration. | P0 |
| SRS-FR-1.5 | The system shall reject login attempts with invalid credentials and return a generic error message (not indicating which field was incorrect). | P0 |
| SRS-FR-1.6 | The system shall allow authenticated users to log out, invalidating the current session token client-side. | P0 |
| SRS-FR-1.7 | The system shall allow users to initiate a password-reset flow via a verified email link. | P0 |
| SRS-FR-1.8 | For Model registrants, the system shall require selection of representation status: "Freelance" or "Agency-Represented." | P0 |
| SRS-FR-1.9 | The system shall support optional multi-factor authentication for user accounts (future enhancement). | P2 |
| SRS-FR-1.10 | The system shall lock an account temporarily after 5 consecutive failed login attempts within 15 minutes. | P1 |

### 3.2 Feature: Role-Based Access Control
**Description:** Ensures each user can only access functionality and data appropriate to their assigned role.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-2.1 | The system shall enforce role permissions at the API layer for every protected endpoint, independent of UI restrictions. | P0 |
| SRS-FR-2.2 | The system shall prevent a Model from accessing casting-call creation functionality. | P0 |
| SRS-FR-2.3 | The system shall prevent an Industry Professional/Pageant Organizer from editing another organization's casting call. | P0 |
| SRS-FR-2.4 | The system shall restrict administrative functionality (verification, moderation, suspension) exclusively to the Administrator role. | P0 |
| SRS-FR-2.5 | The system shall return an HTTP 403 (Forbidden) response, with no data leakage, for unauthorized access attempts. | P0 |

### 3.3 Feature: Profile Management
**Description:** Allows each role to create and maintain a structured profile appropriate to their category.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-3.1 | The system shall allow Models to create/edit: name, country, date of birth (age derived), height, measurements, professional category, experience history, and representation status. | P0 |
| SRS-FR-3.2 | The system shall allow Models to link external social media handles (Instagram, TikTok) as labeled, non-verifying reference fields. | P1 |
| SRS-FR-3.3 | The system shall allow Industry Professionals to create/edit an organization profile: organization name, type (brand/director/agency/photographer), country, and description of prior work. | P0 |
| SRS-FR-3.4 | The system shall allow Pageant Organizers to create/edit an institutional profile: organization name, country, pageant history, and official status declaration. | P0 |
| SRS-FR-3.5 | The system shall validate mandatory profile fields before allowing profile publication (i.e., visibility in search). | P0 |
| SRS-FR-3.6 | The system shall display a "Verified" badge on profiles that have passed administrative review. | P0 |
| SRS-FR-3.7 | The system shall allow users to update their profile at any time, with changes reflected immediately in search/discovery. | P1 |

### 3.4 Feature: Portfolio Management
**Description:** Enables Models to build and manage a structured, multimedia professional portfolio.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-4.1 | The system shall allow Models to upload images (JPEG, PNG, WebP) and videos (MP4) to their portfolio. | P0 |
| SRS-FR-4.2 | The system shall categorize portfolio items (e.g., Photos, Runway Video, Commercial, Achievements). | P0 |
| SRS-FR-4.3 | The system shall validate uploaded file type and enforce a maximum file size limit (e.g., 25MB images / 200MB video, configurable). | P0 |
| SRS-FR-4.4 | The system shall reject uploads that fail type/size validation with a clear error message. | P0 |
| SRS-FR-4.5 | The system shall automatically generate a thumbnail/preview image for each uploaded media item. | P0 |
| SRS-FR-4.6 | The system shall allow Models to delete or reorder portfolio items. | P1 |
| SRS-FR-4.7 | The system shall store media assets in cloud object storage, referencing them by URL in the database (not storing binary media in the primary database). | P0 |

### 3.5 Feature: Casting Call / Advertisement Management
**Description:** Enables Industry Professionals and Pageant Organizers to publish, manage, and close recruitment opportunities.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-5.1 | The system shall allow authorized recruiters to create a casting call with: title, country, category, age range, height range, required experience/skills, description, and application deadline. | P0 |
| SRS-FR-5.2 | The system shall validate that all mandatory casting-call fields are completed before publishing. | P0 |
| SRS-FR-5.3 | The system shall display published casting calls to eligible Talent Users, filterable by country and category. | P0 |
| SRS-FR-5.4 | The system shall allow the creator to edit a casting call prior to its deadline. | P1 |
| SRS-FR-5.5 | The system shall allow the creator to manually close/archive a casting call at any time. | P0 |
| SRS-FR-5.6 | The system shall automatically mark a casting call as "Closed" once its deadline passes. | P1 |
| SRS-FR-5.7 | The system shall prevent applications to a closed or expired casting call. | P0 |

### 3.6 Feature: Application Management
**Description:** Enables Talent Users to apply to casting calls and Recruiters to manage submitted applications.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-6.1 | The system shall allow a Talent User to submit an application to an open casting call with a single confirmed action. | P0 |
| SRS-FR-6.2 | The system shall prevent duplicate applications by the same Talent User to the same casting call. | P0 |
| SRS-FR-6.3 | The system shall allow Recruiters to view a list of applicants per casting call, including profile summary and portfolio link. | P0 |
| SRS-FR-6.4 | The system shall allow Recruiters to update an application's status: Submitted → Shortlisted → Rejected/Accepted. | P0 |
| SRS-FR-6.5 | The system shall notify the applicant (in-app) when their application status changes. | P1 |
| SRS-FR-6.6 | The system shall allow a Talent User to view the status of all their submitted applications in one place. | P0 |

### 3.7 Feature: Search and Filtering
**Description:** Enables Recruiters to discover suitable talent using structured criteria.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-7.1 | The system shall require country selection as the primary scoping filter before displaying talent search results. | P0 |
| SRS-FR-7.2 | The system shall allow filtering by: age range, height range, professional category, experience level, skills, and portfolio completeness. | P0 |
| SRS-FR-7.3 | The system shall exclude profiles that fail to satisfy mandatory (non-optional) filter conditions. | P0 |
| SRS-FR-7.4 | The system shall return filtered search results within an acceptable response time (see NFR-Performance). | P0 |
| SRS-FR-7.5 | The system shall paginate or lazy-load search results to maintain performance with large result sets. | P1 |

### 3.8 Feature: Talent Matching and Recommendation
**Description:** Provides algorithm-assisted candidate ranking and opportunity recommendations (rule/attribute-based, not machine learning).

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-8.1 | The system shall compute a suitability score for each eligible talent profile against a given casting call's requirements. | P0 |
| SRS-FR-8.2 | The system shall rank and present matched candidates to the Recruiter in descending order of suitability score. | P0 |
| SRS-FR-8.3 | The system shall display, for transparency, which attributes contributed to a candidate's match score. | P1 |
| SRS-FR-8.4 | The system shall recommend relevant open casting calls to a Talent User based on their profile attributes. | P1 |
| SRS-FR-8.5 | The system shall not present the matching/recommendation output as a final selection decision; final selection remains a Recruiter action (see SRS-FR-6.4). | P0 |

### 3.9 Feature: Messaging
**Description:** Provides in-platform communication tied to a casting/application context.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-9.1 | The system shall allow a Recruiter to initiate a message thread with an applicant from within the application-management view. | P0 |
| SRS-FR-9.2 | The system shall allow a Talent User to reply to messages received. | P0 |
| SRS-FR-9.3 | The system shall persist message history per conversation thread. | P0 |
| SRS-FR-9.4 | The system shall display an unread-message indicator to the recipient. | P1 |
| SRS-FR-9.5 | The system shall prevent messaging between users with no shared casting/application context (to reduce spam/abuse), at least in the initial release. | P1 |

### 3.10 Feature: Administration
**Description:** Provides platform oversight, verification, and moderation tools.

| ID | Requirement | Priority |
|---|---|---|
| SRS-FR-10.1 | The system shall allow Administrators to review pending verification requests, including submitted documents. | P0 |
| SRS-FR-10.2 | The system shall allow Administrators to approve or reject a verification request, updating the profile's verification status. | P0 |
| SRS-FR-10.3 | The system shall allow Administrators to suspend or remove a profile, organization, or casting call that violates platform policy. | P0 |
| SRS-FR-10.4 | The system shall allow Administrators to view a reported-content queue (flagged profiles, messages, casting calls). | P1 |
| SRS-FR-10.5 | The system shall allow Administrators to view summary platform metrics (total users by role, active casting calls, applications submitted). | P1 |
| SRS-FR-10.6 | The system shall log all administrative actions (who, what, when) for accountability. | P1 |

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Responsive web UI supporting desktop (≥1280px), tablet, and mobile (≥360px) viewports.
- Role-specific dashboards: Talent Dashboard, Recruiter Dashboard, Pageant Organizer Dashboard, Admin Dashboard.
- Consistent design system: shared color palette, typography, and component library across all views (see companion UI/UX Design Document).
- Country-first navigation pattern applied consistently across search, browse, and discovery screens.
- Forms shall provide inline validation feedback (e.g., required field, invalid file type) before submission.

### 4.2 Hardware Interfaces
- No dedicated hardware interfaces; the system is accessed exclusively through standard client devices (desktop, laptop, tablet, smartphone) with a modern web browser.

### 4.3 Software Interfaces
| Interface | Description |
|---|---|
| **Frontend ↔ Backend** | RESTful API over HTTPS, JSON payloads, JWT bearer-token authentication |
| **Backend ↔ Database** | MongoDB driver/ODM (e.g., Mongoose) connection to MongoDB Atlas |
| **Backend ↔ Cloud Storage** | SDK-based integration (e.g., AWS SDK for S3) for media upload/retrieval |
| **Backend ↔ Email Service** | Transactional email API (e.g., SendGrid/Nodemailer) for password reset and notifications |

### 4.4 Communications Interfaces
- All client-server communication shall occur over HTTPS/TLS 1.2+.
- API responses shall use standard HTTP status codes and a consistent JSON error format.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
| ID | Requirement |
|---|---|
| NFR-PERF-1 | Search and filter queries shall return results within 3 seconds under normal load (defined as ≤100 concurrent users in pilot testing). |
| NFR-PERF-2 | Portfolio media shall load progressively (thumbnail-first) to minimize perceived latency. |
| NFR-PERF-3 | The matching algorithm shall compute and return ranked results for a casting call with up to 500 eligible candidates within 5 seconds. |
| NFR-PERF-4 | API response time for standard CRUD operations shall not exceed 1 second under normal load. |

### 5.2 Security Requirements
| ID | Requirement |
|---|---|
| NFR-SEC-1 | All passwords shall be hashed using bcrypt with an appropriate work factor; plaintext passwords shall never be stored. |
| NFR-SEC-2 | All API endpoints requiring authentication shall validate JWT tokens on every request. |
| NFR-SEC-3 | The system shall validate and sanitize all user inputs server-side to prevent injection attacks (SQL/NoSQL injection, XSS). |
| NFR-SEC-4 | The system shall validate uploaded file types/content to prevent malicious file uploads. |
| NFR-SEC-5 | All data in transit shall be encrypted via HTTPS/TLS. |
| NFR-SEC-6 | Sensitive fields (e.g., contact details, verification documents) shall be encrypted at rest or access-restricted at the database level. |
| NFR-SEC-7 | The system shall implement RBAC checks server-side for every protected resource, independent of client-side restrictions. |

### 5.3 Reliability and Availability Requirements
| ID | Requirement |
|---|---|
| NFR-REL-1 | The system shall handle invalid input and unexpected errors gracefully, returning user-friendly error messages without exposing internal system details. |
| NFR-REL-2 | The system shall log server-side errors for diagnostic purposes without exposing stack traces to end users. |
| NFR-REL-3 | The deployed pilot system shall target an availability of at least 99% during the evaluation period. |

### 5.4 Usability Requirements
| ID | Requirement |
|---|---|
| NFR-USE-1 | A first-time user shall be able to complete registration and profile creation without external instruction. |
| NFR-USE-2 | The system shall achieve a System Usability Scale (SUS) score of at least 68 during User Acceptance Testing. |
| NFR-USE-3 | Core actions (register, create profile, search, apply, message) shall each be reachable within 3 clicks/taps from the relevant dashboard. |

### 5.5 Scalability and Maintainability Requirements
| ID | Requirement |
|---|---|
| NFR-SCAL-1 | The system architecture shall support horizontal scaling of the application layer independent of the data layer. |
| NFR-SCAL-2 | Database collections shall be indexed on fields used for search/filter (country, category, age, height) to maintain performance as data volume grows. |
| NFR-MAINT-1 | The codebase shall follow a modular structure with clear separation between presentation, application, and data layers to support independent module updates. |
| NFR-MAINT-2 | The system shall maintain a documented, versioned API contract to prevent breaking changes affecting the frontend. |

### 5.6 Accessibility Requirements
| ID | Requirement |
|---|---|
| NFR-ACC-1 | Interactive UI elements shall meet minimum color-contrast standards for readability. |
| NFR-ACC-2 | Portfolio media shall support alt-text/labels for screen-reader compatibility (P2, future enhancement). |

---

## 6. Data Requirements

### 6.1 Logical Data Model
See PRD §11 for the entity summary. Core entities: **User, ModelProfile, IndustryProfile, PageantOrgProfile, PortfolioItem, CastingCall, Application, Message, VerificationRecord, AdminActionLog.** Full field-level schema and normalized ERD are defined in the companion **Database Design Document**.

### 6.2 Data Retention
- Rejected verification submissions shall be retained for a defined review-audit period, then purged per the platform's data retention policy (to be finalized — see PRD §18, Open Questions).
- Closed/archived casting calls and their associated applications shall remain queryable for historical reference but shall not appear in active search results.

### 6.3 Data Integrity
- All foreign-key-equivalent references (e.g., Application → CastingCall, PortfolioItem → ModelProfile) shall be validated at the application layer to prevent orphaned records.
- Mandatory fields shall be enforced via schema-level validation in addition to frontend validation.

---

## 7. Other Requirements

### 7.1 Legal and Compliance
- Informed consent shall be obtained at registration regarding data collection and usage.
- The system shall clearly disclose that verification is administrative/document-based, not a legal identity or background-check guarantee.

### 7.2 Verification Requirements
- Administrators shall be able to request and review supporting documents for verification (e.g., ID, agency confirmation letter, organizational registration) without the system claiming legal-grade identity assurance.

### 7.3 Deployment Requirements
- The system shall be deployable via the defined cloud stack (Frontend: Vercel; Backend: Render; Database: MongoDB Atlas) with environment-based configuration (development, staging, production).

---

## Appendix A: Requirement Traceability Matrix (Summary)

| PRD Requirement | SRS Requirement(s) |
|---|---|
| PRD FR-1 to FR-7 | SRS-FR-1.1 – SRS-FR-1.10, SRS-FR-2.1 – SRS-FR-2.5 |
| PRD FR-8 to FR-14 | SRS-FR-3.1 – SRS-FR-3.7, SRS-FR-4.1 – SRS-FR-4.7 |
| PRD FR-15 to FR-20 | SRS-FR-5.1 – SRS-FR-5.7, SRS-FR-6.1 – SRS-FR-6.6 |
| PRD FR-21 to FR-25 | SRS-FR-7.1 – SRS-FR-7.5, SRS-FR-8.1 – SRS-FR-8.5 |
| PRD FR-26 to FR-28 | SRS-FR-9.1 – SRS-FR-9.5 |
| PRD FR-29 to FR-32 | SRS-FR-10.1 – SRS-FR-10.6 |

*(Full bidirectional traceability, including test-case mapping, is maintained in the companion Test Plan document.)*

## Appendix B: Data Dictionary (Key Fields)

| Field | Entity | Type | Constraints |
|---|---|---|---|
| email | User | String | Unique, required, valid email format |
| password_hash | User | String | Required, bcrypt hash, never exposed via API |
| role | User | Enum | {model, industry_professional, pageant_organizer, admin} |
| verification_status | User | Enum | {unverified, pending, verified, rejected} |
| representation_status | ModelProfile | Enum | {freelance, agency_represented} |
| country | ModelProfile / IndustryProfile / PageantOrgProfile / CastingCall | String | Required, from a controlled country list |
| category | ModelProfile / CastingCall | String | From a controlled category list |
| status | CastingCall | Enum | {open, closed, expired} |
| status | Application | Enum | {submitted, shortlisted, rejected, accepted} |
| type | PortfolioItem | Enum | {photo, video} |

---

*End of Software Requirements Specification.*
