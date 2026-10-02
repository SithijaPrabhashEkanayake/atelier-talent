# API Specification
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | REST API Specification |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Approved for Build |
| **API Version** | v1 |
| **Base URL (Production/Pilot)** | `https://api.talentmarketplace.live/api/v1` |
| **Base URL (Staging)** | `https://talent-marketplace-staging.onrender.com/api/v1` |
| **WebSocket URL (Production)** | `wss://api.talentmarketplace.live` |
| **WebSocket URL (Staging)** | `wss://talent-marketplace-staging.onrender.com` |
| **Companion Documents** | PRD v2.0, SRS v2.0, System Architecture Design Document v2.0, Database Design Document v2.0 |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial API specification covering all modules defined in SRS §3 | Product/Engineering Team |
| 2.0 | 2026-09-08 | Resolved all placeholder URLs (`talentmarketplace.live`); added `POST /auth/refresh-token` and `POST /auth/revoke-token` endpoints; added Section 14 — WebSocket/Socket.io Event Specification; added Section 15 — Notifications endpoints; added `429` response example; updated Cloudinary media URL examples; updated status to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This document specifies the complete REST API contract for the Global Multidimensional Talent Marketplace and Casting Management System. It defines every endpoint the frontend (React SPA) consumes and the backend (Node.js/Express) must implement, including request/response schemas, authentication requirements, status codes, and error formats. This is the binding contract that allows frontend and backend development to proceed in parallel.

### 1.2 Audience
- Backend engineers implementing controllers/routes
- Frontend engineers integrating API calls
- QA engineers writing Postman/automated API test suites
- Academic supervisor/examiners reviewing interface design rigor

### 1.3 Conventions Used in This Document
- `{param}` denotes a URL path parameter.
- 🔒 denotes an endpoint requiring authentication (valid JWT).
- Role tags (e.g., `[model]`, `[industry_professional]`, `[pageant_organizer]`, `[admin]`, `[any authenticated]`) denote which role(s) may call the endpoint.
- All request/response bodies are JSON unless otherwise noted (file uploads use `multipart/form-data`).

---

## 2. General API Conventions

### 2.1 Base URL and Versioning
All endpoints are prefixed with `/api/v1`. Future breaking changes will be introduced under `/api/v2`, preserving backward compatibility for existing frontend deployments during transition windows (per Database Design Document §10).

### 2.2 Authentication
- Authentication uses **JWT Bearer tokens**.
- Clients must include the header: `Authorization: Bearer <token>` on all protected endpoints.
- Tokens are issued by `POST /auth/login` and `POST /auth/register` and contain the user's `id`, `role`, and `verificationStatus` as claims.
- Tokens expire after a configurable duration (recommended: 24 hours for pilot phase); expired tokens return `401 Unauthorized` with `errorCode: TOKEN_EXPIRED`.

### 2.3 Standard Response Envelope
All successful responses follow:
```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```
`meta` is included for paginated/list endpoints (see §2.5) and omitted otherwise.

All error responses follow:
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Human-readable description of the error",
  "details": [ ]
}
```

### 2.4 Standard HTTP Status Codes
| Code | Meaning | Usage |
|---|---|---|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST creating a resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Authenticated but insufficient role/permission |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., duplicate application, duplicate email) |
| 422 | Unprocessable Entity | Semantically invalid request (e.g., minAge > maxAge) |
| 429 | Too Many Requests | Rate limit exceeded (auth endpoints) — see §2.7 for example response |
| 500 | Internal Server Error | Unhandled server-side error |

### 2.5 Pagination
List endpoints support pagination via query parameters:
```
?page=1&limit=20
```
Response `meta` object:
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 143,
    "totalPages": 8
  }
}
```

### 2.6 Common Error Codes
| errorCode | Meaning |
|---|---|
| `VALIDATION_ERROR` | Request body/params failed schema validation |
| `UNAUTHORIZED` | Missing or invalid token |
| `TOKEN_EXPIRED` | JWT expired |
| `FORBIDDEN` | Valid token, insufficient role/permission |
| `NOT_FOUND` | Requested resource does not exist |
| `DUPLICATE_RESOURCE` | Unique constraint violated (e.g., duplicate application/email) |
| `INVALID_STATE_TRANSITION` | e.g., applying to a closed casting call |
| `FILE_TOO_LARGE` | Upload exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | Upload MIME type not allowed |
| `RATE_LIMITED` | Too many requests in a given window |
| `INTERNAL_ERROR` | Unhandled server error |

