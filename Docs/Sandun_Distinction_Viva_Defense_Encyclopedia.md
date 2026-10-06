# ATELIER Talent — Viva Voce Defence Encyclopedia

**Candidate:** Sandun Prabath (A.M.S.P Athapaththu)
**Index number:** 28607
**Programme:** BSc (Hons) in Software Engineering
**Institution:** Faculty of Computing, NSBM Green University, Sri Lanka
**Supervisor:** Ms. Lakni Peiris
**Project title:** Global Multidimensional Talent Marketplace and Casting Management System
**Product name:** ATELIER Talent
**Live system:** https://atelier-talent.onrender.com
**Source code:** https://github.com/SithijaPrabhashEkanayake/atelier-talent

---

## How to Use This Document

This is the single reference for the defence. Every claim here was checked against the source code, the test suite or the project's engineering documents, and each section names where its evidence lives. Where the system does not do something, this document says so, because examiners respond well to a candidate who knows the boundaries of their own work.

| Section | What it covers |
|---|---|
| 1 | Problem, aim and contribution |
| 2 | Scope, users and out-of-scope items |
| 3 | Research method and theoretical grounding |
| 4 | Architecture and key design decisions |
| 5 | Data model |
| 6 | API and real-time contract |
| 7 | Features, page by page |
| 8 | The matching engine |
| 9 | Security |
| 10 | Testing and quality evidence |
| 11 | Deployment and operations |
| 12 | Limitations, disclosed honestly |
| 13 | 15-minute demonstration script |
| 14 | Examiner questions and answers |
| 15 | Revision history of the final build |

---

## 1. Problem, Aim and Contribution

### 1.1 The problem
Fashion, commercial and pageant recruitment still runs largely on unverified social-media messages. Four failures follow from that:
1. **Trust gap.** Portfolios and physical measurements cannot be checked before a booking.
2. **Agency gatekeeping.** Independent talent, especially outside major cities, has little access to casting work.
3. **Opaque shortlisting.** Recruiters have no consistent, explainable way to compare candidates.
4. **Administrative load.** Casting calls, applications and portfolios are tracked in email threads and spreadsheets.

### 1.2 The aim
One role-based web platform in which models, recruiters and pageant organisers publish and verify profiles and casting calls, apply and shortlist, communicate in-app, and see transparent reasons for every candidate ranking.

### 1.3 Contribution
- A working full-stack system covering four user roles and their workflows.
- A deterministic, explainable matching model in which every score can be traced to a stored field and a stated weight.
- A documented security model: in-memory access tokens, rotating refresh tokens, double-submit CSRF protection and server-side role checks.
- A reproducible evaluation: automated tests, a UAT matrix and a live deployment.

---

## 2. Scope, Users and Boundaries

### 2.1 Users
| Role | Who | Main capabilities |
|---|---|---|
| Model (`model`) | Runway, editorial and commercial talent | Maintain a profile and portfolio, browse casting calls, apply, chat with accepted recruiters |
| Industry professional (`industry_professional`) | Agencies, brands, directors, photographers | Publish and close casting calls, review and move applicants through the pipeline, search the talent directory, compare profiles |
| Pageant organiser (`pageant_organizer`) | Pageant franchises and fashion-week organisers | As for industry professionals, for pageant-style castings |
| Administrator (`admin`) | Platform operators | Suspend and reactivate users, remove and restore casting calls, review reports, view the action log and analytics |

Admin accounts cannot be created through public registration. Registration only accepts the three non-admin roles.

### 2.2 In scope
Registration and login, password reset, role-specific profiles, portfolio upload and ordering, casting calls, applications and status pipeline, talent directory with filters, explainable match scoring, in-app chat, notifications, reporting and moderation, and admin analytics.

### 2.3 Out of scope (by design)
Payments and escrow, legal-grade identity verification, facial recognition, machine-learning scoring, native mobile applications, e-signatures and Sinhala or Tamil localisation. These are listed again in Section 12 with reasons.

