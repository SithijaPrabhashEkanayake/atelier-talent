# Admin Guide
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Administrator User Guide |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Build Phase |
| **Companion Documents** | SRS v2.0 (§3.10 Administration), UI/UX Design Document v2.0 (§8.16–8.20 Admin screens), API Specification v2.0 (Admin module endpoints), Security & Data Protection Policy v2.0, Test Plan & QA Strategy v2.0 |
| **Audience** | Platform Administrators (Admin role) |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial administrator guide covering verification, moderation, user management, and audit logging workflows | Product/Engineering Team |
| 2.0 | 2026-09-08 | Updated companion document references to v2.0; added note about Socket.io real-time notification delivery visible in admin console; updated status to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This guide explains how to use the Administration Console to perform every task available to the Admin role: reviewing and deciding verification requests, moderating reported content, managing user/organization accounts, and reviewing the audit log. It is written for the person actually operating the admin account during pilot/UAT — not as a technical specification (that is the SRS and API Specification's job), but as an operational how-to.

### 1.2 Who This Guide Is For
Anyone assigned the Administrator role on the platform — during the academic pilot, this is expected to be the project owner acting in the admin capacity, and/or any additional trusted reviewer designated for UAT.

### 1.3 What the Admin Role Can and Cannot Do
Per SRS §3.10 and §3.2 (RBAC), the Admin role is scoped to platform oversight — it is **not** a superuser role that can act as any other user:

| Admin Can | Admin Cannot |
|---|---|
| Review and decide verification requests | Create or edit a Model/Industry/Pageant Organizer profile on a user's behalf |
| Suspend or remove a profile, organization, or casting call violating policy | Apply to casting calls or send messages as another user |
| View the reported-content moderation queue and act on it | Access another user's password (never stored in reversible form — Security Policy §3.1) |
| View summary platform metrics | Process payments (out of scope for this release — PRD §6.2) |
| View the admin action log | Edit the action log's own history (it is append-only/read-only by design) |

---

## 2. Getting Started

### 2.1 Logging In
1. Navigate to the platform's login page.
2. Enter your Administrator account email and password.
3. Upon successful login, you are directed to the **Admin Overview** dashboard (`/admin`), not the standard talent/recruiter dashboard — the interface adapts entirely based on your account's role.

### 2.2 The Admin Console Navigation
The Admin Console groups its functions under a dedicated navigation section, distinct from the Model/Industry/Pageant Organizer views:

```
Admin Console
├── Admin Overview        (/admin)
├── Verification Queue    (/admin/verifications)
├── Reports / Moderation  (/admin/reports)
├── Users & Organizations (/admin/users)
└── Admin Action Log      (/admin/logs)
```

### 2.3 Admin Overview Dashboard (`/admin`)
This is your landing screen and is designed around one principle: **see what needs your attention right now, and act on it in as few clicks as possible.**

It shows:
- A row of key metrics: total users by role, active casting calls, total applications submitted, and the verified-profile ratio.
- Two priority queues surfaced directly on this screen: **Pending Verifications** (with a count and a "Review" button) and **Open Reports** (with a count and a "Review" button).

If both queues show zero, the screen displays a calm "You're all caught up ✓" state — this is expected and not an error.

---

## 3. Reviewing Verification Requests

### 3.1 Purpose of Verification
Verification is an **administrative trust signal**, not a legal identity guarantee (per PRD §13 and the Security & Data Protection Policy §8.1). When you approve a request, the platform displays "Profile verified by [Platform] admin team" on that profile — it does not claim to have confirmed the person's legal identity. Keep this distinction in mind when deciding borderline cases: you are assessing whether the submitted documentation is *consistent and plausible*, not performing a legal identity check.

### 3.2 Accessing the Queue
Navigate to **Verification Queue** (`/admin/verifications`) or click "Review" on the Pending Verifications tile from the Overview screen.

### 3.3 Reviewing a Submission
The queue is presented as a list of expandable cards, one per pending submission — not a dense table — since this is a repetitive, one-at-a-time review task. Each card shows:
- The submitted verification document(s), viewable inline (image viewer).
- The linked user's current profile summary (name, role, country, category) so you can cross-check consistency between the document and the profile.

### 3.4 Making a Decision
Each card has two clearly differentiated actions:

| Action | Effect |
|---|---|
| **Approve** (green) | Sets the profile's verification status to "Verified"; the badge becomes visible on that profile immediately |
| **Reject** (red) | Requires you to enter a reason note before confirming; sets the status to "Rejected" and the reason is stored for record-keeping |

Approving or rejecting immediately removes the item from your queue — there is no confirm-before-action modal, because this is designed for admin throughput on a repetitive task. Instead, a brief **undo toast appears for 5 seconds** after each decision. If you click undo within that window, the decision is reversed and the item returns to the queue. After the 5-second window closes, the decision is final and can only be changed by processing a new verification submission from the user (if they resubmit).

**Practical guidance:**
- If a submitted document is illegible, incomplete, or clearly does not match the profile's stated details, reject with a specific, actionable reason note (e.g., "Document image is unreadable — please resubmit a clearer photo") so the user knows what to correct.
- If you are uncertain rather than confident either way, it is better to reject with a note asking for clarification than to approve a doubtful submission — the badge's credibility depends on consistent standards.
- Process the queue in the order presented (oldest first) unless a specific reason requires prioritizing a different item, to keep wait times fair across users.

### 3.5 What Happens After a Decision
- **Approve:** the user's profile now displays the Verified badge in search results and their profile page; this is logged to the Admin Action Log (§6).
- **Reject:** the user is not notified with legal/administrative language — they see their verification status return to a state that lets them resubmit documents; the rejection reason you entered is available to them so they understand what to fix.

---

## 4. Moderating Reported Content

### 4.1 Accessing the Queue
Navigate to **Reports / Moderation** (`/admin/reports`) or click "Review" on the Open Reports tile from the Overview screen. This uses the same queue-card pattern as the Verification Queue.

### 4.2 Reviewing a Report
Each report card shows:
- The reported entity type and a preview (a profile summary, a casting call's details, or a message snippet, depending on what was reported).
- The reporter's stated reason for flagging it.

### 4.3 Taking Action
Two action paths are available per report:

| Action | Effect |
|---|---|
| **Dismiss** | Closes the report with no action taken against the reported entity — use this when the report does not describe an actual policy violation |
| **Take Action** | Opens contextual sub-actions depending on the entity type: **Suspend User** (for a profile/account) or **Remove Casting Call** (for a casting call) |

### 4.4 Suspending an Account vs. Removing a Casting Call
- **Suspend User** deactivates the account (it becomes invisible in search/discovery and the user cannot log in to perform normal actions) without permanently deleting their data — this preserves the ability to reverse the decision if needed and preserves records for any pending applications.
- **Remove Casting Call** takes the specific casting call down from public visibility; it does not suspend the recruiter's account unless you separately decide the account itself warrants suspension.

### 4.5 Judgment Guidance for Moderation Decisions
- A single report is not automatic proof of a violation — read the reported content/context yourself before deciding, rather than acting purely on the reporter's characterization.
- Reserve **Suspend User** for genuine policy violations (fraud indicators, harassment, clearly fake information) — it is a high-impact, less-frequent action, which is why (unlike verification decisions) taking it **does require a confirmation modal** before it's finalized. This is a deliberate difference from the Verification Queue's undo-toast pattern: suspension is rare and consequential enough to warrant a blocking confirmation rather than an easily-reversed quick action.
- If you are ever unsure whether a report describes a genuine violation of platform policy versus a personal dispute between two users (e.g., a disagreement over a casting outcome, not an actual policy breach), lean toward **Dismiss** and consider whether the platform's policy itself needs clarifying language, rather than using account suspension to settle a dispute.

---

## 5. Managing Users & Organizations

### 5.1 Accessing the List
Navigate to **Users & Organizations** (`/admin/users`). This is a searchable, filterable table — filter by email, role, verification status, and active/suspended status; sortable by joined date.

### 5.2 What You Can See
Each row shows the account's email, role, verification status, active/suspended state, and join date. This view is for oversight and account-level moderation — it is not a substitute for the profile detail a recruiter or the user themselves would see, and it does not let you edit profile content on the user's behalf (see §1.3).

### 5.3 Suspending an Account From This View
The row-level **Suspend** action here is the same underlying action as "Take Action → Suspend User" from the Reports queue (§4.4), just accessible directly without requiring a prior report. Because this is a rare, high-impact action, it requires a confirmation modal before taking effect — deliberately more friction than the Verification Queue's quick-decision pattern, since an incorrect suspension has real consequences for a real user's access.

### 5.4 Reactivating a Suspended Account
If a suspension needs to be reversed (e.g., after further review or a successful appeal outside the platform), use the same row's action to reactivate the account. Document your reasoning somewhere durable (even a simple note kept alongside your admin records) since the Admin Action Log records that the action was taken but is not a substitute for your own reasoning notes on a judgment call.

---

## 6. Admin Action Log

### 6.1 Purpose
Navigate to **Admin Action Log** (`/admin/logs`) to view a complete, read-only, reverse-chronological record of every administrative action taken on the platform: admin name, action type, target entity, and timestamp. This exists purely for accountability and audit — it has no interactive actions of its own.

### 6.2 What Gets Logged
Every verification decision (§3.4), every moderation action (§4.3), and every account suspension/reactivation (§5.3–5.4) is recorded here automatically at the moment it happens — you do not need to manually log anything yourself.

### 6.3 Using the Log
- Filter by action type or date range to review a specific period's activity — useful when preparing the evaluation chapter of the academic report, where a record of moderation activity during UAT may be relevant evidence.
- If a decision you made via the 5-second undo toast (§3.4) was undone within the window, the log reflects only the final outcome, not the reversed intermediate action — the log is a record of what actually took effect, not every click.

---

## 7. Common Admin Workflows (Quick Reference)

| I want to... | Go to... | Do this... |
|---|---|---|
| See what needs my attention today | Admin Overview (`/admin`) | Check the Pending Verifications and Open Reports tiles |
| Approve or reject a verification submission | Verification Queue (`/admin/verifications`) | Review the document, click Approve or Reject (with reason) |
| Review a flagged profile/casting call/message | Reports / Moderation (`/admin/reports`) | Read the report, click Dismiss or Take Action |
| Suspend a problematic account | Users & Organizations (`/admin/users`) or via a report's Take Action | Confirm the suspension in the modal |
| Check platform health at a glance | Admin Overview (`/admin`) | Review the KPI tile row |
| Find out who took a specific action and when | Admin Action Log (`/admin/logs`) | Filter by action type/date |
| Undo a verification decision I just made | Verification Queue, right after deciding | Click "Undo" on the toast within 5 seconds |

---

## 8. Frequently Asked Questions

**Q: Can I edit a user's profile information directly?**
No. Admin oversight is limited to verification, moderation, and account status (§1.3). Profile content is managed by the user themselves; if a profile appears to contain false information, that is a moderation/reporting matter (§4), not a direct-edit matter.

**Q: What if I approve a verification by mistake?**
If you catch it within 5 seconds, use the undo toast. If the window has passed, there is no separate manual "un-verify" action in this release — you would need to communicate with the user about resubmitting, or treat it as a moderation matter if the approval turns out to have been based on fraudulent documentation (§4).

**Q: Does "Verified" mean the platform has confirmed someone's legal identity?**
No — and this should never be communicated to users that way (§3.1). It means an administrator reviewed submitted documentation and judged it consistent and plausible. Keep this framing in mind, especially when explaining decisions to users during UAT.

**Q: Why does suspending a user require a confirmation modal but approving a verification doesn't?**
This is intentional (§4.5, §5.3). Verification review is a high-volume, low-individual-risk, easily-reversible (within 5 seconds) task, so the interface optimizes for speed. Suspension is rare and has a real, harder-to-reverse impact on a specific person's access, so the interface adds friction deliberately to make sure it's not done accidentally.

**Q: Where do I see overall platform activity for my report/thesis evaluation chapter?**
The Admin Overview's KPI tiles give a snapshot; the Admin Action Log gives a detailed activity history you can filter by date range to correspond to your UAT/pilot window.

---

## 9. Traceability to Other Documents

| This Guide | Source / Cross-Reference |
|---|---|
| §3 Verification Workflow | SRS-FR-10.1, SRS-FR-10.2; UI/UX Design Document §8.17 |
| §4 Moderation Workflow | SRS-FR-10.3, SRS-FR-10.4; UI/UX Design Document §8.18 |
| §5 User Management | UI/UX Design Document §8.19 |
| §6 Admin Action Log | SRS-FR-10.6; UI/UX Design Document §8.20 |
| §2.3 Admin Overview / Metrics | SRS-FR-10.5; UI/UX Design Document §8.16 |
| Verification framing (§3.1) | PRD §13, Security & Data Protection Policy §8.1 |

---

*End of Admin Guide.*
