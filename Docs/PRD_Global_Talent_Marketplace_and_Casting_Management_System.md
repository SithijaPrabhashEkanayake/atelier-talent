# Product Requirements Document (PRD)
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Prepared By** | Product/Engineering Team (compiled from research proposal, interim report, and results) |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **Related Source Docs** | Project Proposal, Interim Report (Ch. 1–3), Final Report (Ch. 1–4), Defense Presentation |
| **Last Updated** | 2026-09-08 |

---

## 1. Executive Summary

The global fashion, film, and pageant industries currently rely on fragmented, unverified, and largely manual recruitment channels — social media (Instagram, TikTok, Facebook), informal agency networks, physical auditions, and email. This creates a **trust gap** between talent and recruiters, slows down casting cycles, excludes independent/freelance talent from opportunities, and burdens recruiters with manual verification and administrative overhead.

The **Global Multidimensional Talent Marketplace and Casting Management System** is a secure, centralized, web-based platform that unifies three primary stakeholder groups — **Models/Talent**, **Industry Professionals** (agencies, brands, directors, photographers), and **Pageant Hosts/Organizers** — into a single ecosystem. The platform provides role-based profiles and portfolios, country-partitioned talent discovery, casting call publishing and application workflows, algorithm-assisted search/matching/recommendation, in-platform messaging, and administrative moderation — replacing scattered, unverified, agency- or region-restricted alternatives.

This PRD defines the product vision, target users, functional and non-functional requirements, system architecture, data model, algorithms, release plan, and success metrics required to build, evaluate, and ship the platform, grounded in the requirements already validated through the associated academic research (Design Science Research / DSRM methodology) and prototype implementation.

---

## 2. Problem Statement

### 2.1 General Problem
Despite advances in digital recruitment generally, the fashion, entertainment, and pageant industries still rely on outdated, fragmented recruitment methods. No existing platform provides one secure system where models, recruiters, and pageant organizers can interact with verified identities and structured workflows.

### 2.2 Specific Problems
- No centralized platform integrates models, industry professionals, and pageant organizers.
- Heavy dependence on unverified social media for discovery and outreach.
- Difficulty verifying professional experience, identity, and credentials → fraud risk.
- Freelance/independent talent has limited access to international opportunities (most platforms are agency-restricted or region-specific).
- Manual, time-consuming portfolio review and candidate comparison.
- No dedicated tooling for pageant-specific recruitment (contestant applications, structured tabulation-adjacent workflows).
- Weak or absent role-based access control and secure authentication in existing tools.
- Limited country-specific search/filtering for cross-border scouting.
- Poor handling of large multimedia portfolios (images/video).
- Inconsistent, off-platform communication between recruiters and talent.

### 2.3 Why Now
Rising smartphone penetration, cloud infrastructure, and secure auth standards make a specialized, scalable marketplace technically feasible, while the creative industries' shift toward remote, cross-border casting (post-pandemic production norms, global brand campaigns) increases demand for a trustworthy digital-first alternative to social media recruiting.

---

## 3. Goals and Success Metrics

### 3.1 Product Goals
1. Provide one **centralized, secure platform** connecting freelance/agency talent, recruiters, and pageant organizers globally.
2. **Reduce fraud** and increase trust via verified, role-based profiles.
3. Improve **accessibility and visibility** for independent/freelance talent worldwide.
4. Make **talent discovery and casting** faster, more structured, and more reliable via country-based navigation, filtering, and algorithm-assisted matching.
5. Reduce recruiters' administrative workload (manual portfolio review, ad-hoc communication).

### 3.2 Non-Goals (for current release — see Section 6.2)
- Not a payment/escrow or financial transaction platform.
- Not a legal identity/background-check service.
- Not an AI-driven biometric or facial-recognition scoring engine.
- Not a native mobile app (web-responsive only in this phase).
- Not a digital contract-signing platform.

