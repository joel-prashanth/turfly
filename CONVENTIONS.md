# Conventions: Turfly

Patterns observed in the existing codebase. Follow these for consistency. Where the codebase is currently inconsistent with itself, that's called out explicitly — treat those as known debt, not as license to add a third inconsistent variant.

---

## Backend (`backend/src/`)

### File naming

- `<domain>.routes.js`, `<domain>.controller.js`, `<domain>.service.js` — one of each per module folder under `modules/<domain>/`.
- Extra service files for sub-concerns are fine (e.g. `bookingLifecycle.service.js` alongside `booking.service.js`) — split when a concern is genuinely separate, not just to shorten a file.

### Layering — enforced, not optional

Route → Controller → Service → Prisma. See `ARCHITECTURE.md` for the full breakdown. Concretely:

- **Routes** only call `router.METHOD(path, [...middleware], controllerFn)`. Never inline logic here.
- **Controllers** never call `prisma` directly. If you're reaching for `prisma.` inside a `*.controller.js`, the logic belongs in the service.
- **Services** never touch `req`/`res`. If a service needs something from the request, pass it as a plain argument from the controller.

### Controller pattern (current, with a known inconsistency to fix going forward)

```js
const someAction = async (req, res) => {
  try {
    const { someParam } = req.body; // or req.params / req.query
    const { userId } = req.user;

    const result = await someService.someAction(someParam, userId);

    return res.status(200).json({
      success: true,
      message: "Description of what happened",
      someResult: result, // or `data: result` — see note below
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
```

**Known inconsistency — don't propagate it further:**
1. Some controllers return the payload under a domain-specific key (`booking:`, `bookings:`), others under a generic `data:` key (e.g. `getOwnerBookings`). Pick one convention when touching these endpoints next — generic `data:` is easier for a shared frontend response-unwrapper, but changing this is a breaking API change, so don't do it silently as a drive-by in an unrelated PR.
2. Every caught error currently returns HTTP `400`, regardless of whether the actual failure is an auth issue (401/403), a not-found (404), or an unexpected server error (500). Services throw plain `Error` with a message; controllers don't currently inspect error type. If you add typed/custom errors (e.g. `NotFoundError`, `ForbiddenError`) to fix this, do it as a deliberate pass across all controllers at once, not piecemeal — half-typed errors are worse than consistently-untyped ones.

### Service pattern

- Validate inputs at the top of the function, throw plain `Error("message")` for anything invalid — the message is what reaches the client via the controller's catch block, so write it as a user-facing string, not an internal debug note.
- Any operation that reads a record to check a precondition (status, ownership, existence) and then writes based on that check **must happen inside a `prisma.$transaction`** if there's any chance of a race (two requests touching the same row). `booking.service.js`'s `createBooking` is the reference implementation — re-fetch fresh inside the transaction, don't reuse a value read before the transaction opened.
- Ownership checks follow a consistent shape: fetch the resource, compare `resource.ownerId !== requestingUserId`, throw `"You are not authorized to..."` if it fails. See `slot.service.js`'s `getOwnedSlot` as the pattern to reuse rather than reimplementing per-module.

### Prisma / schema

- Enums for fixed sets of states (`Role`, `SlotStatus`, `BookingStatus`, `Sport`) — follow this for any new fixed-vocabulary field rather than a free-text string.
- `@default(uuid())` for all primary keys.
- `createdAt`/`updatedAt` (`@default(now())` / `@updatedAt`) on models where history matters — add these to any new model that represents a real-world event or mutable entity, even if not strictly needed on day one.
- Before adding a new field that affects money or business logic (commission, payout, pricing), check `CLAUDE.md` first — several of these are already specified there (e.g. `BookingSource`) and should be added as designed, not reinvented.

### Migrations

- One focused migration per concern — the existing migration history (`add_image_public_id_to_turf`, `add_turf_metadata`, `add_completed_booking_status`, `add_timestamps_to_turf`) shows small, descriptively-named, single-purpose migrations rather than batched schema changes. Keep doing this.

---

## Frontend (`frontend/src/`)

### File organization

- `api/<domain>.js` — one file per backend module, thin wrapper functions around a shared `axios` instance (`api/axios.js`). Each function: build the request, `return response.data`. No business logic, no error handling beyond what axios/interceptors already do — let the calling component handle errors (likely via `react-hot-toast`, given the dependency).
- `pages/` — route-level components. Owner-facing and player-facing pages are kept visually separate by name (`Owner*Page.jsx` vs. unprefixed/player pages) — keep this naming split for any new page rather than introducing a different role-prefixing convention.
- `components/<domain>/` — mirrors the `api/` and backend module split (`booking/`, `owner/`, `player/`, `slots/`, `turf/`). Put new components in the matching domain folder; don't default to a flat `components/` root.
- `components/ui/` — generic, domain-agnostic primitives (buttons, inputs, etc.). `components/skeletons/` — loading-state placeholders, kept separate from the real components they shadow.

### Styling

- Tailwind v4 (via `@tailwindcss/vite`), not v3 — check current Tailwind v4 syntax/config conventions if anything looks like it's not applying as expected, since v4's config approach differs from v3.
- `clsx` is available for conditional className composition — use it rather than manual template-string concatenation for conditional classes.

### State & data fetching

- No global state library. Auth state lives in `context/AuthContext.jsx` + `hooks/useAuth.js`. Component-local state otherwise.
- No evidence of React Query/SWR — data fetching appears to be manual (`useEffect` + `api/` call + local state), so don't assume a query-caching layer exists when writing new data-dependent components; check the existing page patterns first.

### Linting

- ESLint flat config (`eslint.config.js`), `react-hooks` + `react-refresh` plugins active. `react-hooks/set-state-in-effect` is explicitly turned off — don't "fix" violations of that specific rule, it's intentionally disabled.

---

## Cross-cutting

### Error messages

Service-layer `Error` messages are written as direct, user-facing sentences ("Only available slots can be booked", "You are not authorized to cancel this booking") — not error codes, not technical jargon. Keep doing this; it means the controller can pass `error.message` straight to the client without translation, but it also means **don't put internal/debug detail in these messages** since they're shown to end users as-is.

### Console logging

`bookingLifecycle.service.js` uses fairly verbose `console.log` blocks for debugging the lifecycle reconciliation. This is fine for a prototype but should be replaced with a real logger (or removed/gated behind an env flag) before this becomes a production cron-adjacent path that runs on every request.

### When in doubt

Find the most structurally similar existing module/component and match its shape. This codebase is consistent enough, module-to-module, that "what would the `slot` module do" is usually a faster and more reliable answer than reasoning from general best practices.
