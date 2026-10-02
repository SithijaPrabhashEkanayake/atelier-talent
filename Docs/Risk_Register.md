# Risk Register
## Global Multidimensional Talent Marketplace and Casting Management System

| Field | Detail |
|---|---|
| **Document Type** | Risk Register (Living Document) |
| **Product Name** | Global Multidimensional Talent Marketplace and Casting Management System |
| **Prepared For** | Sandun Prabath (A.M.S.P Athapaththu), BSc (Hons) Software Engineering — NSBM Green University |
| **Document Version** | 2.0 |
| **Status** | Active — Build Phase (living document, update throughout lifecycle) |
| **Companion Documents** | PRD v2.0 (§17 Risks, §18 Open Questions), Project Plan / Gantt Timeline v2.0 (§7 Schedule Risk Flags), Security & Data Protection Policy v2.0, System Architecture Design Document v2.0, Test Plan & QA Strategy v2.0 |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-03-01 | Initial register expanding PRD §17's summary risk table into a scored, owned, living risk register | Product/Engineering Team |
| 2.0 | 2026-09-08 | Updated sprint/phase dates to Oct 2026–Jan 2027; closed RS-04 (media storage ambiguity — now resolved: Cloudinary locked); closed RS-xx (real-time messaging tech choice — resolved: Socket.io); updated companion document references to v2.0; updated status to Active | Engineering Team |

---

## 1. Introduction

### 1.1 Purpose
This document expands the six-row summary risk table in PRD §17 into a full risk register: each risk is individually identified, scored for likelihood and impact, assigned an owner and a status, and paired with concrete mitigation and contingency actions. Unlike the PRD's static table, this register is intended to be a **living document** — updated as the project progresses through the phases defined in the Project Plan / Gantt Timeline, with new risks added and existing risks re-scored as they materialize, are mitigated, or are retired.

### 1.2 Intended Audience
- The developer (project owner), as the primary risk owner in a solo academic project
- Academic supervisor, for risk visibility at phase-gate check-ins
- Examiners, as evidence of proactive risk management practice (a standard expectation in final-year software engineering evaluation)

### 1.3 Scope
This register covers technical, schedule, security, data/privacy, market/adoption, and academic-process risks relevant to the system as scoped in the PRD and SRS. Risks explicitly out of scope for this release (e.g., payment-processing risk, legal-identity-verification risk) are noted only where they represent a *scope-creep* risk to the current release, not as risks of features that do not exist in this system.

### 1.4 Risk Scoring Methodology

**Likelihood scale (1–5):**

| Score | Label | Description |
|---|---|---|
| 1 | Rare | Unlikely to occur during the project lifecycle |
| 2 | Unlikely | Could occur, but no specific indication it will |
| 3 | Possible | Reasonable chance of occurring given project conditions |
| 4 | Likely | Expected to occur unless actively mitigated |
| 5 | Almost Certain | Will occur without intervention |

**Impact scale (1–5):**

| Score | Label | Description |
|---|---|---|
| 1 | Negligible | Minor inconvenience; no schedule/quality/grade impact |
| 2 | Minor | Small rework or delay (days), locally contained |
| 3 | Moderate | Noticeable delay (1–2 weeks) or quality degradation in one module |
| 4 | Major | Threatens a phase milestone (Project Plan §2) or a core requirement |
| 5 | Severe | Threatens overall project completion, submission deadline, or examiner evaluation outcome |

**Risk Score = Likelihood × Impact** (range 1–25), banded as:

| Band | Score Range | Response |
|---|---|---|
| 🟢 Low | 1–5 | Monitor; no immediate action required |
| 🟡 Medium | 6–11 | Active mitigation planned and tracked |
| 🟠 High | 12–17 | Mitigation mandatory before the affected phase begins; contingency plan defined |
| 🔴 Critical | 18–25 | Immediate action; escalate to supervisor; may require scope/schedule renegotiation |

### 1.5 Risk Lifecycle Status
Each risk carries a status, updated as the project proceeds:
- **Open** — identified, mitigation planned or in progress
- **Mitigating** — mitigation actions actively underway
- **Occurred** — the risk has materialized; contingency plan is/was executed
- **Closed** — risk window has passed or risk is no longer applicable
- **Retired (Accepted)** — consciously accepted without further mitigation (with rationale recorded)

