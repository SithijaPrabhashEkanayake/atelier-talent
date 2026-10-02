# User Guide / Help Docs
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | End-User Guide / Help Documentation |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Build Phase |
| **Companion Documents** | SRS v2.0 (§3.1–3.9), UI/UX Design Document v2.0 (§8.1–8.15 Screens), API Specification v2.0, Admin Guide v2.0 |
| **Audience** | Models, Industry Professionals, Pageant Organizers (all non-Admin roles) |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial end-user guide covering registration, onboarding, and role-specific workflows for Models, Industry Professionals, and Pageant Organizers | Product/Engineering Team |
| 2.0 | 2026-09-08 | Updated companion document references to v2.0; added notes about Cloudinary media upload behavior and Socket.io real-time messaging; updated status to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This guide explains how to use the platform from the perspective of the three non-administrative roles: **Model**, **Industry Professional**, and **Pageant Organizer**. It is written as a how-to for the actual end user — a Model building a portfolio, a recruiter posting a casting call — not as a technical specification. For administrative tasks (verification, moderation), see the companion **Admin Guide**.

### 1.2 Who This Guide Is For
Anyone using the platform in one of the three talent/recruiter roles, including UAT participants during the pilot evaluation (Test Plan §UAT).

### 1.3 The Three Roles at a Glance

| Role | What You Do on the Platform |
|---|---|
| **Model** | Build a profile and portfolio, browse and apply to casting calls, track your applications, message recruiters |
| **Industry Professional** | Build an organization profile, post and manage casting calls, search talent, review and shortlist applicants, message talent |
| **Pageant Organizer** | Same core capabilities as an Industry Professional, scoped to pageant-specific casting calls and institutional profile fields |

---

## 2. Getting Started

### 2.1 Creating an Account
1. From the homepage, click **Register**.
2. **Step 1 — Account:** enter your email and choose a password. A strength meter shows whether your password is Weak, Fair, or Strong — aim for at least "Fair" (minimum 8 characters, at least one letter and one number).
3. Choose your role by tapping one of the three large role cards: **Model**, **Industry Professional**, or **Pageant Organizer**. Choose carefully — this determines which profile fields and features you'll see; it is not something you casually switch later.
4. **Step 2 — Role details** (shown based on your Step 1 choice):
   - **Model:** declare your representation status — **Freelance** or **Agency-Represented**.
   - **Industry Professional:** select your organization type — Brand, Director, Agency, or Photographer.
   - **Pageant Organizer:** enter your organization name and country of registration.
5. Click **Create account**.

### 2.2 Logging In
Go to the **Login** page, enter your email and password, and click **Log in**. If your credentials are incorrect, you'll see a generic "Incorrect email or password" message — for your security, the system never reveals which of the two was wrong.

### 2.3 Forgot Your Password?
Click **Forgot password?** on the login page, enter your email, and follow the reset link sent to you. The link is single-use and time-limited — if it expires, simply request a new one.

### 2.4 First-Time Onboarding
Immediately after registering, you'll walk through a short setup wizard before reaching your main dashboard:
1. **Select your country.** This scopes what you see (casting calls or talent, depending on your role) by default. You can change it any time later from the top bar, or choose "Decide later" to skip for now — a small reminder chip will stay visible until you set one.
2. **Build your profile.** Fill in the fields relevant to your role (see §3, §5, or §6 below for detail per role).
3. **(Models only) Add your first portfolio items.** This step is optional — you can click "Skip for now, I'll add this later" and come back to it whenever you're ready.
4. You'll land on a short summary screen with a **Go to Dashboard** button to finish onboarding.

### 2.5 Understanding the Navigation
- **Top bar** (always visible): logo, your country selector, a search icon, a notification bell, and your profile menu.
- **Sidebar** (left side on desktop, behind a menu icon on mobile): your role-specific main menu. You will only ever see menu items relevant to your role — there are no greyed-out "locked" features to tempt you toward a feature you don't have.
- **Country selector:** click it any time to change your active country scope. Changing it updates your casting-call or talent-search results immediately, with a small confirmation message ("Showing results for Sri Lanka") — no full page reload. If you want to browse without a country restriction, use the **"Browse globally"** toggle next to the selector.