### 2.7 Rate Limiting
Authentication endpoints (`/auth/login`, `/auth/register`, `/auth/forgot-password`) are rate-limited to **10 requests per 15 minutes per IP** to mitigate brute-force/abuse (supports SRS-FR-1.10, NFR-SEC).

**Example `429 Too Many Requests` response:**
```json
{
  "success": false,
  "errorCode": "RATE_LIMITED",
  "message": "Too many requests. Please wait before trying again.",
  "details": [
    { "retryAfterSeconds": 487 }
  ]
}
```
The `Retry-After` HTTP header is also included in the response.

### 2.8 Refresh Token Flow
Access tokens expire after **15 minutes**. Clients use the refresh-token endpoint to obtain a new access token without re-authenticating.

- On login/register, the server sets an HTTP-only, Secure, SameSite=Strict cookie named `refreshToken` (7-day TTL).
- The client never reads this cookie directly — it is automatically sent by the browser on `POST /auth/refresh-token`.
- Refresh tokens are single-use (rotated on each use) and stored in the `refresh_tokens` MongoDB collection.
- On logout, the refresh token is immediately revoked server-side.

---

## 3. Module: Authentication (`/auth`)

### 3.1 `POST /auth/register`
Registers a new user account and creates a corresponding role-specific profile shell.

**Auth:** None

**Request Body:**
```json
{
  "email": "amara.model@example.com",
  "password": "SecurePass123",
  "role": "model",
  "representationStatus": "freelance"
}
```
`representationStatus` is required only when `role = "model"` (SRS-FR-1.8).

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "email": "amara.model@example.com",
      "role": "model",
      "verificationStatus": "unverified"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** `400 VALIDATION_ERROR` (weak password, missing role), `409 DUPLICATE_RESOURCE` (email already registered)

---

### 3.2 `POST /auth/login`
Authenticates a user and issues a JWT.

**Auth:** None

**Request Body:**
```json
{ "email": "amara.model@example.com", "password": "SecurePass123" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "665f1a2b3c4d5e6f7a8b9c0d", "email": "amara.model@example.com", "role": "model", "verificationStatus": "verified" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` (generic "invalid credentials" — SRS-FR-1.5), `429 RATE_LIMITED`, `403 FORBIDDEN` (`errorCode: ACCOUNT_LOCKED` if lockout active per SRS-FR-1.10)

---

### 3.3 `POST /auth/logout` 🔒 `[any authenticated]`
Invalidates the current session: client discards the access token; server revokes the HTTP-only refresh token cookie by clearing it and marking the token record as revoked in `refresh_tokens`.

**Response `200 OK`:**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

### 3.3a `POST /auth/refresh-token`
Issues a new short-lived access token using the HTTP-only refresh token cookie. Rotates the refresh token (old token is revoked; new token is set in the cookie).

**Auth:** None (uses HTTP-only cookie automatically)

**Request Body:** *(none — refresh token is read from the cookie)*

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** `401 UNAUTHORIZED` (`errorCode: INVALID_OR_EXPIRED_REFRESH_TOKEN`), `401 UNAUTHORIZED` (`errorCode: REFRESH_TOKEN_REVOKED`)

---

### 3.3b `POST /auth/revoke-token` 🔒 `[admin]`
Admin-only: forcibly revokes a specific user's refresh token (e.g., on account suspension).

**Request Body:** `{ "userId": "665f1a2b3c4d5e6f7a8b9c0d" }`

**Response `200 OK`:** `{ "success": true, "data": { "message": "Tokens revoked for user." } }`

---

### 3.4 `POST /auth/forgot-password`
Initiates a password-reset flow by sending a reset link to the registered email.

**Request Body:**
```json
{ "email": "amara.model@example.com" }
```