---

## 2. Risk Register — Technical Risks

| ID | Risk | Phase(s) Affected | Likelihood | Impact | Score | Band | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| **RT-01** | Matching algorithm produces low-quality or non-intuitive matches without real-world tuning data | Development, Testing | 4 | 3 | 12 | 🟠 High | Developer | Open |
| **RT-02** | MongoDB flexible-schema design leads to data inconsistency across role-specific profile collections if validation is not rigorously applied | Development | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RT-03** | Media storage/bandwidth costs scale faster than anticipated as portfolio content grows during pilot | Deployment, Post-MVP | 2 | 3 | 6 | 🟡 Medium | Developer | Open |
| **RT-04** | Free/low-tier cloud service limits (MongoDB Atlas shared tier, Render free tier) are exceeded during UAT/pilot load | Testing, Deployment | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RT-05** | Search/filter performance degrades below NFR-PERF-1 target as sample/pilot data volume grows | Testing | 2 | 3 | 6 | 🟡 Medium | Developer | Open |
| **RT-06** | Third-party dependency (npm package) introduces a breaking change or vulnerability mid-development | Development | 2 | 2 | 4 | 🟢 Low | Developer | Open |
| **RT-07** | Cross-module integration defects emerge late (e.g., Casting Call and Matching Engine assumptions diverge) due to solo, sequential (non-pair-reviewed) development | Development, Testing | 3 | 3 | 9 | 🟡 Medium | Developer | Open |

**Mitigations:**
- **RT-01:** Use a transparent, explainable rule/attribute-based scoring model (per Architecture ADR-05) rather than an unproven ML approach; validate scoring logic manually against hand-crafted test cases (Test Plan) before UAT; treat UAT feedback on match quality as a tuning input, not a launch blocker.
- **RT-02:** Enforce Mongoose schema validation (required fields, enums, types) on every collection per Database Design Document §9; add integration tests that specifically assert cross-collection referential consistency (e.g., no orphaned `applications` referencing a deleted `casting_calls` document).
- **RT-03:** Apply thumbnail-first loading and compressed media pipelines (Architecture §8.3) from the start rather than retrofitting; monitor storage usage during pilot and set a documented cap on portfolio item count/size per user if needed.
- **RT-04:** Monitor free-tier usage metrics from early in Phase 3; identify the specific limit (connections, storage, compute hours) most likely to be hit and pre-plan an upgrade path (documented in Architecture §12) rather than discovering the limit during UAT.
- **RT-05:** Apply the indexing strategy defined in Database Design Document §9/Architecture §8.2 from initial implementation, not as a later optimization pass; include a performance test case (Test Plan) specifically at realistic pilot-scale data volume.
- **RT-06:** Pin dependency versions (Coding Standards & Git Workflow Guide) and review changelogs before any dependency upgrade during active development.
- **RT-07:** Maintain the API Specification as the single source of truth for cross-module contracts; write integration tests immediately after each sprint block (Project Plan §3, Phase 2) rather than deferring all integration testing to Phase 3.

---

## 3. Risk Register — Schedule Risks

| ID | Risk | Phase(s) Affected | Likelihood | Impact | Score | Band | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| **RS-01** | Single point of failure: solo developer has no backup resource if illness, coursework conflicts, or other unavailability occurs during a tight sprint block | Development (esp. Sprint Block 1) | 3 | 4 | 12 | 🟠 High | Developer | Open |
| **RS-02** | Sprint Block 1 (Auth/RBAC) delay cascades through all remaining Phase 2 sprint blocks, given the dependency chain in Project Plan §4 | Development | 3 | 4 | 12 | 🟠 High | Developer | Open |
| **RS-03** | UAT participant recruitment (models, recruiters, admins) slips because it depends on external volunteers outside direct schedule control | Testing | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RS-04** | Phase 3/4 overlap is tighter than planned if testing runs long, compressing available deployment time before Phase 5 begins | Testing, Deployment | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RS-05** | Remaining documentation deliverables (Sprint Backlog, Deployment Guide, Admin Guide, User Guide) compete for the same Phase 5 window as final report writing | Documentation | 4 | 3 | 12 | 🟠 High | Developer | Open |
| **RS-06** | Academic coursework/exam schedule (outside this project) consumes planned project time during Phase 2 or Phase 3 | Development, Testing | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RS-07** | Underestimated effort for a specific feature (e.g., matching engine or file-upload pipeline) consumes buffer intended for later blocks | Development | 3 | 3 | 9 | 🟡 Medium | Developer | Open |