---

## 3. Research Method and Theoretical Grounding

### 3.1 Method
The project follows **Design Science Research** (Peffers et al., 2007). The artefact was designed, built and evaluated in iterative sprints. Engineering evidence is in `Docs/`: requirements (SRS), architecture (SADD), data design (DDD), API specification, security policy, test plan, UAT report, sprint backlog and risk register.

### 3.2 Theory used in the design
- **Two-sided platform economics** (Eisenmann, Parker and Van Alstyne, 2006). Free portfolio hosting attracts talent; the talent directory and casting tools attract recruiters.
- **Signalling under information asymmetry** (Spence, 1973). Standardised measurements, verification flags and recorded experience reduce the risk of a booking.
- **Explainable, rule-based scoring** (Mittelstadt et al., 2016). The matcher is a fixed weighted rubric rather than a learned model, so each decision can be inspected and contested.

---

## 4. Architecture and Key Decisions

### 4.1 Structure
A **modular monolith**: one Node.js service that serves the REST API, the real-time socket layer and the compiled React application.

| Layer | Technology |
|---|---|
| Front end | React 19, React Router 7, Vite, Tailwind CSS v4, Framer Motion, Zustand, Recharts, Socket.io client |
| API | Node.js, Express 5, Helmet, cookie-parser, Multer with Cloudinary storage |
| Real time | Socket.io 4 with authenticated sockets |
| Data | MongoDB (Atlas in production), Mongoose 9 |
| Media | Cloudinary for portfolio uploads |
| Tests | Jest and Supertest against an in-memory MongoDB |
| Hosting | Render (single web service), with a Docker alternative in the repository |

### 4.2 Decisions and why
1. **Monolith rather than microservices.** One deployable unit, one database and no network hops between domains. For a team of one and a pilot-scale product, this removes operational risk without limiting the domain separation, which is kept in folders (`controllers`, `models`, `services`, `sockets`).
2. **MongoDB rather than a relational database.** Role profiles have different shapes (measurements for models, organisation details for recruiters, pageant history for organisers). Document collections fit that polymorphism without joins across many tables.
3. **Tokens in memory, refresh in an HTTP-only cookie.** The access token (15 minutes) lives only in JavaScript memory, so a script injected by an attacker cannot read it from storage. The refresh token (7 days) is in an HTTP-only, `SameSite=Strict` cookie and is stored hashed, rotated on every use.
4. **Single origin in production.** Express serves both the API and the built front end. A `SameSite=Strict` cookie and double-submit CSRF protection both assume one origin.
5. **Cloudinary for media.** Binary images in the database would be slow to query and would hit MongoDB's 16 MB document limit. Cloudinary serves media from a CDN.
6. **Deterministic matching in-process.** Scores are computed on the server from stored fields, so they can be reproduced exactly and explained to a candidate.

---

## 5. Data Model

Twelve Mongoose models in `backend/models/`.

