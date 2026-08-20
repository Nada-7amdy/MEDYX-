# MEDYX — Supply Rescue

> **Find the medicine. Rescue the supply.**

MEDYX is a hackathon MVP built to help patients in Egypt find critical medicines during shortage periods—especially life-dependent drugs like insulin.

---

## 1) Problem & Solution

### The Problem
In Egypt, patients can spend hours searching multiple pharmacies for unavailable medicine, and shortages of essential drugs (including insulin) can become dangerous quickly.

### Our Solution
MEDYX provides a patient-first rescue flow:
1. Search for a medicine by brand, generic, or common local spelling.
2. Check nearby pharmacy availability.
3. If unavailable, automatically expand search radius across a connected pharmacy network.
4. Surface trusted, distance-aware options so patients can act fast.

---

## 2) Key Features (MVP Focus)

### Rescue Search (Core MVP)
- Starts at **5 km** and expands progressively (**10 → 25 → 50 km**) when stock is not found.
- Shows both available pharmacies and confirmed out-of-stock checks (proof of search effort).
- Ranks results with confidence signals based on stock freshness and pharmacy verification.
- Handles misspellings and aliases to improve successful matches.

### Pharmacy Network (Core MVP)
- Uses a network model of verified and non-verified pharmacies.
- Displays practical pickup context (distance, hours, delivery capability).
- Prioritizes listings from pharmacies that maintain reliable stock updates.

---

## 3) Technologies Used

### Frontend
- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **motion** (for UI interaction and transitions)

### Backend
- **Node.js (native `http`)** + **TypeScript**
- **PostgreSQL**
- **argon2id** password hashing
- Cookie-based server-side sessions
- **Zod** for request validation

### Tooling
- **oxlint** for linting
- **Playwright** (test scripts in repository)

---

## 4) AI / Vibe Coding Usage

This project was built using a **vibe coding workflow** with:
- **OpenCode** for fast iteration and implementation support
- **LLMs** for rapid ideation, UI/content refinement, and development acceleration

AI support was used to speed up delivery, while architecture and product decisions remained grounded in the real shortage use case.

---

## 5) Setup & Run

## Prerequisites
- Node.js 20+
- npm
- PostgreSQL

### Install dependencies
```bash
npm install
```

### Configure environment
Create `/home/runner/work/MEDYX-/MEDYX-/.env` with:

```env
DATABASE_URL=postgres://<user>:<password>@localhost:5432/<db_name>
AUTH_PEPPER=<strong_random_secret>
SESSION_COOKIE_NAME=medyx_session
SESSION_TTL_DAYS=7
PORT=8787
NODE_ENV=development
```

### Prepare database
```bash
npm run db:migrate
npm run db:seed
```

### Run frontend (development)
```bash
npm run dev
```

### Run backend API server
```bash
npm run api
```

### Production build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

---

## Demo Accounts (Seeded)
Shared password:
```text
MedyxDemo123
```

- `patient1@demo.medyx.test`
- `patient2@demo.medyx.test`
- `patient3@demo.medyx.test`
- `pharmacy1@demo.medyx.test`
- `pharmacy2@demo.medyx.test`
- `pharmacy3@demo.medyx.test`
- `admin@demo.medyx.test`

---

## Important Note
This MVP currently uses **simulated demo data** for pharmacies, stock levels, and update times to demonstrate the product flow and Rescue Search logic.