### 3.3 Success Metrics / KPIs
| Metric | Target (Prototype/MVP phase) | Notes |
|---|---|---|
| Task completion time (recruiter: find + initiate booking of a model in a country) | Reduced vs. manual/social-media baseline | Core usability/performance benchmark from research design |
| Search/filter response time | Acceptable perceived latency (< 2–3s for typical queries) | Validated via performance testing |
| Casting call → application → shortlist completion rate | ≥ 80% of test casting calls receive ≥ 1 qualified application | Functional validation |
| System Usability Scale (SUS) score | ≥ 68 (industry-average threshold) | Per DSRM evaluation stage |
| Role-based access violations in security testing | 0 | Security test pass criterion |
| Registered profiles per role (pilot) | Balanced mix across Models / Industry Professionals / Pageant Hosts | Ecosystem health |
| Verified-profile ratio | Increasing trend over pilot period | Trust indicator |

---

## 4. Target Users and Personas

| Persona | Description | Core Needs |
|---|---|---|
| **Freelance/Independent Model** | Aspiring or working model without agency representation, self-promoting via social media today | Visibility, verified professional profile, access to legitimate global casting calls, protection from fraud |
| **Agency-Represented Model** | Model managed by a modeling agency | Portfolio consolidation, representation status display, access to broader opportunities |
| **Industry Professional — Brand/Director** | Clothing brands, TVC/film/drama directors, fashion show hosts | Fast, filtered talent discovery; ability to publish casting calls; verified candidate credentials |
| **Industry Professional — Agency** | Modeling/talent agency | Manage represented talent, respond to casting calls, credibility signaling |
| **Photographer** | Independent or agency-affiliated photographer | Portfolio presence, discovery by brands/agencies, collaboration visibility |
| **Pageant Organizer/Host** | National/international pageant organizations (e.g., Miss/Mister Sri Lanka) | Publish official contestant recruitment ads, manage applications, institutional profile |
| **System Administrator** | Platform operator | Moderate content, verify profiles, manage disputes/fraud, oversee platform health |

---

## 5. Competitive Landscape

| Platform | Strengths | Gaps vs. This Product |
|---|---|---|
| LinkedIn | Strong professional networking, general job search | Not designed for modeling/casting; no visual portfolio or appearance-based filtering |
| Model Mayhem | Portfolio management, casting notices | Weak workflow automation, no verification, dated UX |
| StarNow | Talent discovery reach | Weak recommendation/filtering, no pageant module |
| Fiverr | Global freelance marketplace | No casting workflow, no portfolio verification |
| Upwork | Secure freelance recruitment | Not suited to entertainment/creative recruitment |

**Gap this product fills:** No competitor integrates models, multi-type industry professionals, *and* pageant organizers in one country-partitioned, verified, casting-workflow-native platform.

---

## 6. Scope

### 6.1 In-Scope (Current Release / Prototype-to-MVP)
- Web-based, responsive platform (desktop + mobile browser).
- Multi-role registration and authentication: Models (freelance/agency), Industry Professionals (brands, directors, agencies, photographers), Pageant Organizers, Administrators.
- Role-specific profile creation and management.
- Portfolio management with image/video upload (multi-media, structured categories: photos, runway videos, commercials, measurements, achievements, experience).
- Social media handle linking (Instagram, TikTok) as supplementary, non-verifying references.
- Country-based navigation and advanced search/filtering (location, age, height, category, experience, skills, portfolio availability).
- Casting call / pageant advertisement creation, publishing, and management.
- Application submission and candidate/application management (shortlisting).
- Algorithm-based talent search, talent-to-casting matching, and recommendation (rule/attribute-based, not ML).
- In-platform messaging between relevant parties.
- Administration panel: user/profile verification, moderation, reporting.
- Role-based access control (RBAC), secure authentication (JWT), encrypted/hashed credentials.

