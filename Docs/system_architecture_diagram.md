# System Architecture & Component Interaction Diagrams

**Project:** Global Multidimensional Talent Marketplace and Casting Management System  
**Candidate:** Sandun Prabath (A.M.S.P Athapaththu) — BSc (Hons) Software Engineering, NSBM Green University  
**Supervisor:** Ms. Lakni Peiris  
**Document Version:** 2.0 (Post-Phase 2 Platform Expansion)

---

## 1. C4 Level 1: System Context Diagram

The system context diagram illustrates the external actors (Models, Industry Professionals, Pageant Organizers, Platform Administrators) and external systems (Cloudinary, MongoDB Atlas) interacting with the Talent Marketplace Platform.

```mermaid
C4Context
    title System Context Diagram - Global Multidimensional Talent Marketplace

    Person(model, "Talent / Model", "Creates comp cards, uploads editorial media, discovers castings, reviews explainable compatibility.")
    Person(recruiter, "Industry Professional", "Publishes casting calls, filters talent with precision measurements, evaluates ranked applicants.")
    Person(pageantOrg, "Pageant Federation", "Creates franchised pageants, screens delegates, manages audition pipelines.")
    Person(admin, "Platform Administrator", "Oversees compliance, verifies talent, inspects real-time telemetry analytics.")

    Enterprise_Boundary(b1, "Atelier Talent Marketplace Ecosystem") {
        System(marketplace, "Talent Marketplace Platform", "Facilitates multidimensional talent discovery, algorithmic ranking, casting lifecycle, and real-time negotiations.")
    }

    System_Ext(cloudinary, "Cloudinary CDN", "Stores high-resolution portfolio images, comp cards, and media assets.")
    System_Ext(mongoAtlas, "MongoDB Atlas", "Managed document store for users, profiles, castings, applications, and telemetry.")

    Rel(model, marketplace, "Submits comp cards, searches castings, messages recruiters via WebSockets")
    Rel(recruiter, marketplace, "Creates casting notices, reviews AI-ranked applicants, triggers status transitions")
    Rel(pageantOrg, marketplace, "Manages national delegate recruitment and casting calls")
    Rel(admin, marketplace, "Audits incident reports, moderates listings, monitors telemetry")

    Rel(marketplace, cloudinary, "Direct secure media upload & dynamic transformations", "HTTPS / Signed REST")
    Rel(marketplace, mongoAtlas, "Persists domain documents and aggregations", "TLS / Mongoose ODM")
```

---

## 2. C4 Level 2: Container Architecture Diagram

Details the concrete deployable units: React 19 SPA hosted on Vercel, Node.js Express & Socket.io API hosted on Render, MongoDB Atlas database, and Cloudinary media CDN.

```mermaid
graph TD
    subgraph ClientTier ["Client Tier (Vercel CDN)"]
        SPA["React 19 SPA (Vite)<br/>• Obsidian & Gold Haute Couture UI<br/>• Recharts Intelligence Dashboard<br/>• Socket.io Client & Floating Toasts<br/>• Explainable Match Inspector Modal"]
    end

    subgraph APITier ["API & Application Tier (Render Node.js Runtime)"]
        ExpressApp["Express.js 5 REST API<br/>• JWT Authentication & Double-Submit CSRF<br/>• Helmet Security Headers & Rate Limiters<br/>• Mongoose Input Sanitizer"]
        SocketServer["Socket.io 4.8 Engine<br/>• Personal User Rooms (user:userId)<br/>• Real-Time Application Dispatches<br/>• Mutual Consent Chat Channels"]
        MatchEngine["Explainable Matching Engine<br/>• Multi-Dimensional Scoring<br/>• Cross-Category Transfer Affinities<br/>• Jaccard Skills Intersections<br/>• Natural-Language Reasoning"]
        AnalyticsSvc["Analytics & Telemetry Aggregator<br/>• Daily Time-Series Bucketing<br/>• Demographic & Conversion Funnels"]
        NotificationSvc["Notification Service<br/>• MongoDB Persistence<br/>• Event Emitter to Sockets"]
    end

    subgraph DataTier ["Persistence & Media Tier"]
        MongoDB[("MongoDB Atlas<br/>• Users & RBAC Claims<br/>• Multi-Schema Profiles<br/>• Castings & Applications<br/>• Messages & Audit Logs")]
        CloudinaryStore[("Cloudinary Asset Store<br/>• High-Res Portfolios<br/>• Comp Card Thumbnails")]
    end

    SPA -->|"HTTPS REST (Axios with JWT)"| ExpressApp
    SPA <-->|"WSS WebSockets"| SocketServer
    ExpressApp --> MatchEngine
    ExpressApp --> AnalyticsSvc
    ExpressApp --> NotificationSvc
    NotificationSvc --> SocketServer
    ExpressApp -->|"TLS Driver"| MongoDB
    AnalyticsSvc -->|"Aggregation Pipeline"| MongoDB
    ExpressApp -->|"Multer Cloudinary Storage"| CloudinaryStore
```