**Response `200 OK`:** (always returns success to avoid email enumeration)
```json
{ "success": true, "data": { "message": "If an account exists, a reset link has been sent." } }
```

---

### 3.5 `POST /auth/reset-password`
Completes the password-reset flow using a token from the emailed link.

**Request Body:**
```json
{ "resetToken": "abc123...", "newPassword": "NewSecurePass456" }
```

**Response `200 OK`:**
```json
{ "success": true, "data": { "message": "Password reset successfully" } }
```

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` (`errorCode: INVALID_OR_EXPIRED_RESET_TOKEN`)

---

### 3.6 `GET /auth/me` 🔒 `[any authenticated]`
Returns the currently authenticated user's core identity.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "id": "665f1a2b3c4d5e6f7a8b9c0d", "email": "amara.model@example.com", "role": "model", "verificationStatus": "verified", "isActive": true }
}
```

---

## 4. Module: Profiles (`/profiles`)

### 4.1 `GET /profiles/me` 🔒 `[any authenticated]`
Returns the authenticated user's own role-specific profile.

**Response `200 OK`:** returns `ModelProfile`, `IndustryProfile`, or `PageantOrgProfile` shape based on role (see Database Design Document §4).

---

### 4.2 `PUT /profiles/me` 🔒 `[any authenticated]`
Creates or updates the authenticated user's role-specific profile (idempotent upsert).

**Request Body (example — `model`):**
```json
{
  "fullName": "Amara Fernando",
  "country": "Sri Lanka",
  "dateOfBirth": "2001-05-14",
  "heightCm": 172,
  "measurements": { "bust": 84, "waist": 62, "hips": 90 },
  "category": "runway",
  "representationStatus": "freelance",
  "experience": [{ "title": "Runway Model", "organization": "Colombo Fashion Week", "year": 2025 }],
  "skills": ["runway walking"],
  "socialLinks": { "instagram": "@amara.models", "tiktok": "@amara.models" }
}
```

**Response `200 OK`:** returns the updated profile object, including `isPublished` computed status (SRS-FR-3.5).

**Errors:** `400 VALIDATION_ERROR` (missing mandatory fields, invalid enum values)

---

### 4.3 `GET /profiles/{profileId}` 🔒 `[any authenticated]`
Retrieves a published profile by ID (for recruiter viewing a candidate, or public-facing profile page).

**Response `200 OK`:** profile object; includes `verificationStatus` badge data.

**Errors:** `404 NOT_FOUND` (unpublished or non-existent profile)

---

### 4.4 `GET /profiles` 🔒 `[industry_professional, pageant_organizer, admin]`
Lists/browses profiles — primarily used internally by the Search module (§7); exposed here for completeness and admin browsing.

**Query Parameters:** `country`, `category`, `role`, `page`, `limit`

**Response `200 OK`:** paginated list of profile summaries.

---

## 5. Module: Portfolio (`/portfolio`)