---

## 3. For Models: Building Your Profile

### 3.1 Editing Your Profile (`My Profile`)
Your profile screen shows two things side by side: a live preview of your profile card on the left — exactly as recruiters will see it, including your verification badge — and your editable form on the right. As you fill in fields, watch the preview update in real time.

The form is organized into sections:
- **Basic Info** — name, country, date of birth (your age is calculated and shown publicly, not your birthdate).
- **Measurements & Category** — height, measurements, professional category.
- **Experience History** — your prior work/experience.
- **Representation Status** — Freelance or Agency-Represented (set at registration, editable here).
- **Social Links** — optional Instagram/TikTok handles, clearly labeled as "unverified external references" — these are for context, not part of the platform's verification process.
- **Verification** — upload your verification document(s) here; your status shows as **Pending** (gold clock icon), **Verified** (green checkmark), or **Unverified** (grey outline) depending on where your submission is in the review process.

### 3.2 Publishing Your Profile
Your profile must have all mandatory fields completed before it becomes visible in recruiter search results. If something required is missing, you'll see it flagged when you try to publish.

### 3.3 What "Verified" Means
A **Verified** badge means an administrator reviewed your submitted documents and found them consistent with your profile. It is an administrative trust signal, not a legal identity certification — recruiters are shown this same framing, so there's no need to worry it overstates what was checked.

### 3.4 Building Your Portfolio (`My Portfolio`)
1. Go to **My Portfolio**.
2. Click the **Upload** tile (always the first tile in your portfolio grid) to add a photo (JPEG, PNG, or WebP) or video (MP4).
3. Choose a category for each item: **Photos**, **Runway**, **Commercial**, or **Achievements** — these tabs help recruiters browse your work by type.
4. Watch the upload progress directly on the card — it moves from a loading skeleton, to a progress ring, to your finished thumbnail. If an upload fails (wrong file type or too large), you'll see a clear error and a retry option.
5. **Reorder** items within a category by dragging them.
6. **Delete** an item any time using its card's delete option (this asks for confirmation, since it's not reversible).

**File limits:** images up to 25MB, videos up to 200MB (exact limits may be tuned; if your upload is rejected for size, try compressing the file first).

### 3.5 Your Dashboard
Your Model dashboard shows three things:
- **Profile completeness** — a progress bar and a specific suggestion (e.g., "add 2 more portfolio items to reach Strong").
- **Recommended for you** — casting calls the system suggests based on your profile attributes; scroll horizontally to browse them.
- **Your applications** — a compact status list of everything you've applied to.

---

## 4. For Models: Finding and Applying to Opportunities

### 4.1 Browsing Casting Calls
Go to **Browse Casting Calls**. Use the filter rail on the left (country — synced to your top-bar selector, category, deadline range) to narrow results. Each casting call card shows a cover image, title, the organization's name (with their verification badge if applicable), country, category, and a deadline countdown — cards show "5 days left" in gold when a deadline is close, as a helpful nudge.

### 4.2 Viewing a Casting Call and Applying
Click a card to see the full detail page: criteria (age range, height range, experience, category, country, deadline) and the full description. When you're ready, click **Apply Now** (on mobile, this button stays anchored at the bottom of your screen so it's always reachable). Confirm in the small popup that appears, and the button updates in place to **Applied ✓** — you cannot apply twice to the same casting call.

### 4.3 Tracking Your Applications
Go to **My Applications** to see everything you've applied to, grouped by status: **Submitted**, **Shortlisted**, or **Rejected**. Rejected applications stay visible (just visually muted) so you keep a full history rather than losing track of past activity. Click any row to go back to that casting call's details.

