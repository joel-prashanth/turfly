# Architecture: Turfly

Reflects the actual state of the `feature/frontend` branch as of this writing. This is a description of what exists, not a target design — update it as the codebase changes rather than letting it drift into aspiration.

---

## Stack

**Backend:** Node.js, Express 5, Prisma 6 ORM, PostgreSQL, JWT auth via HTTP-only cookies, bcrypt for password hashing, Cloudinary for image storage, Multer for upload handling.

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Framer Motion, React Hot Toast, Radix UI / Headless UI primitives, date-fns, react-datepicker.

**Monorepo layout:** `backend/` and `frontend/` as sibling directories, each with their own `package.json`. No shared workspace tooling (no Turborepo/Nx) — they're independent Node projects developed together.

---

## Backend architecture

Layered, and the existing `docs/auth-module.md` documents the pattern precisely — this generalizes across every module, not just auth:

```
Request → Route → Controller → Service → Prisma → Database
```

- **Route layer** (`*.routes.js`): URL mapping and middleware chaining only. No business logic, no DB calls.
- **Controller layer** (`*.controller.js`): reads request data, calls services, sets status codes, returns JSON, manages cookies. No business logic, no direct DB calls.
- **Service layer** (`*.service.js`): validation, business rules, authorization decisions, all Prisma calls. No HTTP concerns (no `req`/`res`).

This is consistently followed across modules. When adding a new feature, put logic in the service layer even if it's tempting to shortcut it in the controller.

### Modules (`backend/src/modules/`)

| Module | Responsibility |
|---|---|
| `auth` | Register, login, JWT issuance, current-user lookup |
| `turf` | Turf (venue) CRUD, owned by a `User` with role `OWNER` |
| `slot` | Time-slot creation/editing/blocking per turf; owner calendar view |
| `bookings` | Booking creation, cancellation, player's booking list, owner's booking list (paginated/searchable), lifecycle/expiry handling |
| `dashboard` | Owner-facing revenue analytics |
| `stats` | (separate from dashboard — check for overlap before adding new analytics endpoints) |
| `upload` | Cloudinary image upload handling |

### Auth & authorization

- JWT stored in an HTTP-only cookie (`accessToken`), not in JS-accessible storage. Payload is `{ userId, role }`, 7-day expiry.
- `middleware/authenticate.js` verifies the JWT, re-fetches the user from the DB (not just trusting the token payload), and populates `req.user`.
- `middleware/authorize.js` is a middleware factory: `authorize("OWNER")` or `authorize("OWNER", "ADMIN")`, checks `req.user.role` against the allowed list.
- Roles: `OWNER`, `PLAYER`, `ADMIN` (enum in schema). Registration only allows `OWNER` or `PLAYER` — `ADMIN` is reserved, not self-assignable.

### Routing

All routes are mounted under `/api/v1/` in `app.js`: `/auth`, `/upload`, `/turfs`, `/slots`, `/bookings`, `/stats`, `/dashboard`.

CORS is currently hardcoded to `http://localhost:5173` with `credentials: true` — **this will need to become an environment variable before any non-local deployment.**

---

## Data model (Prisma schema)

### Core entities

- **User** — `id, name, email, phone, passwordHash, role`. One user can own many `Turf`s and have many `Booking`s (as a player).
- **Turf** — a venue. `name, description, location, pricePerHour, sport, imageUrl, imagePublicId, isActive`. Belongs to one `User` (owner). Has many `Slot`s.
- **Slot** — a bookable time window on a turf. `startTime, endTime, status` (enum: `AVAILABLE | BOOKED | BLOCKED`). Has at most one `Booking` (1:1 — note the `slotId @unique` constraint on `Booking`).
- **Booking** — `playerId, slotId, status` (enum: `PENDING | CONFIRMED | COMPLETED | CANCELLED`).

### Known schema gap — flag before building commission logic

**There is currently no field distinguishing how a booking was created.** Every `Booking` record looks identical whether a player booked it through the app or an owner manually blocked/recorded it on behalf of a walk-in.

This matters directly for the locked business model in `CLAUDE.md`: commission applies only to platform-originated bookings, not to walk-ins or owner-added bookings. **Before building any commission/payout logic, add a field to distinguish booking origin** — e.g.:

```prisma
enum BookingSource {
  PLATFORM
  OWNER_MANUAL
}

model Booking {
  ...
  source BookingSource @default(PLATFORM)
  ...
}
```

This is currently a one-line migration with no data to backfill (early-stage prototype). It will not stay that simple once real bookings exist — treat this as a near-term priority, not a someday item.

