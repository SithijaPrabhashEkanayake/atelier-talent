# ATELIER Talent — macOS Quickstart, Presentation & Hardware Survival Guide

**Candidate:** Sandun Prabath (A.M.S.P Athapaththu) — Index: 28607  
**Degree:** BSc (Hons) Software Engineering — NSBM Green University  
**Supervisor:** Ms. Lakni Peiris  
**Target Hardware:** macOS (Apple Silicon M1/M2/M3/M4 or Intel Mac)  
**Document Classification:** Mission-Critical Hardware & Presentation Operations Manual  

---

## ⚡ The 3 Golden Rules for macOS (Read First!)

### 1. The macOS Port 5000 AirPlay Rule (CRITICAL!)
By default on macOS 12 (Monterey) through macOS 15 (Sequoia), Apple's built-in **AirPlay Receiver** (`ControlCenter`) runs in the background and occupies **port 5000**. If AirPlay is running, the backend API cannot bind to port 5000.
* **The 5-Second Fix:**
  1. Open **System Settings** (or System Preferences) on your Mac.
  2. Navigate to **General > AirDrop & AirPlay**.
  3. Toggle **AirPlay Receiver** to **OFF** (gray/disabled).
  4. That's it! Port 5000 is now 100% free for your Node.js server.
* **Automatic Port 5001 Fallback:** If you are unable to disable AirPlay, our `start-mac.sh` launcher automatically prompts you: type `f` and hit Enter, and both backend and frontend will seamlessly configure to use **Port 5001**!

### 2. The Cross-Platform SSD Copy Rule
If you copy the project folder from a Windows PC to your Mac using an external SSD or USB drive:
* **Never use Windows `node_modules` on a Mac!** Windows compiled binaries (like `bcryptjs`, `esbuild-win32-x64`, `@tailwindcss/vite`) cannot execute on macOS ARM64 / Apple Silicon architecture.
* Our `start-mac.sh` script **automatically detects Windows binaries** in `node_modules`, deletes them, and re-installs native macOS dependencies for you!
* Or run manually: `bash start-mac.sh --clean`

### 3. The Hidden `.env` File Rule
On macOS, files starting with a dot (like `.env`) are **hidden** in Finder by default.
* To reveal hidden files in macOS Finder at any time, press:  
  **`Command (⌘) + Shift + Period (.)`**
* If `.env` is missing, `start-mac.sh` auto-generates `backend/.env` with working cloud credentials!

---

## 🚀 Scenario A: You Cloned from GitHub on Your Mac

This is the cleanest and fastest setup:

1. Open **Terminal** on your Mac (`Cmd + Space`, type `Terminal`, press Enter).
2. Clone your repository:
   ```bash
   git clone <YOUR-GITHUB-REPOSITORY-URL>
   cd "PR sadun Project/talent-marketplace"
   ```
3. Run the automated Mac setup launcher:
   ```bash
   bash start-mac.sh
   ```
   *The launcher will automatically install missing dependencies, verify `.env`, check for AirPlay conflicts, and launch both Backend (5000) and Frontend (5173) in parallel!*

---

## 💾 Scenario B: You Copied the Folder via USB / External SSD

If you copied the files directly from a Windows machine:

1. Open **Terminal** on your Mac.
2. Drag and drop the `talent-marketplace` folder into your Mac's **Desktop** or **Documents** folder.
3. In Terminal, navigate into the folder:
   ```bash
   cd ~/Desktop/talent-marketplace
   ```
4. Run the launcher:
   ```bash
   bash start-mac.sh
   ```
5. If macOS flags downloaded files with Gatekeeper quarantine, run:
   ```bash
   xattr -cr .
   chmod +x start-mac.sh
   bash start-mac.sh
   ```

---

## 🎮 One-Command Presentation Launcher (`start-mac.sh`)

```bash
cd talent-marketplace
bash start-mac.sh
```

### What `start-mac.sh` does automatically:
1. Detects Node.js in PATH (supporting default, Homebrew, and NVM).
2. Detects if Windows binaries exist in `node_modules` and wipes & reinstalls native packages automatically.
3. Detects if macOS AirPlay Receiver is using port 5000 and offers an automatic fallback to Port 5001.
4. Auto-installs missing dependencies if needed.
5. Auto-creates `backend/.env` if missing.
6. Boots the **Backend API** and **Frontend SPA** in parallel.
7. Gracefully shuts down both processes when you press `Ctrl + C`.

---

## 🖥️ macOS Split-Screen Setup for Live Viva Voce Demo

To show the live WebSocket dispatch with **zero page refresh** to examiners:

1. Launch the platform using `bash start-mac.sh`.
2. Open **Google Chrome** and navigate to `http://localhost:5173/login`. Log in as:
   * **Recruiter:** `organizer1@demo.talent` / `Password123`
3. Open **Safari** (or a Chrome Incognito window) and navigate to `http://localhost:5173/login`. Log in as:
   * **Model:** `model1@demo.talent` / `Password123` (Amara Silva)
4. On your Mac, use **macOS Split View**:
   * Hover over the **green full-screen button (🟢)** in the top-left corner of the Chrome window.
   * Choose **"Tile Window to Left of Screen"**.
   * Click on the Safari/Incognito window to fill the right half of your Mac screen.
5. **The Killer Viva Moment:**
   * In Chrome (Recruiter), open **Manage Applicants** for *Milan Fashion Week*.
   * Click the **Match Breakdown button (`95% Match`)** to display the radial gauge and explainable factor breakdown bars.
   * Change Amara's status to **"Accepted"**.
   * **Watch Safari (Model):** Instantly, a gold animated floating toast notification slides in:  
     *`"Live Dispatch Alert: Your application for 'Milan Fashion Week' has been updated to Accepted"`* without refreshing the browser!

---

## 🔑 Login Credentials Quick Reference

All demo accounts share the password: **`Password123`**

| Role | Email Login | Primary Screen to Show |
|---|---|---|
| **Superadmin** | `admin@demo.talent` | `/admin` (Member Oversight & Recharts Telemetry Wave) |
| **Industry Recruiter** | `organizer1@demo.talent` | `/castings/:id/applicants` (Explainable Match Inspector Modal) |
| **Model / Talent** | `model1@demo.talent` | `/p/:id` (Digital Comp Card & Cloudinary Lightbox) |
| **Pageant Organizer** | `pageant1@demo.talent` | `/castings/create` (Pageant Audition Builder) |

---

## 🛠️ Offline Emergency Fallback (No Internet / No Atlas Connection)

If the university Wi-Fi blocks MongoDB Atlas or you have no internet access during the viva:

1. In Terminal on Mac, run the in-memory disposable database:
   ```bash
   cd talent-marketplace/backend
   node scripts/dev-mongo.js
   ```
2. In a second terminal window, run the backend pointing at your local in-memory DB:
   ```bash
   cd talent-marketplace/backend
   MONGO_URI=mongodb://127.0.0.1:27117/talent-marketplace npm run dev
   ```
3. In a third terminal window:
   ```bash
   cd talent-marketplace/frontend
   npm run dev
   ```
*The app will run 100% offline with zero external network dependencies!*

---

## 🧪 Verification Commands on macOS

Before walking into the examination room, run these checks to be 100% confident:

```bash
# 1. Verify all 67 backend tests pass:
cd talent-marketplace/backend
npm test

# 2. Verify frontend production build compiles cleanly:
cd ../frontend
npm run build

# 3. Verify clean lints:
npm run lint
```
*All checks should complete with 0 errors!*