### 5.1 `POST /portfolio/upload` 🔒 `[model]`
Uploads a new portfolio media item.

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required |
|---|---|---|
| `file` | File (image/video) | Yes |
| `type` | String (`photo`/`video`) | Yes |
| `category` | String (e.g., `runway`, `commercial`) | Yes |

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c1f",
    "type": "photo",
    "category": "runway",
    "mediaUrl": "https://res.cloudinary.com/talent-marketplace/image/upload/v1234567890/portfolio/abc123.jpg",
    "thumbnailUrl": "https://res.cloudinary.com/talent-marketplace/image/upload/w_400,h_400,c_fill/portfolio/abc123.jpg",
    "sortOrder": 0,
    "uploadedAt": "2026-04-01T10:00:00Z"
  }
}
```

**Errors:** `400 UNSUPPORTED_FILE_TYPE`, `400 FILE_TOO_LARGE`, `403 FORBIDDEN` (non-model role)

---

### 5.2 `GET /portfolio/{profileId}` 🔒 `[any authenticated]`
Retrieves all portfolio items for a given model profile, ordered by `sortOrder`.

**Response `200 OK`:** array of portfolio item objects.

---

### 5.3 `PATCH /portfolio/{itemId}/reorder` 🔒 `[model — owner only]`
Updates the `sortOrder` of a portfolio item.

**Request Body:** `{ "sortOrder": 2 }`

**Response `200 OK`:** updated item.

**Errors:** `403 FORBIDDEN` (attempting to reorder another user's item)

---

### 5.4 `DELETE /portfolio/{itemId}` 🔒 `[model — owner only]`
Deletes a portfolio item (and its cloud-stored media asset).

**Response `204 No Content`**

**Errors:** `403 FORBIDDEN`, `404 NOT_FOUND`

---

## 6. Module: Casting Management (`/castings`)

### 6.1 `POST /castings` 🔒 `[industry_professional, pageant_organizer]`
Creates a new casting call.

**Request Body:**
```json
{
  "title": "Miss Sri Lanka 2026 — Open Casting",
  "country": "Sri Lanka",
  "category": "pageant",
  "criteria": {
    "minAge": 18, "maxAge": 27,
    "minHeightCm": 165, "maxHeightCm": 185,
    "experienceLevel": "any",
    "requiredSkills": ["public speaking"]
  },
  "description": "Official recruitment for national pageant candidates...",
  "applicationDeadline": "2026-04-30"
}
```

**Response `201 Created`:** the created casting call object with `status: "open"`.

**Errors:** `400 VALIDATION_ERROR` (e.g., `422 minAge > maxAge`), `403 FORBIDDEN` (model attempting to create)

---

### 6.2 `GET /castings` 🔒 `[any authenticated]`
Browses/lists casting calls (country-partitioned; SRS-FR-5.3, SRS-FR-7.1).

**Query Parameters:** `country` (required for primary browsing view), `category`, `status`, `page`, `limit`

**Response `200 OK`:** paginated list of casting call summaries.

---

### 6.3 `GET /castings/{castingCallId}` 🔒 `[any authenticated]`
Retrieves full detail of a single casting call.

**Response `200 OK`:** full casting call object.

**Errors:** `404 NOT_FOUND`

---

### 6.4 `PUT /castings/{castingCallId}` 🔒 `[industry_professional, pageant_organizer — creator only]`
Edits an existing (still-open) casting call.

**Response `200 OK`:** updated casting call.

**Errors:** `403 FORBIDDEN` (non-creator), `409 INVALID_STATE_TRANSITION` (editing a closed casting call)

---

### 6.5 `PATCH /castings/{castingCallId}/close` 🔒 `[industry_professional, pageant_organizer — creator only]`
Manually closes a casting call (SRS-FR-5.5).

**Response `200 OK`:**
```json
{ "success": true, "data": { "id": "665f1a2b3c4d5e6f7a8b9c2f", "status": "closed" } }
```

---

### 6.6 `GET /castings/{castingCallId}/applicants` 🔒 `[industry_professional, pageant_organizer — creator only]`
Lists applicants for a casting call, including profile summary and match score (joins Application + MatchResult data — SRS-FR-6.3).

**Query Parameters:** `status`, `sortBy` (`suitabilityScore` | `appliedAt`), `page`, `limit`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "applicationId": "665f1a2b3c4d5e6f7a8b9c4b",
      "modelProfile": { "id": "665f1a2b3c4d5e6f7a8b9c1e", "fullName": "Amara Fernando", "country": "Sri Lanka", "heightCm": 172 },
      "status": "submitted",
      "suitabilityScore": 88,
      "appliedAt": "2026-03-15T08:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalItems": 34, "totalPages": 2 }
}
```

---

## 7. Module: Applications (`/applications`)

### 7.1 `POST /applications` 🔒 `[model]`
Submits an application to a casting call.

**Request Body:**
```json
{ "castingCallId": "665f1a2b3c4d5e6f7a8b9c2f" }
```

**Response `201 Created`:** the created application object with `status: "submitted"`.

**Errors:** `409 DUPLICATE_RESOURCE` (duplicate application — SRS-FR-6.2), `409 INVALID_STATE_TRANSITION` (casting call closed/expired — SRS-FR-5.7), `403 FORBIDDEN` (non-model role)

---

