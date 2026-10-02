# REST API & Real-Time WebSocket Reference Manual

**Project:** Global Multidimensional Talent Marketplace and Casting Management System  
**Candidate:** Sandun Prabath (A.M.S.P Athapaththu) — BSc (Hons) Software Engineering, NSBM Green University  
**Supervisor:** Ms. Lakni Peiris  
**Document Version:** 2.0  
**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://atelier-talent.onrender.com/api`

---

## 1. Authentication & Security Protocol

### 1.1 JWT Bearer Authorization
All protected endpoints require an `Authorization` header with a valid JSON Web Token:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 1.2 CSRF Protection (Double-Submit Cookie)
All state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) require the CSRF token header matching the `XSRF-TOKEN` cookie:
```http
X-XSRF-TOKEN: <CSRF_TOKEN_HEX_STRING>
```
*Token initialization endpoint:* `GET /api/csrf-token`

---

## 2. API Endpoint Catalog

### 2.1 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new user (`model`, `industry_professional`, `pageant_organizer`). |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, sets HttpOnly refresh cookie, returns access JWT. |
| `POST` | `/api/auth/refresh` | Public (Cookie) | Rotates refresh token and issues fresh access token. |
| `POST` | `/api/auth/logout` | Public | Revokes refresh token and clears session cookies. |
| `POST` | `/api/auth/forgot-password` | Public | Generates a 1-hour secure reset token and dispatches reset link. |
| `POST` | `/api/auth/reset-password/:token` | Public | Updates user password using valid token. |

---

### 2.2 Profiles (`/api/profiles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/profiles/me` | Authenticated | Retrieves current user's profile document. |
| `PUT` | `/api/profiles/me` | Authenticated | Updates current user's specifications, measurements, and publication state. |
| `GET` | `/api/profiles/:id` | Public | Retrieves public view of a published talent comp card or studio profile. |

---

### 2.3 Castings & Recruitment (`/api/castings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/castings` | Public | Lists open casting calls with category, country, and status filters. |
| `POST` | `/api/castings` | Industry / Pageant / Admin | Authors and publishes a new casting notice with criteria parameters. |
| `GET` | `/api/castings/:id` | Public | Retrieves full detail of a casting call including deadline and requirements. |
| `GET` | `/api/castings/:id/applicants` | Casting Owner | Retrieves candidate applications for a casting call, enriched with AI match scores. |
| `GET` | `/api/castings/:id/recommendations` | Casting Owner | Returns top ranked published talent profiles scored against the casting criteria. |

---

### 2.4 Applications Pipeline (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/applications` | Model Only | Submits talent comp card to an open casting call. |
| `GET` | `/api/applications/me` | Model Only | Lists all casting submissions filed by the authenticated model. |
| `PATCH` | `/api/applications/:id/status` | Casting Owner | Updates candidate review status (`shortlisted`, `accepted`, `rejected`) and emits real-time notifications. |

---

### 2.5 Explainable Matching Engine (`/api/match`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/match/recommendations/castings` | Model Only | Returns top ranked open castings tailored to the model's physical measurements and skills. |

*Sample Payload Response:*
```json
{
  "success": true,
  "data": [
    {
      "castingCall": {
        "_id": "67cb2a9f1a2b",
        "title": "Paris Fashion Week - Haute Couture Fall",
        "category": "runway",
        "country": "France"
      },
      "score": 95,
      "matchTier": "Exceptional",
      "explanation": "Exceptional match (95%). Key factors: Height (180cm) meets runway specification (175-185cm); Exact category match for runway; Located in casting territory (France).",
      "keyStrengths": [
        "Height (180cm) meets runway specification (175-185cm)",
        "Exact category match for runway",
        "Located in casting territory (France)"
      ],
      "keyGaps": [],
      "breakdown": {
        "age": { "specified": true, "matched": true, "weight": 25, "value": 24 },
        "height": { "specified": true, "matched": true, "weight": 20, "value": 180 },
        "category": { "specified": true, "matched": true, "weight": 20, "affinityScore": 1.0 },
        "country": { "specified": true, "matched": true, "weight": 15 },
        "skills": { "specified": true, "matched": true, "weight": 20, "overlapFraction": 1.0 }
      }
    }
  ]
}
```

---

### 2.6 Admin Telemetry & Analytics (`/api/admin/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/analytics/overview?days=30` | Admin Only | Returns daily time-series counts for registrations, castings, and applications. |
| `GET` | `/api/admin/analytics/demographics` | Admin Only | Returns role distributions, top countries, and category breakdowns. |
| `GET` | `/api/admin/analytics/engagement` | Admin Only | Returns candidate conversion funnel stages and platform KPI metrics. |

---

### 2.7 Real-Time Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications/me` | Authenticated | Lists user's notifications ordered by newest first. |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Marks a single notification as read. |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Marks all unread notifications for the user as read. |

---

## 3. WebSocket Event Catalog (Socket.io 4.8)

*Connection Endpoint:* `ws://localhost:5000` (or `wss://api-origin`)  
*Handshake Authentication:* `{ auth: { token: "<JWT_ACCESS_TOKEN>" } }`

| Event Direction | Event Name | Payload Structure | Description |
|---|---|---|---|
| **Server → Client** | `notification:new` | `{ _id, userId, type, message, link, createdAt }` | Dispatched to personal room `user:userId` on new alert. |
| **Server → Client** | `application:status_changed` | `{ notificationId, message, metadata }` | Dispatched on candidate shortlist or acceptance. |
| **Server → Client** | `casting:updated` | `{ notificationId, message, metadata }` | Dispatched when casting terms are modified. |
| **Client → Server** | `join_match` | `applicationId` (String) | Authorizes and connects user to the mutual application chat room. |
| **Client → Server** | `send_message` | `{ applicationId, content }` | Verifies mutual consent and persists direct chat message. |
| **Server → Client** | `receive_message` | `{ _id, applicationId, senderId, content, createdAt }` | Broadcasts new message to both participants in real-time. |

---

## 4. Standard Error Response Format

All failed API requests follow the uniform error structure:
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR | FORBIDDEN | NOT_FOUND | RATE_LIMITED | CSRF_VALIDATION_FAILED | INTERNAL_ERROR",
  "message": "Descriptive human-readable explanation of error."
}
```