### 6.2 Out-of-Scope (Explicitly Excluded from Current Release)
- Full commercial-scale deployment (this is a prototype/pilot-grade system).
- Advanced AI features: facial recognition, automated visual talent scoring/biometrics.
- Online payments, escrow, or financial transactions.
- Digital contract signing / legally binding e-signatures.
- Formal legal identity verification or background checks (verification is administrative/document-based, not legal-grade).
- Native mobile applications (future work).
- Real-time video interviewing/casting tools.

### 6.3 Geographic and Operational Scope
Designed for **global usage** — not restricted to any single country or region. Country-partitioned data organization is a core UX pattern (users first filter/select a country context, then a role domain). Initial pilot testing/evaluation may be limited to a smaller sample and academic/prototype environment before broader rollout.

---

## 7. User Stories and Key Use Cases

### 7.1 Authentication & Onboarding
- As a new user, I can register selecting my role (Model / Industry Professional / Pageant Organizer) so the platform tailors my profile fields and dashboard.
- As a model, I can indicate whether I am freelance or agency-represented during onboarding.
- As any user, I can log in securely and stay in a session until I explicitly log out or the session expires.
- As an admin, I can review pending registrations and mark profiles/organizations as verified.

### 7.2 Profile & Portfolio Management
- As a model, I can build a profile with personal details, categorized experience, measurements, and representation status.
- As a model, I can upload and organize a multimedia portfolio (photos, runway/commercial videos) with thumbnails auto-generated.
- As a model, I can link my Instagram/TikTok as supplementary presence (clearly labeled as unverified external links).
- As an industry professional, I can present verified credentials (organization/brand identity, role, portfolio of past work).
- As a pageant organizer, I can create an institutional profile (organization name, pageant history, official status).

### 7.3 Casting & Recruitment Workflow
- As an industry professional/organizer, I can publish a casting call or pageant advertisement with structured requirements (country, category, age range, height range, experience, deadline).
- As a model, I can browse/search casting calls filtered by country and category and apply directly.
- As a recruiter, I can view, shortlist, and manage applicants for a given casting call.
- As a recruiter, I can close/archive a casting call once positions are filled.

### 7.4 Search, Matching & Recommendation
- As a recruiter, I can search/filter talent by country, age, height, category, experience, skills, and portfolio completeness.
- As a recruiter, when I publish a casting call, the system surfaces ranked candidate recommendations based on attribute compatibility.
- As a model, I receive recommended casting calls that match my profile attributes.

### 7.5 Communication
- As a recruiter, I can message a shortlisted candidate directly within the platform.
- As a model, I can respond to recruiter messages without leaving the platform.

### 7.6 Administration
- As an admin, I can verify/flag/suspend profiles and organizations.
- As an admin, I can moderate reported casting calls, messages, or portfolio content.
- As an admin, I can view platform-level activity (registrations, casting calls, applications) for oversight.

---

## 8. Functional Requirements

Each requirement is tagged with a priority: **P0** (must-have for MVP), **P1** (important, near-term), **P2** (future enhancement).

### 8.1 Authentication & User Management
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | System shall allow registration with role selection (Model, Industry Professional, Pageant Organizer). | P0 |
| FR-2 | System shall support secure login using hashed credentials (bcrypt) and issue session tokens (JWT). | P0 |
| FR-3 | System shall enforce role-based access control restricting features/data by role. | P0 |
| FR-4 | System shall allow password reset via secure verification flow. | P0 |
| FR-5 | System shall support model sub-type designation: freelance vs. agency-represented. | P0 |
| FR-6 | System shall support admin-initiated verification status per profile/organization. | P0 |
| FR-7 | System shall support multi-factor authentication for sensitive roles (future). | P1 |