### 7.2 `GET /applications/me` 🔒 `[model]`
Lists all applications submitted by the authenticated talent user, with current status (SRS-FR-6.6).

**Response `200 OK`:** paginated array of applications, each including embedded casting-call summary.

---

### 7.3 `PATCH /applications/{applicationId}/status` 🔒 `[industry_professional, pageant_organizer — casting call creator only]`
Updates an application's status (SRS-FR-6.4).

**Request Body:**
```json
{ "status": "shortlisted" }
```
Valid values: `shortlisted`, `rejected`, `accepted`.

**Response `200 OK`:** updated application; triggers Notification Service (SRS-FR-6.5) asynchronously.

**Errors:** `400 VALIDATION_ERROR` (invalid status value), `403 FORBIDDEN` (non-creator)

---

## 8. Module: Search (`/search`)

### 8.1 `GET /search/talent` 🔒 `[industry_professional, pageant_organizer, admin]`
Searches/filters talent profiles (SRS-FR-7.1 – 7.5).

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `country` | String | Yes | Primary scope (SRS-FR-7.1) |
| `category` | String | No | Talent category |
| `minAge` / `maxAge` | Number | No | Age range |
| `minHeightCm` / `maxHeightCm` | Number | No | Height range |
| `experienceLevel` | String | No | Filter by experience |
| `skills` | String (comma-separated) | No | Skill match filter |
| `hasPortfolio` | Boolean | No | Filter for profiles with ≥1 portfolio item |
| `page` / `limit` | Number | No | Pagination |

**Response `200 OK`:** paginated list of matching, published `ModelProfile` summaries.

**Errors:** `400 VALIDATION_ERROR` (missing required `country`)

---

## 9. Module: Matching & Recommendation (`/match`)

### 9.1 `POST /match/castings/{castingCallId}/compute` 🔒 `[industry_professional, pageant_organizer — creator only]`
Triggers (re)computation of matching scores for a casting call against the eligible candidate pool (SRS-FR-8.1 – 8.2).

**Response `202 Accepted`:**
```json
{ "success": true, "data": { "message": "Matching computation started", "castingCallId": "665f1a2b3c4d5e6f7a8b9c2f" } }
```
*(May be synchronous for small candidate pools, returning results directly with `200 OK`, or asynchronous via job queue for larger pools — see Architecture §12 Future Considerations.)*

---

