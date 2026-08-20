# MEDYX — Supply Rescue

**Find the medicine. Rescue the supply.**

MEDYX is a medicine availability and shortage intelligence platform. It helps
patients locate medicines that are hard to obtain by searching live pharmacy
availability, expanding the search radius when stock runs out, surfacing
shortage risk, and connecting eligible patients to pre-funded medicine support.

> MEDYX is **not** a government platform, **not** an insurance provider and
> **not** a diagnosis system.

**Core journey:** Medicine Search → Availability → Rescue Search → Pharmacy →
Optional Rescue Support → Pickup/Delivery

---

## Status

- **Phase 1** — design system, Medicine Capsule primitive, homepage shell ✅
- **Phase 2** — functional Rescue Search with demo data ✅
- **Phase 3** — authentication foundation + interactive capsule splash ✅
- **Phase 4** — MEDYX Home wired into the authenticated app ✅

The remaining six feature capsules still show their descriptive body.

### Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (theme defined via `@theme` tokens in `src/index.css`)
- `motion` for capsule spring physics

### Commands

```bash
npm run dev      # dev server on 0.0.0.0:5173
npm run build    # typecheck + production build
npm run lint     # oxlint
```

> On a low-memory machine the build may need
> `NODE_OPTIONS="--max-old-space-size=1600" npx vite build`.

---

## Structure

```
src/
  data/
    demoData.ts        # DEMO ONLY — medicines, pharmacies, stock records
  lib/
    rescueSearch.ts    # pure engine: matching, distance, confidence, rings
    useRescueSearch.ts # search state machine (idle → results → exhausted)
  design/
    capsuleStates.ts   # interaction + status model, themes, motion constants
    features.ts        # the 7 MEDYX features (single source of truth)
  components/
    rescue/
      RescueSearchPanel.tsx  # the live Rescue Search interface
      PharmacyCapsule.tsx    # one availability row (capsule primitive)
      RadiusRings.tsx        # concentric 5/10/25/50 km rings
      LocationPicker.tsx     # demo location switcher
    MedicineCapsule.tsx    # THE core primitive — all 8 states
    FeatureCapsule.tsx     # binds a feature definition to the primitive
    MedicineSearch.tsx     # primary interaction: search + location + Gemini
    Hero.tsx               # "Find the medicine / Rescue the supply"
    TopNav.tsx             # MEDYX · Near Me · Profile (no sidebar)
    AmbientCanvas.tsx      # ice-blue blooms + faint grid
    Icons.tsx              # small hand-drawn icon set
  index.css            # design tokens + utilities
  App.tsx              # homepage shell
```

---

## Design system

### Palette

| Token    | Role                                        |
| -------- | ------------------------------------------- |
| `ice`    | very light ice blue / pale cyan canvas      |
| `medic`  | medical green — primary brand + rescue CTA  |
| `neon`   | subtle neon green — live pulse only         |
| `cyan`   | accents: data, intelligence, AI             |
| `ink`    | dark blue-gray typography                   |
| `warn`   | low supply                                  |
| `crit`   | shortage                                    |

Also: `--radius-capsule/panel/soft`, `--shadow-soft/lift/panel`, and the
`glass-panel` / `glass-rail` / `surface-card` utilities.

**Restraint rules:** glass is used only on the nav rail and select panels;
neon appears only in pulse rings and live dots; white remains the default
surface. No cyberpunk, no permanent sidebar, no KPI cards.

### The Medicine Capsule

Two orthogonal dimensions produce the eight required states:

- **Interaction** — `idle · hover · active · expanded · loading`
- **Status tone** — `neutral · success · warning · critical`

Hover scales to 1.022 and lifts 4px with a status-tinted glow; press settles to
0.995. Clicking springs the height open while the border-radius morphs from a
999px capsule into a 28px panel. The resolved state is exposed on the DOM as
`data-interaction` / `data-status` for testing.

```tsx
<MedicineCapsule
  title="Insulin Glargine"
  tagline="4 verified units held at 2.1 km"
  status="success"
  icon={<PulseIcon className="size-[18px]" />}
  metric={{ value: '2.1 km', caption: 'nearest' }}
>
  {/* expanded feature interface */}
</MedicineCapsule>
```

Props: `title`, `tagline`, `status`, `statusLabel`, `icon`, `metric`,
`expanded` + `onToggle` (controlled) or self-managed, `loading`, `size`
(`md` | `lg`), `static`, `className`.

Accessibility: real `<button>` head, `aria-expanded` / `aria-controls`,
visible focus rings, and a global `prefers-reduced-motion` guard.

---

## Verified

- Typecheck and production build pass (≈109 kB gzip JS, ≈8 kB gzip CSS)
- No console/page errors
- No horizontal overflow at 360 / 768 / 1024 / 1440 px
- Accordion behaviour: opening one capsule collapses the previous

---

## Rescue Search (Phase 2)

Radius ladder: **5 km → 10 km → 25 km → 50 km**. Each sweep reports what it
found *and* how many pharmacies confirmed they were out, so an empty ring still
shows evidence of the search.

**Confidence** blends how recently a pharmacy confirmed its count with whether
it is network-verified. Freshness decays over 24 h; unverified pharmacies take
an 18-point penalty. ≥75 = high, ≥45 = medium, below = low.

### Demo scenarios (from Zamalek)

| Query | Behaviour |
| --- | --- |
| `Metformin` | Found immediately in the 5 km ring |
| `Amoxicillin` | Low/stale listings only at 5 km — advises expanding |
| `Ventolin` | Out nearby, resolves at 10 km (brand → Salbutamol) |
| `Insulin` / `Lantus` | Resolves at 25 km |
| `Tegretol` | Full 5 → 50 km escalation (brand → Carbamazepine) |
| `Warfarin` | Exhausts the network → Rescue Support handoff |

