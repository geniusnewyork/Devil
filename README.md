# MONTY GENIUS // SECURE LINK HUB

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20-00F5FF.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-0066FF.svg)](https://www.typescriptlang.org)
[![Security Hardened](https://img.shields.io/badge/Security-Argon2%2FBcrypt%20%2B%20Helmet-00FF66.svg)](https://helmetjs.github.io)

> **"ALL MY DIGITAL TOOLS — ONE SECURE PLACE"**  
> A high-performance, dark cyberpunk personal command center and link hub built for developers, cybersecurity operators, and tech enthusiasts. Store, categorize, search, track, and manage all your digital assets, private URLs, and tools behind a hardened zero-trust security wall.

---

## ⚡ CORE CAPABILITIES & ARCHITECTURE

- 🛡️ **Cyber Command Center Aesthetics**: Deep charcoal panels (`#050505`, `#0D0D0D`), neon red (`#FF003C`), electric cyan (`#00F5FF`), neon green (`#00FF66`), fluid RGB border flow animations, scanlines, and terminal typography.
- 🔐 **Hardened Server-Side Authentication**:
  - **Zero Plaintext Guarantees**: Passwords hashed with 12 salt rounds using Bcrypt.
  - **HttpOnly & SameSite Protection**: Session tokens are isolated from client-side JavaScript access.
  - **Dynamic Tiered Cooldown Deterrent**: Automated rate-limiting with tiered lockouts (short 60s cooldown for 4-6 failures, 15m lockout for 7+ failures).
  - **Dramatic Visual Security Alert Screen**: Red glitch deterrent screen informing unauthorized visitors of cryptographic logging.
- ⚡ **Instant Search & Command Palette**:
  - Global `CTRL + K` keyboard shortcut for instant multi-field lookup (titles, descriptions, URLs, tags, categories).
- 📂 **Dynamic Taxonomy & Asset Management**:
  - Unlimited customizable categories with individual color coding and custom Lucide icons.
  - Complete Link CRUD with custom accent colors, icons, tag chips, pin-to-top, and favorite toggles.
- 📊 **Telemetry & Usage Analytics**:
  - Real-time click counting on link navigation.
  - 7-day authentication activity visual graphs (successful vs blocked attacks).
  - Category asset density and top accessed tools breakdown.
- 📜 **Cryptographic Audit Trail**:
  - Detailed audit log of every system operation (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LINK_CREATED`, `LINK_DELETED`, `PASSWORD_CHANGED`, etc.).
  - Search, filter by date/event, purge old logs, and export to CSV or JSON.
- 🔄 **Disaster Recovery & Portability**:
  - Full system snapshot backup export in JSON and tabular links CSV.
  - Safe transactional restore with JSON schema validation.
- 📱 **Progressive Web App (PWA) Ready**:
  - `manifest.json`, Service Worker caching, and full mobile responsive layout.
- 🚧 **Tactical Maintenance Mode**:
  - Instant toggle to display a public maintenance screen while maintaining full access to the admin terminal.

---

## 🛠️ TECH STACK

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Ultra-fast client interface |
| **Styling** | Tailwind CSS, Lucide Icons | Cyber glassmorphism, animations, custom RGB flow |
| **Backend** | Node.js, Express, TypeScript | REST API architecture |
| **Database** | SQLite + Prisma ORM | Embedded storage, zero-config local run, persistent disk on cloud |
| **Security** | Helmet, Cookie-Parser, Bcrypt | CSP, HttpOnly sessions, rate limiting |
| **Deployment**| Render / Docker / VPS | Cloud native blueprint with persistent disk mount |

---

## 🚀 QUICK START (LOCAL INSTALLATION)

### 1. Prerequisites
- **Node.js** >= 20.x
- **npm** >= 10.x

### 2. Clone and Setup Environment
```bash
git clone https://github.com/montygenius/monty-genius-link-hub.git
cd monty-genius-link-hub

# Copy environment variables
cp .env.example .env
```

### 3. Install Dependencies
```bash
# Root backend & tooling dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 4. Database Setup & First-Run Seeding
```bash
# Generate Prisma Client and create database schema
npm run prisma:generate
npm run prisma:push

# Run automated seeding (hashes initial password and populates default categories)
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
- Public Link Hub: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Admin Terminal Login: `http://localhost:5173/admin/login`

---

## 🔑 DEFAULT OPERATOR CREDENTIALS

On first startup, the database automatically initializes the master administrator account:
- **Username**: `Genius`
- **Initial Password**: `Genius`

> ⚠️ **SECURITY DIRECTIVE**: Immediately after logging in for the first time, navigate to **Security Center** (`/admin/security`) and rotate the master password to a strong key. The system enforces minimum 8 characters with uppercase, lowercase, numbers, and symbols.

---

## 🧪 AUTOMATED SECURITY & INTEGRATION TESTS

Run the built-in automated test suite to verify authorization boundaries, wrong password deterrence, rate limiting, and CRUD:

```bash
npm test
```

---

## 📦 PRODUCTION BUILD & LOCAL RUN

To compile both the frontend SPA and backend TypeScript into a production-ready package:

```bash
npm run build
npm start
```
The server will boot on port `3000` (or `PORT` specified in `.env`) and automatically serve the built frontend assets from `frontend/dist`.

---

## ☁️ RENDER DEPLOYMENT GUIDE

The repository includes a ready-to-deploy [`render.yaml`](file:///m:/Admin/render.yaml) blueprint with persistent SQLite disk storage.

### 1-Click / Blueprint Deploy:
1. Push this repository to your GitHub account.
2. In the **Render Dashboard**, click **New +** → **Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml`.
4. Render will configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Persistent Disk**: 1GB mounted at `/var/data` (ensuring SQLite survives redeployments).
5. Add the following Environment Variables in the Render settings:
   - `SESSION_SECRET`: Set to a strong random string (e.g. 64 random characters).
   - `DATABASE_URL`: `file:/var/data/monty_genius.db`
   - `ADMIN_INITIAL_USERNAME`: `Genius`
   - `ADMIN_INITIAL_PASSWORD`: `Genius` (or your chosen initial password).

---

## 📁 REPOSITORY STRUCTURE

```
monty-genius-link-hub/
├── .env.example              # Environment variables template
├── .gitignore                # Production ignore rules
├── package.json              # Monorepo scripts and dependencies
├── render.yaml               # Render Cloud deployment blueprint
├── tsconfig.json             # Root TypeScript config
├── prisma/
│   └── schema.prisma         # Database models (Admin, Session, Link, Category, etc.)
├── backend/
│   ├── tsconfig.json         # Backend TS compiler config
│   └── src/
│       ├── config.ts         # Environment and settings configuration
│       ├── db.ts             # Prisma singleton & directory validation
│       ├── index.ts          # Express server & static asset serving
│       ├── middleware/       # Auth, rate-limiter, audit logger, error handler
│       ├── routes/           # Auth, links, categories, logs, analytics, settings, backup
│       ├── utils/seed.ts     # First-run secure seeding script
│       └── tests/api.test.ts # End-to-end security integration suite
└── frontend/
    ├── index.html            # PWA-ready HTML5 entry
    ├── package.json          # Frontend dependencies
    ├── vite.config.ts        # Vite bundler & API reverse proxy
    ├── tailwind.config.js    # Cyberpunk design system tokens
    ├── public/               # Manifest, service worker, cyber SVG favicon
    └── src/
        ├── App.tsx           # Router and top-level providers
        ├── components/       # LinkCard, SearchModal, GlitchScreen, Navbar, Footer
        ├── context/          # AuthContext, ToastContext, SettingsContext
        ├── pages/            # HomePage, LoginPage, 404
        └── pages/admin/      # Dashboard, Links, Categories, Analytics, Logs, Security, Backup, Settings
```

---

## 📄 LICENSE

Designed with ❤️ by **Monty Genius**.  
Released under the [MIT License](LICENSE).