### 8.2 Profile & Portfolio Management
| ID | Requirement | Priority |
|---|---|---|
| FR-8 | Models shall be able to create/edit a profile with personal details, category, measurements, and experience history. | P0 |
| FR-9 | Users shall be able to upload images and video to a structured portfolio (categorized: photos, runway, commercial, achievements). | P0 |
| FR-10 | System shall generate thumbnails/previews for uploaded media automatically. | P0 |
| FR-11 | System shall validate uploaded file types/sizes and reject invalid/unsafe files. | P0 |
| FR-12 | Models shall be able to link external social media handles (Instagram, TikTok) as reference-only fields. | P1 |
| FR-13 | Industry professionals shall be able to build an organization/brand profile distinct from individual talent profiles. | P0 |
| FR-14 | Pageant organizers shall be able to build an institutional profile with pageant history. | P0 |

### 8.3 Casting Management
| ID | Requirement | Priority |
|---|---|---|
| FR-15 | Industry professionals/organizers shall be able to create a casting call/pageant advertisement with structured criteria (country, category, age/height range, experience, deadline, description). | P0 |
| FR-16 | System shall list casting calls filterable by country and category for talent users. | P0 |
| FR-17 | Talent users shall be able to submit an application to a casting call with one action. | P0 |
| FR-18 | Recruiters shall be able to view, shortlist, and manage applications per casting call. | P0 |
| FR-19 | Recruiters shall be able to close/archive casting calls. | P0 |
| FR-20 | System shall notify applicants of status changes (shortlisted/rejected/closed). | P1 |

### 8.4 Search, Filtering, Matching & Recommendation
| ID | Requirement | Priority |
|---|---|---|
| FR-21 | System shall provide advanced search/filtering by country, age, height, category, experience, skills, and portfolio availability. | P0 |
| FR-22 | System shall implement a talent-to-casting matching algorithm scoring candidate suitability against casting requirements. | P0 |
| FR-23 | System shall rank and present matched candidates to recruiters in suitability order. | P0 |
| FR-24 | System shall recommend relevant casting calls to talent users based on profile attributes. | P1 |
| FR-25 | Country-first navigation shall partition search results by selected country before further filtering. | P0 |

### 8.5 Communication
| ID | Requirement | Priority |
|---|---|---|
| FR-26 | System shall provide in-platform messaging between recruiters and talent tied to a casting/application context. | P0 |
| FR-27 | System shall persist message history per conversation thread. | P0 |
| FR-28 | System shall notify users of new messages (in-app; email optional, P2). | P1 |

### 8.6 Administration
| ID | Requirement | Priority |
|---|---|---|
| FR-29 | Admins shall be able to view, approve, or reject verification requests. | P0 |
| FR-30 | Admins shall be able to suspend or remove profiles/organizations/casting calls violating policy. | P0 |
| FR-31 | Admins shall be able to view platform activity summaries (users, casting calls, applications). | P1 |
| FR-32 | Admins shall be able to handle reported content/users. | P1 |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | Passwords hashed (bcrypt); JWT-based session auth; RBAC enforced server-side; input validation on all forms; secure file-upload validation (type/size/content scanning); HTTPS-only communication; protection against SQL/NoSQL injection and XSS; encrypted storage of sensitive fields. |
| **Performance** | Search, filter, and matching operations return results within acceptable response time (target: sub-3-second perceived latency for typical queries); media loading optimized via thumbnails and progressive/lazy loading. |
| **Scalability** | Architecture (three-tier, cloud-hosted) must support growth in users, profiles, portfolios, and casting volume without redesign; database and object storage chosen for horizontal scalability. |
| **Reliability** | Consistent uptime for core flows (auth, casting browse/apply, messaging); graceful error handling with user-facing messages. |
| **Availability** | Deployed platform accessible to authorized users on demand; target uptime SLA to be defined for production (e.g., 99.5%). |
| **Usability** | Interface understandable and navigable across all user roles without training; responsive design across desktop and mobile browsers; SUS score target ≥ 68. |
| **Maintainability** | Modular, three-tier architecture with clearly separated concerns (presentation/application/data) enabling independent module updates. |
| **Data Privacy** | User data (contact info, documents) protected; informed consent obtained for data collection; role-appropriate data visibility. |
| **Accessibility** | Reasonable adherence to basic web accessibility practices (semantic HTML, alt text for portfolio media, color contrast) — full WCAG compliance is a future enhancement (P2). |