Misspellings (`amoxicilin`, `metformine`, `glargin`) and local names resolve via
edit-distance matching, shown as a "Gemini AI read …" line. All data is
simulated and labelled as such in the UI.

## Phase 3 — Authentication

Real full-stack auth: PostgreSQL + argon2id + opaque server-side sessions.
The splash is one interactive medicine capsule that opens into Patient (left)
and Pharmacy (right) halves; the auth form emerges from the selected half.

### Setup

```bash
sudo pg_ctlcluster 17 main start      # PostgreSQL will not auto-start here
cp .env.example .env                  # then fill in the values
npm install
npm run db:migrate
npm run db:seed
NODE_OPTIONS="--max-old-space-size=1500" npx vite build
npm run api                           # serves API + dist/ on :8787
```

One Node process serves both the JSON API and the built SPA on port 8787, so
there is no CORS surface and the client uses relative paths only.

> The Vite dev server OOMs in this 1984 MB sandbox. Build, then run `npm run api`.

### Demo accounts

All synthetic, flagged `is_demo = TRUE`, on the reserved `@demo.medyx.test`
domain. Shared password: `MedyxDemo123`.

| Email | Role | Notes |
| --- | --- | --- |
| `patient1@demo.medyx.test` | patient | also `patient2`, `patient3` |
| `pharmacy1@demo.medyx.test` | pharmacy | Demo Nile Care — verified |
| `pharmacy2@demo.medyx.test` | pharmacy | Demo Heliopolis Medical — verified |
| `pharmacy3@demo.medyx.test` | pharmacy | Demo Maadi Riverside — unverified |
| `admin@demo.medyx.test` | admin | not self-registerable |

### Endpoints

| Method | Path | Codes |
| --- | --- | --- |
| GET | `/api/health` | 200 |
| POST | `/auth/signup` | 201 / 409 / 422 |
| POST | `/auth/login` | 200 / 401 / 422 / 429 |
| POST | `/auth/logout` | 200 |
| GET | `/auth/me` | 200 / 401 |
| GET | `/auth/protected/{patient\|pharmacy}` | 200 / 401 / 403 |

### Security

argon2id (m=19456, t=2, p=1) with a peppered `secret`; 256-bit opaque tokens
with only their SHA-256 persisted; httpOnly + sameSite=lax cookies (secure in
production); constant-time dummy verify so unknown emails and wrong passwords
are indistinguishable; per-IP login limiting (10/min); `password_hash` never
crosses the API boundary.

## Phase 4 — MEDYX Home

The authenticated route is now:

```
SplashScreen (auth capsule) → AuthenticatedShell (branded handoff) → MedyxHome
```

A returning user with a valid cookie session sees only the ~0.9 s handoff
capsule before landing on Home — never the auth capsule.

Home has exactly one dominant action: **search for a medicine**. Rescue Search
is the primary expanded capsule; Gemini AI, Shortage Radar, Rescue Support and
Pharmacy Network are collapsed previews. Stock Pulse and Supply Intelligence
stay defined in `features.ts` but are withheld from Home.

### Dark mode on the product surface

The Phase 1/2 components were written in literal ramps (`ice-*`, `ink-*`,
`medic-*`). Tailwind v4 compiles those to `var(--color-*)`, so the ramps are
redefined inside `.dark` in `src/index.css` — the whole surface re-themes
without rewriting the markup. It is a re-design, not an inversion: `ink-*` is
inverted (it is the type scale), text-role greens/cyans lighten, and button
fills stay saturated. Use `bg-paper` rather than `bg-white` for any surface
that must survive dark mode.

### Bundle & code-splitting

The product surface is lazy-loaded behind the auth boundary, and the (large,
stable) vendor runtime is split from app code so an app deploy does not
invalidate it in the user's cache.

| Chunk | Size | gzip | Loaded |
| --- | --- | --- | --- |
| `vendor-react` | 366.5 kB | 110.8 kB | always |
| `vendor-motion` | 152.7 kB | 49.6 kB | always |
| `index` (app shell + auth) | 33.4 kB | 9.1 kB | always |
| `MedyxHome` | 75.4 kB | 17.8 kB | **after sign-in only** |
| CSS | 52.9 kB | 10.4 kB | always |

Before splitting this was a single 626.7 kB chunk that tripped Vite's 500 kB
warning. An anonymous visitor now downloads ~553 kB instead of ~627 kB, and
**no chunk exceeds the warning threshold**. The Home chunk is prefetched during
the handoff animation, so the split costs no perceived latency.

### Accessibility

Text tokens were re-derived to meet WCAG AA (4.5:1 body, 3:1 large) against the
ice canvas in light mode and the navy canvas in dark mode. The green CTA fill
is a dedicated `action-fill` token pair rather than the `medic-*` ramp, because
the ramp is remapped in dark mode while a button carrying white text must stay
dark enough for AA in *both* themes. Verified by pixel sampling: 5.50:1 light,
5.36:1 dark. Do not lighten `--md-action-*` or `--md-head-*` without re-checking.

## Next phase

1. Reserve/hold flow — confirmation, pickup vs delivery
2. Rescue Support eligibility flow (the exhausted-network handoff)
3. Real Gemini AI integration + prescription box scan
4. Live interfaces for the remaining capsules (Stock Pulse, Shortage Radar …)
5. Routing and deep links to a search result
6. Real pharmacy/inventory API replacing `src/data/demoData.ts`