---

## 3. Real-Time WebSocket Notification Sequence Flow

Illustrates how an application status transition triggers both transactional database persistence and sub-second real-time toast dispatches to the applicant.

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Industry Recruiter
    participant WebUI as Recruiter Browser
    participant API as Express API
    participant NotifSvc as Notification Service
    participant Sockets as Socket.io Server
    participant DB as MongoDB Atlas
    actor Model as Model Applicant
    participant ModelUI as Model Browser (Live)

    ModelUI->>Sockets: Connect (Handshake with JWT)
    Sockets-->>ModelUI: Authenticated & Joined room "user:modelId"
    
    Recruiter->>WebUI: Click "Shortlist Candidate" in ManageApplicants
    WebUI->>API: PATCH /api/applications/:id/status { status: "shortlisted" }
    
    API->>DB: Update Application document (status = "shortlisted")
    API->>NotifSvc: createNotification(userId, type: "application_update", msg)
    NotifSvc->>DB: Save Notification document
    NotifSvc->>Sockets: io.to("user:modelId").emit("notification:new", notif)
    NotifSvc->>Sockets: io.to("user:modelId").emit("application:status_changed", payload)
    
    Sockets-->>ModelUI: WSS Broadcast received in real-time
    ModelUI->>ModelUI: Render Obsidian & Gold Floating Toast
    ModelUI->>ModelUI: Increment Notification Badge Counter (+1)
    API-->>WebUI: 200 OK { success: true, status: "shortlisted" }
```

---

## 4. Explainable Multi-Dimensional Matching Engine Pipeline

```mermaid
flowchart TD
    Start(["Input: Casting Call Criteria + Model Profile"]) --> D1["1. Age Alignment<br/>minAge & maxAge Range Evaluation"]
    Start --> D2["2. Height Specification<br/>Precision Runway Tolerance Check"]
    Start --> D3["3. Category Transfer Affinity<br/>Runway ↔ Editorial ↔ Commercial Matrix"]
    Start --> D4["4. Geographic Mobility<br/>Territorial Alignment Check"]
    Start --> D5["5. Skills Intersection<br/>Jaccard Proportional Overlap Analysis"]

    D1 --> W1["Weight: 25%"]
    D2 --> W2["Weight: 20%"]
    D3 --> W3["Weight: 20%"]
    D4 --> W4["Weight: 15%"]
    D5 --> W5["Weight: 20%"]

    W1 & W2 & W3 & W4 & W5 --> Aggregator["Score Synthesis & Normalization<br/>Final Score = ∑(Earned Weight) / 100"]

    Aggregator --> TierClassifier{"Score Classification"}
    TierClassifier -->|Score ≥ 85%| Exceptional["Tier: Exceptional Fit"]
    TierClassifier -->|70% ≤ Score < 85%| Strong["Tier: Strong Fit"]
    TierClassifier -->|45% ≤ Score < 70%| Moderate["Tier: Moderate Fit"]
    TierClassifier -->|Score < 45%| Poor["Tier: Poor Fit"]

    Exceptional & Strong & Moderate & Poor --> Explainer["Explainable Reasoning Generator<br/>• Key Strengths Synthesis<br/>• Constraint Gaps Analysis<br/>• Natural Language Brief"]

    Explainer --> Output(["Output: score, matchTier, breakdown, explanation, strengths, gaps"])
```

---

## 5. Security Architecture & Threat Defense Matrix

| Security Layer | Threat Mitigated | Implementation Mechanism | Validation Status |
|---|---|---|---|
| **Identity & Authentication** | Credential stuffing, session hijacking | Salted bcrypt (cost factor 10), in-memory JWT access tokens, HttpOnly refresh cookies with rotation | Verified (42+ unit tests) |
| **Transport & Headers** | Clickjacking, MIME-sniffing, XSS | `helmet()` with strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` | Active in `server.js` |
| **CSRF Defense** | Cross-Site Request Forgery on state changes | Double-submit cookie pattern (`XSRF-TOKEN` cookie validated against `X-XSRF-TOKEN` header) | Active in `csrfMiddleware.js` |
| **Injection Defense** | NoSQL query selector injection (`$gt`, `$ne`) | Recursive `mongoSanitize` middleware stripping operator keys on `req.body`, `req.query`, and `req.params` | Active in `security.js` |
| **DDoS & Abuse Control** | Endpoint flooding, brute-force password guessing | Sliding-window IP rate limiters (300 req/15 min global API; 10 req/15 min on auth routes) | Active in `security.js` |
| **Authorization & Privacy** | Broken Object Level Authorization (IDOR) | Scoped ownership validations on castings, applications, and direct messaging channels | Verified in `socketManager.js` |