---

## 10. System Architecture

### 10.1 Architectural Style
**Three-tier web application architecture:**

1. **Presentation Layer (Frontend)** — Renders role-specific UI: profile/portfolio management, casting browsing, search/filter, messaging, admin dashboards.
2. **Application Layer (Backend / Business Logic)** — Handles authentication/authorization, RBAC, profile & portfolio logic, casting workflow, search/filter/matching/recommendation algorithms, messaging, admin operations. Exposed via a RESTful API.
3. **Data Layer** — Persists users, profiles, portfolios, casting calls, applications, messages, verification/admin records; object/cloud storage for media assets.

### 10.2 Recommended Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React.js, HTML5, CSS3, JavaScript, Tailwind CSS or Bootstrap |
| Backend | Node.js, Express.js (RESTful API) |
| Database | MongoDB (primary), with indexing for search performance |
| Media Storage | Cloud object storage (e.g., AWS S3 / Firebase Storage / Google Cloud Storage), optimized for high-resolution image/video streaming |
| Authentication | JWT + bcrypt password hashing |
| Hosting/Deployment | Frontend: Vercel · Backend: Render · Database: MongoDB Atlas |
| Dev Tools | VS Code, Git/GitHub, Postman (API testing) |

### 10.3 Core Modules
1. Authentication & Authorization
2. User Management (multi-role)
3. Profile Management
4. Portfolio Management (media pipeline: upload → validate → transform/thumbnail → store)
5. Casting Management (create → publish → apply → shortlist → close)
6. Search & Filtering
7. Talent Matching & Recommendation Engine
8. Messaging
9. Administration

### 10.4 Design Artifacts to Produce (Engineering Deliverables)
- Use Case Diagram (per role)
- Class Diagram
- Entity–Relationship Diagram (ERD)
- Sequence Diagrams (registration, casting application, matching flow)
- Activity Diagrams (casting lifecycle, verification lifecycle)
- Database Schema
- System Architecture Diagram

---

## 11. Data Model (Core Entities)

| Entity | Key Attributes | Relationships |
|---|---|---|
| **User** | id, email, password_hash, role (model/industry_pro/pageant_org/admin), verification_status, created_at | 1:1 with role-specific profile |
| **ModelProfile** | user_id, name, country, age, height, measurements, category, experience, representation_status (freelance/agency), social_links | 1:N with PortfolioItem, N:M with CastingCall (via Application) |
| **IndustryProfile** | user_id, org_name, org_type (brand/director/agency/photographer), country, verified_credentials | 1:N with CastingCall |
| **PageantOrgProfile** | user_id, org_name, country, pageant_history, verified_status | 1:N with CastingCall |
| **PortfolioItem** | id, model_id, type (photo/video), url, category, uploaded_at, thumbnail_url | N:1 with ModelProfile |
| **CastingCall** | id, creator_id, title, country, category, criteria (age_range, height_range, experience, skills), description, deadline, status (open/closed) | 1:N with Application, N:1 with IndustryProfile/PageantOrgProfile |
| **Application** | id, casting_call_id, model_id, status (submitted/shortlisted/rejected), applied_at | N:1 with CastingCall, N:1 with ModelProfile |
| **Message** | id, thread_id, sender_id, receiver_id, content, sent_at, read_status | N:1 with conversation thread (tied to Application/CastingCall context) |
| **VerificationRecord** | id, user_id, submitted_documents, status, reviewed_by (admin_id), reviewed_at | N:1 with User |
| **AdminActionLog** | id, admin_id, action_type, target_entity, timestamp | N:1 with User (admin) |

*(Full normalized ERD with cardinalities to be produced as a separate engineering artifact per Section 10.4.)*

---

## 12. Algorithm Specifications