### Known bug — slot lifecycle on expiry

`bookingLifecycle.service.js` → `releaseExpiredBookings()`: when a `CONFIRMED` booking's slot `endTime` has passed, the booking is correctly marked `COMPLETED`, but the **slot status is reset to `AVAILABLE`**. A slot whose time window is already in the past should not become bookable again — this likely needs a status like `COMPLETED` or simply to be excluded from "available" queries by time, not just by status. Worth fixing before this surfaces as a confusing "available slot in the past" bug in the UI.

This function is called defensively at the top of nearly every booking/slot read path (`createBooking`, `getMyBookings`, `cancelBooking`, `getOwnerBookings`, `getSlotsByTurfId`, `getOwnerCalendar`) rather than running as a scheduled job — i.e., expiry is lazily reconciled on read, not on a cron. Worth knowing when reasoning about consistency: there's no background process, so a slot's status is only as fresh as the last time *any* of these endpoints was hit.

---

## Booking flow — how the single-source-of-truth requirement is actually implemented

This is the part of `CLAUDE.md`'s competitive-gap priority #1 that's worth documenting precisely, because it's already done correctly and future changes should preserve this property:

`booking.service.js` → `createBooking()`:
1. Runs `releaseExpiredBookings()` first, to reconcile any stale slot states before checking availability.
2. Opens a Prisma `$transaction`.
3. Inside the transaction: re-fetches the `Slot` fresh (not from a cached/earlier read), checks `slot.status !== "AVAILABLE"` and `slot.booking` existence.
4. Creates the `Booking` and updates `Slot.status` to `BOOKED` **in the same transaction.**

This means there is no window where the player-facing availability view and the owner's actual slot state can diverge due to a race — the check-then-write happens atomically. **Any future change to booking creation must preserve this transactional check-then-write pattern.** A common way this gets accidentally broken: adding a pre-check (e.g. "is this slot available?") as a separate API call before the actual booking call, which reintroduces a race window between the check and the write.

Owner-side `blockSlot` / `unblockSlot` write to the exact same `Slot.status` field the player-facing queries read — there is no separate "owner calendar" data source to fall out of sync. This is the correct architecture per the competitive gap; preserve it as new owner-side features are added (e.g. don't introduce a denormalized "owner view" of slot state that needs separate syncing).

---

## Frontend structure (`frontend/src/`)

- **`api/`** — one file per domain (`authApi.js`, `bookingApi.js`, `slotApi.js`, `turfApi.js`, `dashboard.js`, `analytics.js`, `stats.js`, `myBookingApi.js`), all going through a shared `axios.js` instance. Mirrors the backend module split.
- **`pages/`** — route-level components, roughly one per page (`TurfListPage`, `TurfDetailsPage`, `MyBookingsPage`, `OwnerDashboardPage`, `OwnerCalendarPage`, `OwnerBookingsPage`, `ManageSlotsPage`, `CreateSlotPage`, `CreateTurfPage`, `EditTurfPage`, etc.). Clear owner-vs-player separation at the page level.
- **`components/`** — organized by domain (`booking/`, `owner/`, `player/`, `slots/`, `turf/`, `filters/`, `modals/`, `layout/`), plus a generic `ui/` for primitives and `skeletons/` for loading states.
- **`context/AuthContext.jsx`** + **`hooks/useAuth.js`** — auth state management.
- **`utils/bookingLifecycle.js`** — frontend-side companion to the backend lifecycle logic; check this against the backend's `releaseExpiredBookings` behavior to ensure they agree on what "expired" means.

No global state library (Redux/Zustand) — state appears to be managed via React context + local component state + React Query-style data fetching via the `api/` layer (verify against actual data-fetching pattern in a page component if adding a new data dependency).

---

## What's explicitly not built yet

Cross-referencing against `COMPETITIVE_GAPS.md`, these priorities have no corresponding code yet:

- No no-show / cancellation-timing tracking on `Booking` (no field capturing time-of-cancellation relative to slot start).
- No per-venue cancellation/reschedule policy data on `Turf` — nothing for the frontend to display before booking.
- No notification system at all (no preference model, no notification table/service).
- No `BookingSource` field (see schema gap above) — meaning commission logic literally cannot be built correctly yet.
- No commission/payout calculation anywhere — `analytics.service.js` computes gross revenue (`pricePerHour × duration`) only, with no concept of platform cut vs. owner payout.

These aren't bugs — the prototype hasn't reached them yet. Listed here so priority/sequencing decisions in `ROADMAP.md` (once written) can reference concrete starting points instead of re-deriving "what's missing" from scratch each time.