### 9.2 `GET /match/castings/{castingCallId}/results` 🔒 `[industry_professional, pageant_organizer — creator only]`
Retrieves ranked match results for a casting call.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "modelProfileId": "665f1a2b3c4d5e6f7a8b9c1e",
      "fullName": "Amara Fernando",
      "suitabilityScore": 88,
      "scoreBreakdown": { "age": 20, "height": 20, "category": 25, "experience": 13, "skills": 10 }
    }
  ]
}
```
Supports SRS-FR-8.3 (transparency of contributing attributes).

---

### 9.3 `GET /match/recommendations/castings` 🔒 `[model]`
Returns recommended open casting calls for the authenticated talent user based on profile attributes (SRS-FR-8.4).

**Response `200 OK`:** array of recommended casting call summaries with relevance score.

---

## 10. Module: Messaging (`/messages`)

### 10.1 `POST /messages/threads` 🔒 `[industry_professional, pageant_organizer]`
Initiates a message thread with an applicant, bound to an application context (SRS-FR-9.1, SRS-FR-9.5).

**Request Body:**
```json
{ "applicationId": "665f1a2b3c4d5e6f7a8b9c4b" }
```

**Response `201 Created`:** the created (or existing, if already present) thread object.

---

### 10.2 `GET /messages/threads` 🔒 `[any authenticated]`
Lists the authenticated user's message threads, sorted by `lastMessageAt` descending, with unread indicators.

**Response `200 OK`:** paginated array of thread summaries.

---

### 10.3 `GET /messages/threads/{threadId}` 🔒 `[thread participant only]`
Retrieves full message history for a thread.

**Response `200 OK`:** array of message objects, chronologically ordered.

**Errors:** `403 FORBIDDEN` (non-participant)

---

### 10.4 `POST /messages/threads/{threadId}` 🔒 `[thread participant only]`
Sends a new message within a thread (SRS-FR-9.2).

**Request Body:**
```json
{ "content": "Thank you for your application — are you available for a fitting on the 20th?" }
```

**Response `201 Created`:** the created message object.

**Errors:** `400 VALIDATION_ERROR` (empty/over-length content), `403 FORBIDDEN`

---

### 10.5 `PATCH /messages/{messageId}/read` 🔒 `[recipient only]`
Marks a message as read (SRS-FR-9.4).

**Response `200 OK`:** `{ "success": true, "data": { "id": "...", "isRead": true } }`

---

## 11. Module: Administration (`/admin`)

All endpoints in this module require `[admin]` role.

### 11.1 `GET /admin/verifications` 🔒 `[admin]`
Lists pending verification requests (SRS-FR-10.1).

**Query Parameters:** `status` (default `pending`), `page`, `limit`

**Response `200 OK`:** paginated array of `VerificationRecord` objects with linked user summary.

---

### 11.2 `PATCH /admin/verifications/{recordId}` 🔒 `[admin]`
Approves or rejects a verification request (SRS-FR-10.2).

**Request Body:**
```json
{ "status": "verified", "reviewNotes": "ID and agency letter confirmed." }
```

**Response `200 OK`:** updated `VerificationRecord`; also updates the linked `User.verificationStatus`; logs the action to `admin_action_logs`.

---

### 11.3 `PATCH /admin/users/{userId}/suspend` 🔒 `[admin]`
Suspends (soft-deactivates) a user account (SRS-FR-10.3).

**Request Body:** `{ "reason": "Multiple fraud reports confirmed" }`

**Response `200 OK`:** `{ "success": true, "data": { "id": "...", "isActive": false } }`

---

### 11.4 `DELETE /admin/castings/{castingCallId}` 🔒 `[admin]`
Removes a policy-violating casting call (SRS-FR-10.3).

**Response `204 No Content`**

---

### 11.5 `GET /admin/reports` 🔒 `[admin]`
Lists the reported-content moderation queue (SRS-FR-10.4).

**Query Parameters:** `status` (default `open`), `targetEntityType`, `page`, `limit`

**Response `200 OK`:** paginated array of `Report` objects.

---

### 11.6 `PATCH /admin/reports/{reportId}` 🔒 `[admin]`
Resolves or dismisses a report.

**Request Body:** `{ "status": "resolved", "notes": "Casting call removed per policy violation." }`

**Response `200 OK`:** updated `Report` object.

---

### 11.7 `GET /admin/metrics` 🔒 `[admin]`
Returns platform-level summary metrics (SRS-FR-10.5).

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalUsers": { "model": 210, "industry_professional": 45, "pageant_organizer": 8, "admin": 2 },
    "activeCastingCalls": 34,
    "totalApplications": 612,
    "verifiedProfileRatio": 0.61
  }
}
```

---

### 11.8 `GET /admin/logs` 🔒 `[admin]`
Retrieves administrative action history (SRS-FR-10.6).

**Query Parameters:** `adminId`, `actionType`, `page`, `limit`

**Response `200 OK`:** paginated array of `AdminActionLog` entries.

---

## 12. Module: Reports (`/reports`)

### 12.1 `POST /reports` 🔒 `[any authenticated]`
Files a report against a profile, casting call, or message.

**Request Body:**
```json
{ "targetEntityType": "casting_call", "targetEntityId": "665f1a2b3c4d5e6f7a8b9c2f", "reason": "Suspected fraudulent listing" }
```

**Response `201 Created`:** the created `Report` object with `status: "open"`.

---

## 13. Module: System / Health

### 13.1 `GET /health`
Public health-check endpoint for uptime monitoring (Architecture §9.3).

**Auth:** None

**Response `200 OK`:**
```json
{ "success": true, "data": { "status": "healthy", "timestamp": "2026-09-08T10:00:00Z" } }
```

---

## 14. Endpoint Summary Table