**Mitigations:**
- **RS-01 / RS-06:** Build schedule buffer into each Phase 2 sprint block rather than planning to exact capacity; if a block slips, prioritize ruthlessly by SRS feature priority (P0 features protected first, per PRD) rather than attempting to compress every remaining task equally.
- **RS-02:** Treat Sprint Block 1 (Auth/RBAC) as the highest-priority, least-negotiable block in Phase 2; do not begin Sprint Block 2 work until Auth/RBAC unit tests (Test Plan) pass, to avoid building on an unstable foundation that requires rework later.
- **RS-03:** Begin UAT participant outreach early — during Phase 2, not at the start of Phase 3 — so recruitment lead time does not sit on the critical path; maintain a shortlist larger than the minimum needed sample size to absorb drop-out.
- **RS-04:** Begin infrastructure provisioning (Project Plan P4-T1) in parallel with the later portion of Phase 3 testing rather than strictly after Test Exit (M3), as already reflected in the Project Plan's overlap design.
- **RS-05:** Sequence remaining documentation (this register, Sprint Backlog, Deployment Guide, Admin Guide, User Guide) to begin as soon as their source content is stable (e.g., Deployment Guide can be drafted once Phase 4 infrastructure decisions are confirmed, not necessarily last), rather than deferring all of them to Phase 5.
- **RS-07:** Track actual-vs-estimated effort per sprint block from Sprint Block 1 onward; if a pattern of underestimation emerges early, re-baseline remaining blocks' scope (defer a P2-priority feature) rather than letting the pattern silently consume the whole schedule.

---

## 4. Risk Register — Security and Data Protection Risks

| ID | Risk | Phase(s) Affected | Likelihood | Impact | Score | Band | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| **RSEC-01** | Security gaps in authentication or file upload handling lead to a data breach or account compromise | Development, Testing, Deployment | 2 | 5 | 10 | 🟡 Medium | Developer | Open |
| **RSEC-02** | Broken access control (a role/ownership check missed on a specific endpoint) allows cross-role or cross-account data access | Development, Testing | 3 | 4 | 12 | 🟠 High | Developer | Open |
| **RSEC-03** | Sensitive contact/verification data is inadvertently exposed through an API response not covered by the field-level classification in the Security & Data Protection Policy §4.2 | Development, Testing | 2 | 4 | 8 | 🟡 Medium | Developer | Open |
| **RSEC-04** | JWT signing secret or cloud storage credentials are accidentally committed to source control | Development | 2 | 4 | 8 | 🟡 Medium | Developer | Open |
| **RSEC-05** | Token-revocation-on-logout behavior remains unresolved (open item flagged in Test Plan §18.3 and Security Policy §3.3), leaving a genuine security-test ambiguity into the testing phase | Testing | 3 | 2 | 6 | 🟡 Medium | Developer | Open |

**Mitigations:**
- **RSEC-01:** Follow the OWASP-aligned checklist (Security & Data Protection Policy §9) as a mandatory pre-deployment gate, not an optional pass; execute the full Security Test Suite (Test Plan) before Test Exit (M3).
- **RSEC-02:** Centralize authorization logic (Security Policy §5.2) rather than re-implementing per route, so a missed check is structurally less likely; add a specific integration test per protected route that asserts a wrong-role request is rejected (Test Plan security suite), not just that a correct-role request succeeds.
- **RSEC-03:** Cross-check every API endpoint's response payload against the field-level classification table (Security & Data Protection Policy §4.2) during Phase 3 security testing, specifically looking for Tier 2/3 fields leaking into a response that should only contain Tier 0/1 data.
- **RSEC-04:** Enforce `.env` exclusion via `.gitignore` from the very first commit (Coding Standards & Git Workflow Guide); if a secret is ever committed, rotate it immediately rather than relying on Git history removal alone.
- **RSEC-05:** Resolve the logout/token-revocation design decision (short-expiry-only vs. revoked-token denylist) explicitly before writing the corresponding Test Plan case, and document the decision in both the Security Policy and Test Plan so they stay consistent — this is a decision, not a risk that resolves itself.