| Model | Purpose | Key fields |
|---|---|---|
| `User` | Login account | `email` (unique, lower-cased), `password` (bcrypt, never returned by default), `role`, `status` (`Active`, `Suspended`, `Pending`), password-reset hash and expiry |
| `ModelProfile` | Talent profile | `userId` (unique), `fullName`, `country`, `dateOfBirth`, `heightCm`, `measurements` (bust, waist, hips), `category` (runway, editorial, commercial, pageant), `representationStatus` (`freelance`, `agency_represented`), `agencyName`, `experience[]`, `skills[]`, `socialLinks`, `isPublished`, `isVerified` |
| `IndustryProfile` | Recruiter organisation | `organizationName`, `organizationType` (brand, director, agency, photographer), `country`, `description`, `website`, `isPublished`, `isVerified` |
| `PageantOrgProfile` | Pageant organiser | `organizationName`, `country`, `pageantHistory[]` (name, year, description), `officialStatus`, `isPublished`, `isVerified` |
| `PortfolioItem` | Media on a profile | `modelProfileId`, `type` (photo, video), `category`, `mediaUrl`, `thumbnailUrl`, `publicId`, `fileSizeBytes`, `sortOrder` |
| `CastingCall` | Opportunity | `creatorProfileId`, `creatorType`, `title`, `country`, `category`, `criteria` (age range, height range, experience level, required skills), `description`, `applicationDeadline`, `status` (open, closed, expired), `isRemovedByAdmin` |
| `Application` | Model applying to a casting | `castingCallId`, `modelProfileId`, `status` (submitted, shortlisted, rejected, accepted), `statusUpdatedAt`, `appliedAt` |
| `Message` | Chat message | `applicationId`, `senderId`, `content`, `read` |
| `Notification` | In-app notification | `userId`, `type` (application_update, system_alert, casting_update, match_alert, message_alert), `message`, `link`, `read` |
| `Report` | Community report | `reporterId`, `targetType` (user, casting_call, profile), `targetId`, `reason`, `status` (open, reviewed, dismissed) |
| `AdminActionLog` | Audit trail | `adminId`, `action`, `targetType`, `targetId`, `metadata` |
| `RefreshToken` | Session refresh | `user`, hashed `token`, `expires`, `revoked`, `replacedByToken` |

**Integrity rules enforced in the database layer**
- One application per model per casting call (a unique compound index).
- One profile per user for each role-profile model.
- Refresh tokens are stored as SHA-256 hashes; the plain token exists only in the cookie.

---

## 6. API and Real-Time Contract

All routes are under `/api`. Routes marked **P** require a valid access token. Routes marked **R** also check the caller's role.

### 6.1 Authentication (`/api/auth`)
- `POST /register`, `POST /login`, `POST /refresh`, `GET /logout`, `GET /me` (P)
- `POST /forgot-password`, `POST /reset-password/:token`

### 6.2 Profiles and portfolio (`/api/profiles`, `/api/portfolio`)
- `GET /showcase` — public featured talent for the homepage
- `GET /me`, `PUT /me` (P) — own profile
- `GET /:id` (P) — profile by id
- `POST /upload` (P, model) — upload to Cloudinary
- `GET /:profileId` (P), `PATCH /:itemId/reorder` (P, model), `DELETE /:itemId` (P, model)

### 6.3 Casting calls and applications (`/api/castings`, `/api/applications`)
- `GET /` and `GET /:id` (P) — list and detail
- `POST /`, `PUT /:id`, `PATCH /:id/close` (P, R: industry or pageant organiser)
- `GET /:id/applicants` and `GET /:id/recommendations` (P, R: owning organiser)
- `POST /` (P, model) — apply
- `GET /me` (P, model) — own applications
- `PATCH` status routes for the pipeline (P, R: owning organiser)

### 6.4 Search and matching (`/api/search`, `/api/match`)
- `GET /api/search/talent` (P, R: industry, pageant organiser or admin). Filters: `country`, `category`, `minAge`, `maxAge`, `minHeightCm`, `maxHeightCm`, `experienceLevel`, `skills`. Paginated. Sri Lankan records are ranked first.
- `GET /api/match/...` (P) — scored recommendations for a model or casting.

### 6.5 Messaging and notifications
- `GET /api/messages/:applicationId` (P) — thread history for an application both parties may see.
- `GET /api/notifications/me`, `PATCH /:id/read`, `PATCH /read-all` (P).

### 6.6 Administration (`/api/admin`, `/api/reports`)
- `GET /stats`, `GET /users`, `PATCH /users/:id/suspend`, `PATCH /users/:id/reactivate`
- `PATCH /verify-profile/:profileId`
- `PATCH /castings/:id/remove`, `PATCH /castings/:id/restore`
- `GET /reports`, `PATCH /reports/:id`, `GET /logs`
- `GET /api/admin/analytics/overview`, `/demographics`, `/engagement`
- `POST /api/reports` (P) — any signed-in user can report