| Method | Endpoint | Role(s) | SRS Traceability |
|---|---|---|---|
| POST | `/auth/register` | Public | SRS-FR-1.1, 1.2, 1.8 |
| POST | `/auth/login` | Public | SRS-FR-1.4, 1.5, 1.10 |
| POST | `/auth/logout` | Any authenticated | SRS-FR-1.6 |
| POST | `/auth/refresh-token` | Public (cookie) | — |
| POST | `/auth/revoke-token` | Admin | — |
| POST | `/auth/forgot-password` | Public | SRS-FR-1.7 |
| POST | `/auth/reset-password` | Public | SRS-FR-1.7 |
| GET | `/auth/me` | Any authenticated | — |
| GET | `/profiles/me` | Any authenticated | SRS-FR-3.1–3.4 |
| PUT | `/profiles/me` | Any authenticated | SRS-FR-3.1–3.7 |
| GET | `/profiles/{id}` | Any authenticated | SRS-FR-3.6 |
| GET | `/profiles` | Recruiter/Admin | — |
| POST | `/portfolio/upload` | Model | SRS-FR-4.1–4.5 |
| GET | `/portfolio/{profileId}` | Any authenticated | — |
| PATCH | `/portfolio/{itemId}/reorder` | Model (owner) | SRS-FR-4.6 |
| DELETE | `/portfolio/{itemId}` | Model (owner) | SRS-FR-4.6 |
| POST | `/castings` | Recruiter | SRS-FR-5.1, 5.2 |
| GET | `/castings` | Any authenticated | SRS-FR-5.3, 7.1 |
| GET | `/castings/{id}` | Any authenticated | — |
| PUT | `/castings/{id}` | Recruiter (creator) | SRS-FR-5.4 |
| PATCH | `/castings/{id}/close` | Recruiter (creator) | SRS-FR-5.5 |
| GET | `/castings/{id}/applicants` | Recruiter (creator) | SRS-FR-6.3 |
| POST | `/applications` | Model | SRS-FR-6.1, 6.2 |
| GET | `/applications/me` | Model | SRS-FR-6.6 |
| PATCH | `/applications/{id}/status` | Recruiter (creator) | SRS-FR-6.4, 6.5 |
| GET | `/search/talent` | Recruiter/Admin | SRS-FR-7.1–7.5 |
| POST | `/match/castings/{id}/compute` | Recruiter (creator) | SRS-FR-8.1, 8.2 |
| GET | `/match/castings/{id}/results` | Recruiter (creator) | SRS-FR-8.2, 8.3 |
| GET | `/match/recommendations/castings` | Model | SRS-FR-8.4 |
| POST | `/messages/threads` | Recruiter | SRS-FR-9.1, 9.5 |
| GET | `/messages/threads` | Any authenticated | — |
| GET | `/messages/threads/{id}` | Thread participant | — |
| POST | `/messages/threads/{id}` | Thread participant | SRS-FR-9.2, 9.3 |
| PATCH | `/messages/{id}/read` | Recipient | SRS-FR-9.4 |
| GET | `/notifications` | Any authenticated | SRS-FR-9.x |
| PATCH | `/notifications/{id}/read` | Owner | — |
| PATCH | `/notifications/read-all` | Owner | — |
| GET | `/admin/verifications` | Admin | SRS-FR-10.1 |
| PATCH | `/admin/verifications/{id}` | Admin | SRS-FR-10.2 |
| PATCH | `/admin/users/{id}/suspend` | Admin | SRS-FR-10.3 |
| DELETE | `/admin/castings/{id}` | Admin | SRS-FR-10.3 |
| GET | `/admin/reports` | Admin | SRS-FR-10.4 |
| PATCH | `/admin/reports/{id}` | Admin | SRS-FR-10.4 |
| GET | `/admin/metrics` | Admin | SRS-FR-10.5 |
| GET | `/admin/logs` | Admin | SRS-FR-10.6 |
| POST | `/reports` | Any authenticated | SRS-FR-10.4 |
| GET | `/health` | Public | NFR-REL |

---