### 4.4 Getting Notified
When a recruiter changes your application's status, you'll see an in-app notification via the bell icon in the top bar.

---

## 5. For Industry Professionals: Managing Your Organization

### 5.1 Editing Your Organization Profile (`My Profile`)
Fill in your organization name, type (Brand, Director, Agency, or Photographer), country, and a description of your prior work. As with the Model profile, complete all mandatory fields before your profile is fully active for talent-facing visibility where relevant.

### 5.2 Your Dashboard
Your dashboard leads with a row of KPI tiles — active casting calls, new applicants this week, unread messages — followed by a table of **My Casting Calls** (title, status, applicant count, deadline, and quick actions to View, Edit, or Close). This is a table-first view by design, since recruiters typically need to triage volume rather than browse casually.

---

## 6. For Industry Professionals & Pageant Organizers: Posting Casting Calls

*(This section applies equally to both roles; where noted, Pageant Organizer fields differ slightly.)*

### 6.1 Creating a Casting Call
Go to **My Casting Calls** and click **Create New**. The form is grouped into sections:
- **Basics** — title, description, cover image.
- **Criteria** — country, category, age range (slider), height range (slider), experience level, and required skills (add as tags).
- **Timing** — application deadline (date picker).
- **Visibility** — save as **Draft** or **Publish** immediately.

As you fill the form, a **"Preview as talent sees it"** panel shows exactly how your listing will appear to Models browsing casting calls — check this before publishing to make sure your listing reads the way you intend.

### 6.2 Publishing Requirements
All mandatory fields must be complete before you can publish — the system will flag anything missing.

### 6.3 Editing a Casting Call
You can edit your own casting call any time before its deadline. Click **Edit** from your casting calls table or from the call's detail page.

### 6.4 Closing a Casting Call
Click **Close** to manually stop accepting applications at any time — useful once you've filled the role. If you don't close it manually, the system automatically marks it **Closed** once the deadline passes, so open applications don't accumulate past their intended window.

### 6.5 Ownership Note
You can only edit or close casting calls you created. This is enforced by the system, not just hidden in the interface — you will never be able to modify another organization's listing, even by direct link.

---

## 7. For Industry Professionals & Pageant Organizers: Finding and Managing Talent

### 7.1 Talent Search
Go to **Talent Search**. Filters here are richer than the casting-browse filters available to Models: country, age range, height range, category, experience, skills (multi-select), a "has verified profile" toggle, and a "has at least 3 portfolio items" toggle for filtering by portfolio completeness. Results use the same profile-card style you'll see throughout the platform, for consistency.

### 7.2 Reviewing Applicants for a Specific Casting Call
Open a casting call and go to its **Applicants** tab. You'll see a dense table: applicant thumbnail, name, verification badge, the key attributes your casting call actually filtered on (so you don't have to open each profile just to compare), applied date, and status. Click a row to open a side panel with the applicant's full profile and portfolio, without losing your place in the table.

**Available actions per applicant:**
- **Shortlist** — move them forward in your process.
- **Reject** — close them out.
- **Message** — start a conversation (see §8).
- **View full profile** — see everything, including their portfolio.

You can also **select multiple applicants** and shortlist them together if you're moving a batch forward at once.

### 7.3 Using Match Results
Open a casting call and go to its **Match Results** tab. This shows candidates ranked by a suitability score (0–100%), with a hover tooltip breaking down which criteria matched or didn't (e.g., age ✓, height ✓, skills partial). A note above the list reminds you: **these are suggested matches based on profile attributes, not a decision** — always review a candidate yourself before shortlisting. The system never makes the final call; that's always yours.

### 7.4 Recommended Opportunities Reaching Talent
If you're wondering why a Model applied to your casting call without your having found them first — the system also proactively recommends relevant open casting calls to Models based on their own profile attributes, so discovery flows in both directions.

---

## 8. Messaging (All Roles)