### 6.7 Public and system endpoints
- `GET /api/stats` — four live counts for the homepage: published talent, verified talent, open casting calls, applications received
- `GET /api/health` — health check used by the hosting platform

### 6.8 Real-time (Socket.io)
- Connection requires a valid access token. The client supplies it on every connection attempt, so a reconnect after expiry uses the current token.
- Each user joins a private room. Application chat uses a room for that application.
- Events: `join_match` and `send_message` (client to server); `receive_message`, `notification:new`, `application:status_changed` and `casting:updated` (server to client).
- The server checks, for every chat event, that the user is one of the two parties on that application.

---

## 7. Features, Page by Page

### 7.1 Homepage (`/`)
- Hero with the Sri Lankan editorial still and the platform's value statement.
- **Four live statistics** from `/api/stats`, read from the database and never hard-coded. If the request fails, the figure shows a dash rather than an invented number.
- Featured talent from `/api/profiles/showcase`, Sri Lankan records first. Each card shows height and measurements from the stored profile.
- Ecosystem section for the three user groups, a parallax banner and an open-casting-calls section.

### 7.2 Talent directory (`/search`) — recruiters
- Discipline chips and a sidebar with **Country**, **Discipline**, **Age** and **Height** filters. Every filter change queries the database.
- Age and height are fixed bands (for example 18–25 and 26–35; 160–170, 171–180 and 181–195 cm), so every option is backed by profiles.
- The result count and an empty state ("no profiles matched") are always shown.
- **Compare tray:** select up to three profiles for a side-by-side view. The radar chart uses five axes computed from recorded data: height, experience, portfolio, skills and verification. The scales are printed beside the chart, so any score can be checked by hand.
- Verified coverage: all 120 combinations of country, discipline, age and height were checked through the API against a freshly seeded database, and every combination returns at least one profile.

### 7.3 Casting board (`/castings`)
- Filter tabs for all disciplines, runway, editorial, commercial and pageant castings.
- Cards show deadline, location, height and age ranges, and status. Sri Lankan castings are listed first.
- Each card links to its own detail page. The detail page ignores late responses for events the user has already left, so the event on screen always matches the URL.

### 7.4 Casting detail and applicant management
- Recruiters: the brief, the criteria, applicants with a compatibility score and explanation, and status actions (shortlist, accept, reject).
- Models: the brief and a single apply action, which the database guarantees cannot be repeated for the same casting.

### 7.5 Model workspace
- **Profile editor:** role-specific fields, measurements and experience.
- **Portfolio manager:** upload to Cloudinary, drag to reorder, and choose the cover.
- **Public profile (`/p/:id`):** the digital comp card with stored measurements and portfolio, plus the compare action.
- **My applications:** the status of each application, with a link to its casting.

### 7.6 Chat and notifications
- Once an application is accepted, the model and the recruiter can exchange messages. The chat header shows connection state.
- Notifications appear in the navigation bar with an unread count. Status changes and new messages also appear as live alerts.

### 7.7 Administration
- Member table with role and status filters, and suspend and reactivate actions.
- Casting moderation (remove and restore) and the report queue.
- The action log records every administrative change with the acting admin and target.
- Analytics: activity over time, role distribution and the application funnel.

### 7.8 Legal and trust pages
- Privacy, terms and security pages (`/privacy`, `/terms`, `/security`).
- The footer states that pageant and event names are used for illustration only and imply no endorsement.

---

## 8. The Matching Engine

**Location:** `backend/services/matchingEngine.js`. The application calls it through `utils/matchScore.js`.

### 8.1 Model
The score is a weighted sum of five criteria. Each criterion earns its full weight, a partial weight, or nothing. The weights add up to 100.

