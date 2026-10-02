# ATELIER Talent — Global Multidimensional Talent Marketplace & Casting Management System

**Academic Degree:** BSc (Hons) in Software Engineering  
**Institution:** Faculty of Computing, NSBM Green University, Sri Lanka  
**Candidate Name:** Sandun Prabath (A.M.S.P Athapaththu)  
**Student / Index Number:** 28607  
**Academic Supervisor:** Ms. Lakni Peiris  
**Academic Year:** 2026  

---

## 🌟 Quick Navigation & Master Documents

* **⭐ [Master Viva Voce Defense Encyclopedia](Docs/Sandun_Distinction_Viva_Defense_Encyclopedia.md):** The definitive 570+ line defense bible, screen-by-screen breakdown, 25 distinction-grade examiner rebuttals, mathematical matching formulas, and security models.
* **🍎 [macOS Setup & Presentation Guide](talent-marketplace/MAC_SETUP.md) (or [Docs/Mac_Quickstart_and_Presentation_Guide.md](Docs/Mac_Quickstart_and_Presentation_Guide.md)):** Step-by-step instructions for running on macOS (Apple Silicon M1/M2/M3/M4 & Intel), AirPlay port 5000 resolution, and SSD transfers.
* **🚀 [Application Codebase & Setup Guide](talent-marketplace/README.md):** Complete full-stack guide, API endpoints, testing instructions, and deployment guides.
* **📚 [Full Engineering Documentation Index](Docs/):** All 24 formal software engineering deliverables (SRS, PRD, Architecture, Database, Security, QA, UAT, Gantt, Backlog).

---

## ⚡ Instant One-Click Launchers

### 🍎 On macOS (MacBook Pro / Air)
```bash
cd talent-marketplace
bash start-mac.sh
```
*Auto-detects Windows USB copies, resolves AirPlay Port 5000 conflicts, auto-configures `.env`, and launches both servers!*

### 🪟 On Windows PC
Double-click `talent-marketplace/start-pc.bat` (or run `start-pc.bat` in terminal).

---

## 🔑 Demo Account Credentials (Password: `Password123`)

| Persona / Role | Email Login | Primary Screen to Showcase |
|---|---|---|
| **Superadmin** | `admin@demo.talent` | `/admin` (Member Oversight & Recharts Telemetry Wave) |
| **Industry Recruiter** | `organizer1@demo.talent` | `/castings/:id/applicants` (Explainable Match Inspector Modal) |
| **Model / Creative Talent** | `model1@demo.talent` | `/p/:id` (Digital Comp Card, Measurements & Lightbox) |
| **Pageant Organizer** | `pageant1@demo.talent` | `/castings/create` (Pageant Audition Builder) |

---

## 🧪 Verification Commands

```bash
# 1. Verify all 67 backend automated tests pass (in-memory MongoDB):
cd talent-marketplace/backend && npm test

# 2. Verify frontend production build succeeds cleanly:
cd ../frontend && npm run build
```

---
*Developed by Sandun Prabath (Index: 28607) for the Bachelor of Science (Honours) in Software Engineering degree at NSBM Green University.*