### 8.1 Where Messaging Lives
Go to **Messages**. You'll see a two-pane inbox: a list of conversation threads on the left (showing the other party's name, their verification badge, a preview of the last message, and an unread-message dot if there's something new), and the active conversation on the right.

### 8.2 Starting and Replying to Messages
- **Recruiters** can start a message thread with an applicant directly from the Applicant Management view (§7.2).
- **Models** can reply to any message they've received.
- Every conversation thread is tied to a specific casting call/application — you'll see a small pill at the top of the thread linking back to that context. This isn't a general inbox for unrelated direct messages; conversations only happen where there's a shared application context, which helps keep messaging relevant and reduces unwanted contact.

### 8.3 Reading Your Messages
Unread conversations show a small red dot in your thread list until you open them.

---

## 9. Account Settings (All Roles)

Go to your profile menu (top-right avatar) → **Account Settings** to:
- Change your password.
- Adjust notification preferences.

---

## 10. Frequently Asked Questions

**Q: I registered as the wrong role — can I switch?**
Role is set at registration and is not a self-service toggle (it's tied to your entire profile structure). If you registered incorrectly, contact platform support/an administrator for help.

**Q: Why can't I see a "Post Casting Call" option?**
That feature is only available to Industry Professional and Pageant Organizer accounts — Models use the platform to browse and apply, not to post opportunities. This is intentional role separation, not a bug.

**Q: My verification is still "Pending" — how long does it take?**
Verification is reviewed by an administrator, not processed automatically. There's no fixed guaranteed turnaround in this release, but you'll see your status update to Verified or Rejected (with a reason, if rejected) once it's been reviewed.

**Q: Can I message a recruiter/model I haven't applied to or heard from?**
Not in this release — messaging requires a shared casting call/application context (§8.2), which is a deliberate anti-spam design choice, not a missing feature.

**Q: My portfolio upload failed — why?**
Check that your file is a supported type (JPEG/PNG/WebP for images, MP4 for video) and within the size limit (25MB image / 200MB video). The error message on the card will tell you which check failed.

**Q: I applied to a casting call by mistake — can I withdraw?**
This release does not include a self-service application-withdrawal action. If this becomes a real problem during your use of the platform, that's useful UAT feedback to flag.

**Q: What does the countdown chip on a casting call mean?**
It shows how many days remain until the application deadline; it turns gold when fewer than 3 days remain, as a visual nudge if you're planning to apply.

**Q: Why does "Browse globally" exist if I already picked a country?**
Your country selection is a helpful default scope, not a hard restriction — "Browse globally" lets you see opportunities or talent outside your chosen country whenever you want to look more broadly.

---

## 11. Getting Help

If you run into an issue not covered here during UAT/pilot use, use the **Help / Support** link available from the shared navigation area, or reach out directly to the platform administrator running your evaluation session.

---

## 12. Traceability to Other Documents

| This Guide | Source / Cross-Reference |
|---|---|
| §2 Registration/Onboarding | SRS-FR-1.1, FR-1.2, FR-1.8; UI/UX Design Document §8.1–8.3 |
| §3 Model Profile/Portfolio | SRS-FR-3.1, FR-3.2, FR-3.5–3.7, FR-4.1–4.7; UI/UX Design Document §8.5–8.6 |
| §4 Browsing/Applying | SRS-FR-5.3, FR-6.1–6.6; UI/UX Design Document §8.7–8.9 |
| §5–6 Organization Profile & Casting Calls | SRS-FR-3.3–3.4, FR-5.1–5.7; UI/UX Design Document §8.10–8.11 |
| §7 Search, Applicants, Matching | SRS-FR-7.1–7.5, FR-8.1–8.5; UI/UX Design Document §8.12–8.14 |
| §8 Messaging | SRS-FR-9.1–9.5; UI/UX Design Document §8.15 |
| Admin-specific tasks | Out of scope here — see companion **Admin Guide** |

---

*End of User Guide / Help Docs.*