| Criterion | Weight | Rule |
|---|---|---|
| Age | 25 | Full weight if the candidate's age is inside the casting's range. Full weight if the casting sets no age range. |
| Height | 20 | Full weight if inside the casting's height range. Full weight if none is set. |
| Category | 20 | Full weight for an exact match with the casting's discipline. Nothing otherwise, unless cross-category affinity is enabled (see 8.3). |
| Country | 15 | Full weight if the candidate's country matches the casting's country. |
| Skills | 20 | Full weight scaled by the share of required skills the candidate has. Full weight if none are required. |

The final score is `round(earned / 100 × 100)`, clamped to 0–100.

### 8.2 Tiers and explanation
- **Exceptional** (85 and above), **Strong** (70–84), **Moderate** (45–69), **Poor** (below 45).
- Each result lists the strengths and gaps that drove it, such as "Height (176 cm) meets range" or "Unmatched skills: …". Recruiters see the same reasons the score was built from.

### 8.3 Cross-category affinity
An affinity table (for example, a runway model partly matching an editorial casting) exists in the code and is covered by tests. **It is switched off**: no current caller enables it, so exact category matches are the only category credit in the running system. This is deliberate and should be presented as a designed option, not a feature in use.

### 8.4 Limits
- The engine is not machine learning. It cannot learn from outcomes, and it does not measure looks or photographs.
- It depends on complete profile data. A missing field earns no credit for that criterion, which is stated in the explanation.
- Scores are not calibrated against real booking outcomes; the evaluation sample is too small for that (see Section 12).

---

## 9. Security

### 9.1 Authentication and sessions
- Passwords are hashed with bcrypt (cost factor 10). They must be at least 8 characters with a letter and a number. They are never returned by any API.
- Access tokens expire after 15 minutes and are held only in memory.
- Refresh tokens last 7 days, are sent in an HTTP-only, `SameSite=Strict`, secure cookie in production, are stored as SHA-256 hashes, and are rotated on every use.
- Suspended accounts are refused at login and on every authenticated request.
- Password reset: the reset token is random, stored hashed and valid for one hour. The forgot-password response is identical whether or not the account exists, which prevents account enumeration.
- The production server refuses to start without `JWT_SECRET`. A public development default exists only outside production.

### 9.2 Authorisation
- Role checks are enforced on the server for every protected route. The interface hides buttons, but hiding is never treated as access control.
- Public registration cannot create an admin.
- Recruiters can only change castings and applicants that belong to their own organisation.
- Chat is limited to the two parties on an accepted application, checked on every message.

### 9.3 Web protections
- **CSRF:** double-submit cookie. Every state-changing request from the browser must echo the cookie value in a header. Login, registration and token refresh are exempt because they start a session.
- **Content Security Policy** and other headers through Helmet.
- **Injection:** request bodies, parameters and query strings are sanitised against MongoDB operators.
- **Rate limits:** 300 requests per 15 minutes across the API; 10 per 15 minutes on login, registration and password-reset routes. Session checks on page load do not count toward the stricter limit.
- **Errors:** in production, internal error details are not sent to the browser.

### 9.4 Privacy
- Only data needed for the platform is collected. Measurements and images belong to the talent and can be removed by them.
- The demo environment contains only fictional people. Real personal data should not be entered into it.
- Personal-data handling is described in `Docs/Security_Data_Protection_Policy.md`. It is written with reference to the GDPR and the Sri Lankan Personal Data Protection Act No. 9 of 2022 as design influences. The project has not been assessed for compliance with either.

### 9.5 Known security items
- Credentials for the database and media account were once committed to the repository. The repository is public, so they must be treated as exposed. Rotation is the owner's task and must be confirmed before any demonstration of the live system.
- The dependency audit reports four vulnerabilities (one critical, two high, one moderate) in third-party packages. These are scheduled for update and testing.

---

## 10. Testing and Quality Evidence