### 12.1 Talent Search & Filtering Algorithm
1. Receive recruiter's search criteria (country, age, height, category, experience, skills, portfolio availability).
2. Retrieve candidate talent profiles from the database (scoped first by country).
3. Compare each profile against selected criteria.
4. Exclude profiles failing mandatory (non-optional) conditions.
5. Return the filtered result set.
6. Display results to the recruiter, sorted by relevance/recency.

### 12.2 Talent-to-Casting Matching Algorithm
1. Retrieve the requirements of a casting opportunity (location, age, height, experience, category, skills).
2. Retrieve eligible talent profiles (country/category scoped).
3. Compare each talent's attributes against required attributes.
4. Compute a **suitability score** based on weighted attribute compatibility.
5. Rank candidates by suitability score.
6. Present the top-ranked candidates to the recruiter for review.
> This algorithm is decision-support, not decision-making — final candidate selection remains a human (recruiter) responsibility.

### 12.3 Talent/Opportunity Recommendation
1. Collect relevant profile or casting attributes.
2. Identify matching attribute overlap between talent and open casting calls.
3. Determine compatibility and rank results.
4. Present recommended casting calls to talent users, or recommended candidates to recruiters upon casting-call creation.
> Explicitly a **structured, rule/attribute-based** approach — not a claim of machine-learning or AI-driven personalization in this release.

---

## 13. Security & Trust Considerations

- **Verification model:** Administrative/document-based verification (not legal-grade identity verification) to establish a "verified" badge and reduce (not eliminate) fraudulent-profile risk.
- **RBAC:** Enforced at the API layer, not just UI — every endpoint checks role permissions server-side.
- **Data protection:** Encrypted sensitive fields (contact info, verification documents); HTTPS everywhere; secure session/token handling with expiry.
- **Abuse handling:** Reporting mechanism for suspicious casting calls, messages, or profiles routed to admin review queue.
- **File upload safety:** Type/size validation and malware/content scanning on all media uploads to prevent malicious files.
- **Privacy:** Informed consent at registration; role-based visibility of contact details (e.g., contact info revealed only after mutual application/shortlist context, not in open search).

---

## 14. Release Plan / Roadmap

Aligned to the project's phased development timeline (Nov 2025 – Oct 2026):

| Phase | Timeframe | Deliverables |
|---|---|---|
| **Phase 0 — Requirements Analysis** | Nov 2025 – Jan 2026 | Finalized functional/non-functional requirements, stakeholder validation, competitive analysis |
| **Phase 1 — System Design** | Feb 2026 | Architecture, ERD, use case/class/sequence/activity diagrams, DB schema, UI wireframes |
| **Phase 2 — Development (Core Modules)** | Mar – Jun 2026 | Auth, user/profile/portfolio management, casting management, search/filter, matching engine, messaging, admin panel |
| **Phase 3 — Testing & Evaluation** | Jul – Aug 2026 | Unit, integration, system, security, performance, and User Acceptance Testing; SUS evaluation |
| **Phase 4 — Deployment** | Aug – Sep 2026 | Cloud deployment (Vercel/Render/MongoDB Atlas), pilot rollout |
| **Phase 5 — Documentation & Submission / Handover** | Sep – Oct 2026 | Final documentation, evaluation report, roadmap for post-MVP enhancements |

### Suggested Post-MVP Roadmap (Beyond Academic Scope)
- Native mobile apps (iOS/Android).
- Payment/escrow for paid bookings.
- Legal-grade identity verification integrations.
- Digital contract workflows.
- Expanded AI-assisted matching (with clear disclosure and opt-in).
- Multi-language localization for broader global adoption.

---

## 15. Testing Plan

