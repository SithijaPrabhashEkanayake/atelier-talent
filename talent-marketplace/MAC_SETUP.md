# ATELIER Talent — macOS Zero-Friction Setup & Presentation Guide

**Candidate:** Sandun Prabath (A.M.S.P Athapaththu) — Index: 28607  
**Degree:** BSc (Hons) Software Engineering — NSBM Green University  
**Supervisor:** Ms. Lakni Peiris  
**Target Machine:** macOS (Apple Silicon M1/M2/M3/M4 & Intel Mac)  

---

## ⚡ The 3 Golden Rules for macOS (Read This First!)

### 1. The Port 5000 AirPlay Conflict
On modern macOS versions (Monterey, Ventura, Sonoma, Sequoia), Apple's built-in **AirPlay Receiver** runs in the background on **Port 5000**.
* **How to fix in 5 seconds:**
  1. Open **System Settings** (or System Preferences) on your Mac.
  2. Navigate to **General > AirDrop & AirPlay**.
  3. Toggle **AirPlay Receiver** to **OFF**.
* **Instant Fallback:** If you forget to turn it off, our `start-mac.sh` launcher will ask if you want to use **Port 5001** automatically!

### 2. The Windows SSD / USB Copy Rule
If you copy this folder from a Windows PC onto your Mac using an external SSD or USB drive:
* **Windows binaries (`.exe`, `.cmd`) cannot run on Mac Apple Silicon (ARM64)!**
* Our script `start-mac.sh` **automatically detects** if Windows binaries are inside `node_modules` and wipes & reinstalls native Mac packages for you automatically!

### 3. Hidden `.env` Files in Mac Finder
On macOS, files starting with a dot (like `.env`) are invisible in Finder.
* Press **`Command (⌘) + Shift + Period (.)`** to toggle hidden files visible.
* If `.env` is missing, `start-mac.sh` creates it with working credentials automatically.

---

## 🚀 How to Run the App (Super Easy)

### Scenario A: If You Cloned via Git from GitHub
1. Open **Terminal** on your Mac (`Cmd + Space`, type `Terminal`, press Enter).
2. Navigate into the folder:
   ```bash
   cd path/to/talent-marketplace
   ```
3. Run the one-click launcher:
   ```bash
   bash start-mac.sh
   ```
*Everything (dependencies, ports, env, backend, frontend) is handled automatically!*

---

### Scenario B: If You Copied the Folder via External SSD / USB Drive
1. Plug your SSD into your Mac.
2. Drag and drop the `talent-marketplace` folder to your Mac's **Desktop** or **Documents** folder.
3. Open **Terminal**, type `cd ` (with a space), and **drag the `talent-marketplace` folder into Terminal** to paste its path, then hit Enter:
   ```bash
   cd ~/Desktop/talent-marketplace
   ```
4. Run the launcher:
   ```bash
   bash start-mac.sh
   ```
   *(If you want to be 100% sure it installs fresh Mac packages, run `bash start-mac.sh --clean`)*

---

### Scenario C: If macOS Says "Permission Denied" or Gatekeeper Warning
If you downloaded the code as a `.zip` file from the web, macOS might quarantine the files. Run this in Terminal:
```bash
xattr -cr .
chmod +x start-mac.sh
bash start-mac.sh
```

---

## 🖥️ Live Viva Presentation: Dual-Browser Setup

To demonstrate real-time WebSocket instant updates with **zero page refresh** to examiners:

1. Start the app: `bash start-mac.sh`
2. Open **Google Chrome** (`http://localhost:5173/login`) and log in as:
   * **Recruiter:** `organizer1@demo.talent` / `Password123`
3. Open **Safari** (or a Chrome Incognito Window) and log in as:
   * **Model:** `model1@demo.talent` / `Password123` (Amara Silva)
4. Split your Mac screen:
   * Hover over the **Green (🟢) Fullscreen button** at the top left of Chrome and select **"Tile Window to Left of Screen"**.
   * Click on Safari to fill the right half.
5. **The Distinction Demo Moment:**
   * In Chrome (Recruiter), open **Manage Applicants** for *Milan Fashion Week*.
   * Click the **Match Breakdown button (95% Match)** to show the **Explainable Radial Gauge & Factor Bars**.
   * Change Amara's status to **"Accepted"**.
   * **Watch Safari (Model):** Instantly, a gold animated toast notification pops up:  
     *`"Live Dispatch Alert: Your application for 'Milan Fashion Week' has been updated to Accepted"`* with **zero browser refresh!**

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Primary Feature to Show |
|---|---|---|---|
| **Superadmin** | `admin@demo.talent` | `Password123` | Member Oversight, Moderation & Recharts Telemetry |
| **Recruiter** | `organizer1@demo.talent` | `Password123` | Candidate Radar Dock, Budget Estimator & Match Inspector |
| **Model** | `model1@demo.talent` | `Password123` | Digital Comp Card (`/p/:id`), Cloudinary Lightbox, Print A5 |
| **Pageant Org** | `pageant1@demo.talent` | `Password123` | Franchise Auditions & Delegate Screening |

---

## 🧪 Quick Test & Build Verification Commands
To verify the entire system before stepping into the viva room:
```bash
# Backend (All 67 tests passing):
cd backend && npm test

# Frontend (Production build succeeds in <4s):
cd ../frontend && npm run build
```