### 10.1 Automated tests
- **68 tests in 13 Jest suites**, run with `npm test` in `backend/`.
- The tests start an in-memory MongoDB (`mongodb-memory-server`), so they need no network and cannot touch production data.
- Coverage spans authentication and password reset, role-based access, profiles, casting calls, applications, search filters, the matching engine, chat authorisation, notifications, admin moderation, analytics and public statistics.
- All 68 pass on the final build.

### 10.2 Build and static checks
- `npm run build` for the front end completes without errors.
- `npm run lint` (Oxlint) reports a small number of warnings in front-end code. None is a functional error. They are recorded for follow-up.
- There is no automated front-end unit test suite and no end-to-end browser suite. The main user journeys were verified manually in a browser against a seeded database and then checked on the live site. This is a real gap and is listed in Section 12.

### 10.3 User acceptance testing
`Docs/uat_report.md` records **10 UAT scenarios across the four personas, all passed**. The scenarios map to SRS functional requirements.

### 10.4 Bugs found and fixed during evaluation
These are useful examples of the evaluation process, and examiners often ask about them.
- Casting detail pages could show the wrong event when a slower response arrived after a newer click. Requests are now ignored once superseded.
- The talent directory fell back to hard-coded sample profiles when a filter had no country selected. Filters now always query the database.
- The compare radar turned a real zero score into 80. Scores now use recorded values only.
- The homepage statistics were hard-coded and some could not be supported by data. They are now read from the database.
- The authentication rate limiter counted routine session checks, which could lock out an ordinary user after a few page loads. It now applies only to login, registration and password-reset routes.
- Real-time chat kept an expired token after a reconnect. Sockets now read the current token on each connection attempt.

---

## 11. Deployment and Operations

### 11.1 Hosting
- Render, as a single web service defined in `render.yaml`. The build compiles the front end, installs back-end dependencies and starts the server, which serves the application and the API from one address.
- Environment variables are set in the Render dashboard, not in the repository: the database connection, `JWT_SECRET` (generated), `CLIENT_URL`, `FRONTEND_URL` and the Cloudinary keys.
- A Docker and Nginx alternative is included for self-hosting (`docker-compose.yml`).

### 11.2 Operational facts to state accurately
- The free tier sleeps after about 15 minutes without traffic. The first request afterwards can take 30–60 seconds. Open the site a few minutes before a demonstration.
- Rate limits are held in memory. With more than one server instance they would need a shared store.
- The repository contains no CI workflow. Tests are run locally before pushing.

### 11.3 Seeding demonstration data
- `npm run seed:demo` creates a small narrative set with chat history and notifications.
- `npm run seed:sl` creates 100 accounts per role with Sri Lankan names, castings and applications. Both are safe to re-run: they replace only their own demonstration accounts.
- Both refuse to run when `NODE_ENV=production`.

---

## 12. Limitations, Disclosed Honestly

1. **No machine learning.** The matcher is a fixed rubric. It is transparent but cannot learn.
2. **Affinity is switched off.** Cross-category matching exists in the code but is not used.
3. **No payments, escrow or contracts.** Bookings are agreed outside the platform.
4. **No legal identity verification.** "Verified" is an administrator's flag, not an identity check.
5. **English only.** No Sinhala or Tamil interface.
6. **No native mobile apps.** The site is responsive and can be installed as a web app.
7. **Demonstration data is fictional, and the photographs are not verified.** Every name and profile is invented. Portrait photographs were chosen by visual review to look South Asian. Nationality cannot be read from a photograph, so no image is claimed to be of a named Sri Lankan person.
8. **Pageant and fashion-week names are real trademarks.** They appear as organiser labels for illustration, with a disclaimer on the site and in the documentation. A commercial launch would need licences or permission.
9. **Evaluation sample.** Results come from a small set of demonstration accounts and manual testing. They show the system works; they do not show that it improves hiring outcomes.
10. **Test gaps.** No automated front-end or browser tests; no continuous-integration workflow.
11. **Free-tier hosting.** Cold starts and sleeping services, as described in Section 11.
12. **Dependency vulnerabilities.** The audit reports four open items in third-party packages.
13. **Credential exposure.** Credentials committed in the past require rotation (Section 9.5).