---

## 5. Risk Register — Data, Privacy, and Trust Risks

| ID | Risk | Phase(s) Affected | Likelihood | Impact | Score | Band | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| **RD-01** | Fraudulent or fake profiles persist despite administrative verification, eroding the platform's core trust value proposition | Deployment, Pilot | 3 | 4 | 12 | 🟠 High | Developer | Open |
| **RD-02** | The "Verified" badge is misunderstood by users as a legal identity guarantee rather than an administrative trust signal | Deployment, Pilot | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RD-03** | Pilot data collected from real UAT participants raises informed-consent or data-retention questions beyond the current academic-scope handling (Security & Data Protection Policy §10) | Testing, Deployment | 2 | 3 | 6 | 🟡 Medium | Developer | Open |
| **RD-04** | Reporting/moderation queue is abused (mass false reporting) to disadvantage a competitor profile or casting call | Pilot | 1 | 2 | 2 | 🟢 Low | Developer | Retired (Accepted — low likelihood at pilot scale) |

**Mitigations:**
- **RD-01:** Route all flagged/reported content to the Admin review queue (Architecture §7.4); communicate to pilot users that verification reduces, but does not eliminate, fraud risk, consistent with PRD §13's explicit framing; iterate the verification workflow's strictness based on pilot feedback rather than over-promising at launch.
- **RD-02:** Ensure UI copy (UI/UX Design Document) explicitly frames "Verified" as an administrative check, not a legal guarantee, at every point the badge is displayed; address this directly in UAT feedback questions to confirm the framing is understood correctly.
- **RD-03:** Obtain explicit informed consent at registration (Security & Data Protection Policy §10) and communicate to UAT participants specifically that this is a pilot/academic evaluation; keep pilot data handling consistent with the retention approach already documented rather than improvising exceptions.
- **RD-04:** Accepted at current pilot scale (small, known participant pool) — revisit if the platform scales beyond the academic pilot, per the Post-MVP roadmap in PRD §14.

---

## 6. Risk Register — Market, Adoption, and Scope Risks

| ID | Risk | Phase(s) Affected | Likelihood | Impact | Score | Band | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| **RM-01** | Low initial liquidity — too few talent profiles or too few recruiters/casting calls at pilot launch, producing an empty-feeling marketplace | Deployment, Pilot | 4 | 3 | 12 | 🟠 High | Developer | Open |
| **RM-02** | Scope creep toward payments, legal identity verification, or biometric AI features not in the current release scope, consuming time needed for MVP delivery | Development | 2 | 4 | 8 | 🟡 Medium | Developer | Open |
| **RM-03** | UAT feedback reveals a usability issue (below SUS ≥68 target) too late in the schedule to meaningfully redesign before submission | Testing | 2 | 3 | 6 | 🟡 Medium | Developer | Open |
| **RM-04** | Country-first navigation / hard-gate decision (PRD §18 Open Question 2) is left unresolved into implementation, causing rework | Development | 3 | 2 | 6 | 🟡 Medium | Developer | Open |

**Mitigations:**
- **RM-01:** Seed the pilot with a deliberately defined, narrow country/category cohort (per PRD §17) rather than attempting a global pilot; consider seeding a small number of realistic sample profiles/casting calls (clearly marked as seed/demo data) to avoid an empty first impression during UAT and defense demonstration.
- **RM-02:** Maintain the explicit out-of-scope declaration (PRD §6.2) as a standing reference during development; any feature request that touches payments/legal verification/biometrics is deferred to the Post-MVP roadmap (PRD §14) without exception during this academic release.
- **RM-03:** Run at least one informal usability pass (even a small 2–3 person walkthrough) before the formal UAT/SUS survey in Phase 3, so major usability issues surface with enough runway left to address them before the formal, gradeable UAT round.
- **RM-04:** Resolve this specific PRD §18 open question during Phase 1 (System Design), before the Casting/Search module (Sprint Block 3) is implemented, so the decision does not require mid-development rework — this and the other PRD §18 open questions are treated as **design-phase-exit blockers**, not post-launch afterthoughts.

