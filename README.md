# CampusPulse — LNBTI Club & Event Management Portal

CampusPulse is a comprehensive, multi-role university club governance, event management, and ticketing portal tailored for **Lanka Nippon BizTech Institute (LNBTI)**.

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### 2. Setup & Installation
```bash
# 1. Clone or extract the project folder
cd university-club-app

# 2. Copy the environment configuration
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 👥 Supported Roles & 1-Click Demo Accounts

CampusPulse features **Role-Based Access Control (RBAC)** across 6 distinct university workflows. On the **`/login`** page, you can use the **1-Click Quick Role Sign In** chips or enter the credentials below:

| Role | Email | Password | Landing Workspace | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `nethmi.p@university.edu` | `password123` | `/home` | Event explorer, ticket booking, QR pass, badges, memberships, refund tracking |
| **Sports Club Officer** | `organizer@university.edu` | `password123` | `/organizer` | Submit event proposals, manage events, track attendance, member approvals |
| **Club Committee** | `chamod.p@university.edu` | `password123` | `/committee` | 5-seat decision sign-off matrix (President, VP, Secretary, Treasurer, Asst. Treasurer) |
| **Lecturer Coordinator** | `kavinda.s@university.edu` | `password123` | `/coordinator` | Multi-club review queue, endorse/route proposals to Dean, assign clubs |
| **University Authority** | `maheshika.p@university.edu` | `password123` | `/authority` | Executive Dean sign-off, approval stages, official remarks, decision history |
| **Central Admin** | `amila.d@university.edu` | `password123` | `/admin` | Official club charters, staff role permissions, QR merchant devices, system audit logs |

---

## 🗄️ Supabase Backend Setup

CampusPulse connects directly to Supabase with real-time updates and Row Level Security (RLS).

### Sharing Options:

#### Option A: Use the Pre-Connected Database (Instant)
The `.env.example` file contains the public client URL and Anon key for the shared test project. No database setup is required.

#### Option B: Deploy to Your Own Supabase Instance
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to your project's **SQL Editor** and run:
   - `supabase_setup.sql`: Creates `events`, `registrations`, `clubs`, `proposals`, `badges`, `notifications`, `payments`, and `club_members` tables with seed data.
   - `supabase_auth_setup.sql`: Sets up the `profiles` table, auto-registration triggers, RLS policies, and pre-seeds the 6 role accounts.
3. In your `.env` file, set:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🎨 Theme & Features
- **Official LNBTI Colors:** Crimson Red (`#E6292D`) & Royal Purple (`#653A8F`).
- **Dark / Light Mode:** Instant toggle button located in the global `TopBar` and `Login` screen with system preference detection and persistence in `localStorage`.
- **Zero-Dependency Mock Fallback:** Full demo mode remains active even if offline or disconnected from network.

---

## 📦 Production Build
```bash
npm run build
npm run preview
```