---

## 13. 15-Minute Demonstration Script

**Before you start (5 minutes):**
1. Open the live site and wait for it to wake up.
2. Log in as a recruiter in one window (`organizer1@demo.talent`) and as a model in a second window (`model1@demo.talent`). Password for all demo accounts: `Password123`.
3. Check the homepage statistics show numbers, not dashes.

**Demonstration:**
1. **Homepage (1 min).** Point out that the four figures are read from the database, and that the featured talent is Sri Lankan with real measurements.
2. **Talent directory (3 min).** As the recruiter, select a discipline, then add an age band and a height band. Show that results appear. Add three profiles to the compare tray and open it. Explain each radar axis and where its scale is printed.
3. **Casting pipeline (4 min).** As the recruiter, open a casting, then its applicants. Show the score and the reasons behind it. Accept one applicant.
4. **Model view (3 min).** Switch to the model window. Show the accepted application, the live notification, and the chat. Send a message and show it arrive in the recruiter window.
5. **Administration (2 min).** Log in as `admin@demo.talent`. Show the action log and the report queue.
6. **Close (2 min).** Summarise the four guarantees: server-side role checks, explainable scores, short-lived tokens, and an audit trail for every administrative action.

**If something fails:** say what you would check and show the automated test results (`npm test`, 68 passing).

---

## 14. Examiner Questions and Answers

**Q1. Why not machine learning for matching?**
Transparency and fairness. A recruiter must be able to see why a candidate ranked where they did, and a candidate must be able to challenge it. A fixed rubric makes that possible. The trade-off is that the system cannot learn from outcomes, and I state that as a limitation.

**Q2. Why a monolith rather than microservices?**
For one developer and a pilot-scale product, a monolith has fewer failure points and one deployment. The domains are separated in code, so extraction is possible later. Microservices would add network failures and deployment overhead without a corresponding benefit at this size.

**Q3. Why no payments?**
Payments bring regulatory and financial-compliance obligations that are outside this project's scope. Bookings are agreed through the platform and settled outside it. This is documented as out of scope.

**Q4. How are tokens protected from theft?**
The short-lived access token is kept only in memory, so script injection cannot read it from storage. The refresh token is in an HTTP-only, strict same-site cookie, stored hashed and rotated on every use. CSRF is blocked with a double-submit token on every state-changing request.

**Q5. Why Cloudinary rather than storing images in MongoDB?**
Binary files in the database slow queries and risk the 16 MB document limit. A CDN serves images faster and handles resizing.

**Q6. Why not a native mobile app?**
The responsive web application covers the core workflows on phones. A native app would double the testing and maintenance effort, which is not justified for this stage.

**Q7. How did you avoid bias with a small sample?**
I didn't claim to. The matcher uses only fields a recruiter already specifies (age, height, discipline, country, skills), applies the same rule to every candidate, and shows its reasons. The sample is too small to measure bias statistically, and I say so.

**Q8. How do you handle sensitive physical measurements?**
They are visible to the talent, to recruiters the talent applies to, and to administrators. They are not shown on the public listing beyond the comp card, and the talent can edit or remove them.

**Q9. What happens with 50,000 models registering at once?**
Rate limiting, indexed queries and paginated results keep the API responsive. The free hosting tier would not cope, and that is a deployment decision rather than a code limit. The database indexes support the queries used by the directory.

**Q10. Why React 19 and Express 5?**
They are current, widely used and supported. Express 5 is the current major version, and React 19 is the current stable release.

