# MEDYX — Devpost Hackathon Submission

**Tagline:** Find the medicine. Rescue the supply.

MEDYX is an MVP platform built to help patients in Egypt find critical medicines (especially insulin) during shortage periods, while giving pharmacies and partners better visibility into live availability.

---

## 1) The Problem: Insulin & Medicine Shortages in Egypt

Egypt regularly faces medicine availability gaps caused by supply-chain volatility, import pressure, price fluctuations, and uneven distribution across districts.

For patients, especially those with chronic conditions like diabetes, this creates urgent and repeated pain:
- Patients spend hours calling or visiting pharmacies without reliable stock information.
- Insulin and other life-critical medicines may be available in one area but invisible to people nearby.
- Shortages are discovered too late, after treatment continuity is already at risk.
- Families with limited income may not access immediate financial support when medicine is unavailable or unaffordable.

The result is avoidable treatment interruption, stress, and health risk.

---

## 2) Our Solution: MEDYX MVP

MEDYX is a medicine search and shortage-intelligence MVP that helps users move from uncertainty to action in minutes.

### Core MVP flow
1. **Search medicine** by brand/generic/local naming.
2. **See nearby availability** with confidence-aware stock signals.
3. **Auto-expand search radius** (5 → 10 → 25 → 50 km) when local stock is unavailable.
4. **Get rescue path**: alternative pharmacies and shortage-aware guidance.
5. **Escalate to support handoff** when network search is exhausted.

### What the MVP currently demonstrates
- Interactive medicine search UX
- Radius-based rescue search across demo pharmacy data
- LLM-assisted query understanding for misspellings/variants
- Authenticated user/pharmacy roles with secure session architecture
- Extensible capsule-based product surface for additional modules

---

## 3) Tech Stack (with OpenCode + LLMs)

### Frontend
- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** for design system/theming
- **Motion** for capsule interactions and transitions

### Backend
- **Node.js (TSX runtime) + custom API server**
- **PostgreSQL** for persistent data
- **Argon2id** password hashing + pepper strategy
- Secure cookie-based opaque sessions

### AI / Intelligence Layer
- **LLM integration path (Gemini API)** for medicine-name interpretation
- Misspelling and synonym support to improve successful medicine lookup
- Designed to integrate additional model providers as MEDYX evolves

### Build & developer workflow
- **OpenCode-assisted development workflow** for rapid iteration
- Type-safe full-stack setup with TypeScript across app/server

---

## 4) Setup Instructions

> Repository root: `/home/runner/work/MEDYX-/MEDYX-`

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL running locally or reachable remotely

### 1. Clone and install
```bash
cd /home/runner/work/MEDYX-/MEDYX-
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Set these values in `.env`:
- `DATABASE_URL`
- `AUTH_PEPPER`
- `GEMINI_API_KEY`

### 3. Prepare database
```bash
npm run db:migrate
npm run db:seed
```

### 4. Run backend API
```bash
npm run api
```

### 5. Run frontend dev server (new terminal)
```bash
npm run dev
```

### 6. Optional checks
```bash
npm run lint
npm run build
npm run typecheck
```

---

## 5) Business Model Canvas (Bullet-Point)

### Customer Segments
- Patients with chronic conditions (starting with diabetes)
- Caregivers/families searching for urgent medicines
- Independent and chain pharmacies
- NGOs/charities supporting medicine access
- Public-health and supply stakeholders

### Value Propositions
- Fast discovery of available medicine nearby
- Reduced time-to-treatment for urgent drugs
- Better pharmacy demand visibility
- Early shortage signals and rescue-routing logic
- Pathway to support for financially vulnerable patients

### Channels
- Web application (mobile-first usage)
- Pharmacy onboarding partnerships
- NGO/health-initiative collaborations
- Social/community awareness campaigns

### Customer Relationships
- Self-serve search for patients
- Assisted onboarding for pharmacies
- Trust-building through transparent confidence/status signals
- Continuous product feedback loops with local communities

### Revenue Streams
- B2B subscription for pharmacy analytics and visibility tools
- Premium institutional dashboards (aggregated shortage intelligence)
- Referral/transaction fees for optional support logistics partners
- Sponsored public-health programs and grants

### Key Resources
- Search + shortage intelligence engine
- Pharmacy data network and verification workflows
- LLM-powered medicine understanding layer
- Secure full-stack platform and domain expertise

### Key Activities
- Data ingestion and stock signal validation
- Search ranking and rescue algorithm improvement
- Pharmacy and partner onboarding
- Product iteration, trust/safety, and compliance hardening

### Key Partnerships
- Pharmacies and distributors
- Healthcare NGOs and patient-support organizations
- Hospitals/clinics for referral pathways
- Technology partners for AI and infrastructure

### Cost Structure
- Engineering and cloud infrastructure
- Data operations and pharmacy verification
- Partner onboarding and support operations
- Security, compliance, and platform maintenance

---

## 6) 3-Minute Pitch Script (For Judges)

**[0:00–0:20 | Hook]**  
Imagine your child needs insulin tonight, and every nearby pharmacy says “out of stock.” In Egypt, this is not a rare edge case—it is a repeated reality for many families managing chronic disease.

**[0:20–0:50 | Problem]**  
Medicine shortages are not only about national supply—they are also an information problem. Stock exists, but patients cannot see it quickly enough. People lose hours in panic-driven searching, and in urgent cases, treatment continuity is at risk.

**[0:50–1:30 | Solution]**  
We built **MEDYX**, an MVP that turns medicine searching into a guided rescue flow. A patient searches once, MEDYX checks nearby availability, and if nothing is found, it automatically expands the radius from 5 to 10 to 25 to 50 kilometers. We also use LLM-assisted interpretation so misspellings and brand/generic variations still resolve to meaningful results. Instead of dead ends, users get an actionable rescue path.

**[1:30–2:00 | Why it matters]**  
For patients, MEDYX reduces time, stress, and risk. For pharmacies, it creates better visibility and demand matching. For the broader system, it can evolve into real-time shortage intelligence that highlights where interventions are needed first.

**[2:00–2:35 | Traction in MVP]**  
Today’s MVP already demonstrates the full journey: search, availability checks, intelligent radius expansion, secure user flows, and an extensible platform design ready for live integrations. We focused on building a product that is not just a dashboard—but a practical, patient-first action tool.

**[2:35–3:00 | Closing / Ask]**  
Our vision is simple: no patient should miss essential treatment because medicine visibility failed them. With MEDYX, we can transform shortage chaos into coordinated access. We’re ready to scale from MVP to real pharmacy integrations and measurable health impact.

---

## Team Mission

Build trustworthy medicine-access infrastructure for Egypt—starting with insulin and critical chronic-care medicines, then scaling to broader nationwide resilience.