## 15. Security Notes for API Consumers
- Access tokens are kept in memory (JavaScript variable) on the client — **not** in `localStorage` (XSS risk) or unprotected cookies (CSRF risk).
- Refresh tokens are stored in HTTP-only, Secure, SameSite=Strict cookies — the browser handles them automatically; frontend JavaScript never accesses them directly (see §2.8).
- All list endpoints enforce a maximum `limit` cap (100) regardless of client-supplied value, to prevent resource-exhaustion abuse.
- File upload endpoints enforce server-side MIME-type and size validation regardless of client-side checks (NFR-SEC-4).

---

## 16. WebSocket / Real-Time Event Specification (Socket.io)

> This section specifies the Socket.io event contract for the **Messaging Module** (SRS-FR-9.2, 9.3, 9.4). REST endpoints (§10) handle thread creation and message history; Socket.io handles real-time delivery.

### 16.1 Connection & Authentication

```javascript
// Client-side connection
const socket = io('wss://api.talentmarketplace.live', {
  auth: { token: accessToken }  // Same JWT from POST /auth/login
});

socket.on('connect_error', (err) => {
  if (err.message === 'UNAUTHORIZED') { /* redirect to login */ }
});
```

On successful connection, the socket is auto-joined to `user:{userId}` for targeted delivery.

### 16.2 Events Emitted by Client

| Event Name | Payload | Description |
|---|---|---|
| `message:send` | `{ threadId, content }` | Send a new message to a thread |
| `message:read` | `{ messageId }` | Mark a message as read |
| `thread:join` | `{ threadId }` | Join a thread room to receive its events |
| `thread:leave` | `{ threadId }` | Leave a thread room |

### 16.3 Events Emitted by Server

| Event Name | Delivered To | Payload | Description |
|---|---|---|---|
| `message:new` | Thread participants | `{ id, threadId, senderId, content, sentAt }` | New message sent in thread |
| `message:read_ack` | Thread participants | `{ messageId, readAt, readByUserId }` | Message was read |
| `notification:new` | `user:{userId}` room | `{ id, type, title, body, entityType, entityId, createdAt }` | New in-app notification |
| `thread:typing` | Thread room (excluding sender) | `{ threadId, userId, isTyping }` | Typing indicator (P2) |
| `connect_error` | Connecting socket | `{ message: 'UNAUTHORIZED' }` | Token invalid or expired |

### 16.4 Offline Delivery
Messages sent while a recipient is offline are persisted to MongoDB. On reconnect, the client calls `GET /messages/threads/{id}` to retrieve missed messages, then joins the room for live delivery.

### 16.5 Error Event Format
```json
{ "errorCode": "THREAD_NOT_FOUND", "message": "Thread does not exist or you are not a participant." }
```

---

## 17. Notifications REST Endpoints (`/notifications`)

### 17.1 `GET /notifications` 🔒 `[any authenticated]`
Returns in-app notifications for the authenticated user, newest first.

**Query Parameters:** `?unreadOnly=true&page=1&limit=20`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "665f1a...",
      "type": "application_status_change",
      "title": "Application Shortlisted",
      "body": "Your application for 'Miss Sri Lanka 2026' has been shortlisted.",
      "entityType": "application",
      "entityId": "665f2b...",
      "isRead": false,
      "createdAt": "2026-10-01T09:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalItems": 5, "totalPages": 1 }
}
```

**Notification types:** `application_status_change`, `new_message`, `casting_call_match`, `verification_approved`, `verification_rejected`, `casting_call_deadline_reminder`

### 17.2 `PATCH /notifications/{id}/read` 🔒 `[owner]`
Marks a specific notification as read.
**Response `200 OK`:** `{ "success": true, "data": { "isRead": true } }`

### 17.3 `PATCH /notifications/read-all` 🔒 `[owner]`
Marks all of the authenticated user's unread notifications as read.
**Response `200 OK`:** `{ "success": true, "data": { "markedRead": 5 } }`

---

## 18. Postman Collection
A Postman collection mirroring this specification (one request per endpoint, organized into folders matching §3–§13 + §17, with environment variables for `{{baseUrl}}` and `{{authToken}}`) shall be maintained alongside the codebase and used for manual and automated (Newman CI) API testing, per the Test Plan document.

---

*End of API Specification v2.0 — Updated 2026-09-08.*


---

*End of API Specification.*