**Q11. What are the limitations?**
Section 12. The main ones are no machine learning, no payments, English only, fictional demonstration data, no automated browser tests, and free-tier hosting.

**Q12. What is your contribution?**
A working, tested reference implementation that combines role-based marketplace workflows with an explainable, auditable matching model and a documented security design, evaluated through automated tests, UAT and a live deployment.

**Q13. How do you prevent duplicate applications?**
A unique database index on casting and model. A second attempt is rejected by the database, not just the interface.

**Q14. Why Recharts?**
It is a React-native charting library with a radar chart type. It needed no separate configuration layer.

**Q15. Why MongoDB rather than PostgreSQL?**
The profile types differ in shape, and the main reads are per-document. Relationships between castings and applications are handled with references and indexes. A relational design would also work; the choice is a trade-off I can explain.

**Q16. How do you keep data consistent without distributed transactions?**
The application is one service with one database. Status changes update the application and write a notification in sequence. A failure after the first write is possible, and I list it as a limitation rather than claim full atomicity.

**Q17. What if the connection drops during a status change?**
The change is saved in the database first. The live notification is only a convenience. When the user reconnects or reloads, the notification list and the application status come from the database.

**Q18. How do you prevent malicious file uploads?**
Uploads go to Cloudinary, which validates and stores them. The application accepts only the image and video types defined in the upload middleware. Files are not executed on the server.

**Q19. Why test against an in-memory database rather than mocks?**
Mocks can pass while the real query fails. An in-memory MongoDB runs the real queries, indexes and validation, and needs no network.

**Q20. What if candidate measurements or skills are missing?**
The missing criterion earns no credit, and the explanation lists it as a gap. The score is never inflated by assuming a value.

**Q21. How are passwords and tokens protected against timing attacks?**
Passwords are checked with bcrypt, which is designed to resist timing analysis. Token and reset-hash comparisons use hashes of the submitted value, so the stored secret is never compared directly.

**Q22. Why no pagination on the casting board?**
The board is paginated on the server (`page` and `limit`). The front end loads one page at a time.

**Q23. How does Jaccard differ from cosine similarity?**
The matcher does not use either. Skills are scored by the share of required skills present, which is a simple overlap ratio. Jaccard would divide by the union of both sets; the rubric divides by the requirement only, so a candidate is not penalised for extra skills.

**Q24. Why Zustand rather than Redux or Context?**
Zustand is small and needs no provider wrapper. It holds the authentication state, and the access token stays in memory outside React's render cycle.

**Q25. How does the system relate to Sri Lanka's Personal Data Protection Act?**
The design follows its principles: collect only what is needed, let people see and correct their data, and protect it. The project is not certified against the Act, and the demonstration data is fictional.

---

## 15. Revision History of the Final Build

Changes made after the first version of this document, all reflected above:

- **Live statistics.** Homepage figures come from the database through `GET /api/stats`. The earlier hard-coded claims were removed.
- **Recorded-data radar.** Scores use stored values with printed scales. Fixed-category scoring and a silent zero-to-80 fallback were removed.
- **Talent directory.** Filters always query the database. Country, age and height are fixed options, each backed by profiles.
- **Sri Lankan ordering.** Sri Lankan records rank first in the directory, the homepage and the casting board.
- **Demonstration people.** Names, cities and portrait imagery are Sri Lankan or South Asian-presenting. Imagery is described as presenting, not verified.
- **Pageant names.** Real franchise and fashion-week names are used as labels, with disclaimers on the site and in the documentation.
- **Authentication hardening.** Production refuses to start without `JWT_SECRET`. The brute-force limiter applies to credential routes only.
- **Real-time reliability.** Socket connections use the current token on every attempt.
- **Casting detail.** Superseded responses are ignored, so the displayed event always matches the URL.
- **Test count.** 68 tests in 13 suites, up from 67 in 12, after adding public statistics coverage and updating one search test to the new country behaviour.