---

## 7. Risk Register — Academic Process Risks

| ID | Risk | Phase(s) Affected | Likelihood | Impact | Score | Band | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| **RA-01** | Supervisor feedback at a phase gate (M0–M5) requires rework of an already-completed document or module | Any phase | 3 | 3 | 9 | 🟡 Medium | Developer | Open |
| **RA-02** | Documentation suite is judged incomplete or inconsistent across documents (e.g., an FR ID referenced in Test Plan does not exist in SRS) at final examination | Documentation, Submission | 2 | 4 | 8 | 🟡 Medium | Developer | Open |
| **RA-03** | Final report's evaluation chapter lacks sufficient evidence (test results, SUS data, security checklist evidence) because it was not captured during Phase 3 execution | Testing, Documentation | 2 | 4 | 8 | 🟡 Medium | Developer | Open |

**Mitigations:**
- **RA-01:** Build supervisor review time into each phase-gate milestone in the Project Plan (M0–M5) rather than treating the gate as a formality; treat feedback as expected, not exceptional, and keep buffer time in the following phase to absorb it.
- **RA-02:** Maintain the traceability convention already established across documents (SRS-FR IDs referenced consistently in API Spec, Test Plan, Coding Standards commit footers) as a standing discipline; do a final cross-document consistency pass in Phase 5 before submission specifically checking ID references resolve correctly.
- **RA-03:** Capture evidence (screenshots, exported test results, SUS survey raw data, security-checklist walkthrough notes) as Phase 3 tasks are executed, not reconstructed retroactively during Phase 5 report writing.

---

## 8. Top Risks Requiring Immediate Attention (Dashboard View)

Sorted by score, current 🟠 High and 🔴 Critical items as of this document's version:

| Rank | ID | Risk | Score | Band |
|---|---|---|---|---|
| 1 | RS-02 | Sprint Block 1 (Auth/RBAC) delay cascades through Phase 2 | 12 | 🟠 High |
| 1 | RS-01 | Solo-developer single point of failure | 12 | 🟠 High |
| 1 | RS-05 | Documentation deliverables compete for Phase 5 window | 12 | 🟠 High |
| 1 | RSEC-02 | Broken access control on a missed endpoint | 12 | 🟠 High |
| 1 | RD-01 | Fraudulent profiles despite verification | 12 | 🟠 High |
| 1 | RM-01 | Low initial pilot liquidity | 12 | 🟠 High |
| 1 | RT-01 | Matching algorithm produces low-quality matches | 12 | 🟠 High |

*No risk currently scores in the 🔴 Critical (18–25) band. If any risk above is re-scored upward at a future review (e.g., RS-02 if Sprint Block 1 is already slipping), it should be escalated to the supervisor per the Critical-band response rule in §1.4.*

---

## 9. Review Cadence

This register should be reviewed and updated:
- At every phase-gate milestone (M0 through M5), as part of the supervisor check-in
- Immediately when any risk in §2–§7 **occurs** (status changes to "Occurred") — the actual outcome and contingency action taken should be recorded
- At the start of Phase 3 (Testing), specifically re-scoring all RSEC-* (security) risks against actual test results
- Before final submission (Phase 5), as a closing pass to mark residual risks as Closed or Retired with rationale, for inclusion in the final evaluation chapter

---

## 10. Traceability to Other Documents

| This Register | Source / Cross-Reference |
|---|---|
| §2 Technical Risks | PRD §17 (matching, media cost rows); Architecture §7.5 Threat Model; Test Plan performance suite |
| §3 Schedule Risks | Project Plan / Gantt Timeline §7 (Schedule Risk Flags) |
| §4 Security Risks | Security & Data Protection Policy §7.5, §9 (OWASP checklist); Test Plan §18.3 (token-revocation open item) |
| §5 Data/Privacy/Trust Risks | PRD §17 (fraud row); Security & Data Protection Policy §8, §10 |
| §6 Market/Scope Risks | PRD §17 (liquidity, scope-creep rows); PRD §18 Open Questions |
| §7 Academic Process Risks | PRD §16 (timeline constraints); Coding Standards traceability convention |

---

*End of Risk Register. This is a living document — update likelihood, impact, status, and the dashboard in §8 at each review point defined in §9.*