| Test Type | Focus | Example Cases |
|---|---|---|
| **Unit Testing** | Individual modules (auth, portfolio, casting creation) | Validate registration logic, password hashing, file validation |
| **Integration Testing** | Frontend ↔ backend ↔ database communication | Casting application flow end-to-end |
| **System Testing** | Full platform under realistic conditions | Complete user journey per role |
| **Security Testing** | RBAC enforcement, injection/XSS resistance | Attempt cross-role access, malformed inputs |
| **Performance Testing** | Response times under load | Search/filter and media loading latency |
| **User Acceptance Testing (UAT)** | Real/prospective users (models, recruiters, admins) | Task completion, satisfaction feedback, SUS survey |

**Sample Test Case Matrix:**

| ID | Description | Type | Expected Result |
|---|---|---|---|
| TC-01 | User Registration | Functional | User registered successfully |
| TC-02 | User Login | Functional | User logs in with valid credentials |
| TC-03 | Create Casting Call | Functional | Casting call created |
| TC-04 | Apply for Casting | Functional | Application submitted successfully |
| TC-05 | Search & Filter | Functional | Relevant results displayed |
| TC-06 | Messaging | Functional | Message sent and received |
| TC-07 | Role-Based Access | Security | User can only access role-permitted features |
| TC-08 | File Upload | Functional | File uploaded and thumbnailed successfully |
| TC-09 | System Performance | Performance | Operations complete within acceptable time |
| TC-10 | User Logout | Functional | Session terminated successfully |

---

## 16. Assumptions and Constraints

**Assumptions**
- Users have reliable internet access and basic web-application familiarity.
- Information submitted by users is accurate at point of entry (subject to admin verification).
- Third-party cloud services (hosting, storage) remain available throughout operation.

**Constraints**
- Limited initial development timeframe and resources (academic/prototype-grade budget).
- Prototype implementation, not immediate commercial-scale deployment.
- Limited availability of real-world industry datasets for testing/tuning matching algorithms.
- Evaluation conducted with a relatively small pilot user sample.

---

## 17. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Fraudulent/fake profiles despite verification | Erodes trust, core value prop | Admin review queue, reporting tools, phased rollout of stricter verification |
| Low initial liquidity (too few talent or too few recruiters) | Empty marketplace, poor first impressions | Seed pilot with a defined country/category cohort before global expansion |
| Media storage/bandwidth costs scale with portfolio growth | Cost overrun | Thumbnail-first loading, compressed media pipelines, tiered storage |
| Matching algorithm produces low-quality matches without real-world tuning data | Reduced perceived value | Start with transparent, explainable rule-based scoring; iterate with pilot feedback |
| Security gaps in file upload / auth | Data breach, reputational damage | Mandatory security testing phase before deployment; follow OWASP guidance |
| Scope creep toward payments/legal verification | Delays MVP | Explicit out-of-scope declaration (Section 6.2); defer to post-MVP roadmap |

---

## 18. Open Questions

1. What is the minimum viable "verification" standard for launch — document upload only, or a lightweight manual review workflow with defined SLA?
2. Should country-first navigation be a hard gate (must select country before browsing) or a default filter that can be cleared for global browsing?
3. What is the intended pilot country/market for initial launch and user acquisition?
4. Should messaging support file/media attachments in v1, or text-only initially?
5. What data retention and deletion policy should apply to rejected/removed profiles and portfolios?

---

## 19. References
- Project Proposal — *Design and Development of a Global Multidimensional Talent Marketplace and Casting Management System*, S. Prabath, NSBM Green University, Dec 2025.
- Interim Research Report (Chapters 1–3), A.M.S.P Athapaththu, June 2026.
- Final Report (Chapters 1–4: Introduction, Literature Review, Methodology, Results).
- Defense Presentation Slides — Sandun Prabath.
- Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007). *A Design Science Research Methodology for Information Systems Research.* Journal of Management Information Systems, 24(3), 45–77.
- Davis, F. D. (1989). *Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology.* MIS Quarterly, 13(3), 319–340.
- Sandhu, R., Coyne, E., Feinstein, H., & Youman, C. (1996). *Role-Based Access Control Models.* IEEE Computer, 29(2), 38–47.

---

*End of PRD.*
