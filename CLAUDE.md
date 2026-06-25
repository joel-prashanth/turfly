# Project Context: Turf Booking App

This file is persistent context for Claude Code. Read this before making product, schema, or business-logic decisions. It captures decisions already made — don't relitigate them without flagging the conflict to the user first.

---

## What this product is

A two-sided turf/sports venue booking marketplace (players + venue owners), launching in Hyderabad. Competing primarily against Playo (market leader), with Hudle, KheloMore, Turf Town, and PlaySpots as secondary competitors.

Strategy: **both sides of the marketplace simultaneously**, not a single-sided wedge. This is the harder build but is the deliberate choice — see rationale below.

---

## Competitive landscape (summary)

- **Playo** — market leader, ~5M users. Broad (50+ sports) + social feed + coaching + gear marketplace. Monetizes via commission + subscriptions + ads.
- **Hudle** — fastest-growing funded challenger ($5.85M raised, Series A Dec 2025). Runs a genuine two-sided platform with a dedicated Partner app (slot management, GST invoicing, UPI collection, staff management, equipment POS). **Charges 0% commission to venues** — monetizes via SaaS-like partner tooling instead.
- **KheloMore** — commission-based, similar feature set to Playo. Users/organizers on record praising KheloMore specifically for *not* stacking a player-side convenience fee on top of commission (implying competitors do this and it's resented).
- **Turf Town, PlaySpots, TurfBooking.in, TurfBox** — thinner, mostly single-feature or regional players.

### Confirmed user-facing failure modes (from real app store / review data, not assumption)

1. **Booking shown as confirmed isn't actually guaranteed at the venue.** Root cause: platform doesn't have real-time sync with the venue's true slot state — booking layer and ground-truth inventory are different systems. This is the single most trust-destroying failure in the category.
2. **Venue-set policies (reschedule limits, cancellation windows) are invisible until a user hits them.** No upfront disclosure, no warning before a limit is exhausted.
3. **No-shows / last-minute cancellations have no real deterrent**, breaking group bookings for everyone else.
4. **Notification fatigue** — high-frequency engagement-style push notifications resented by users who just want to book 1-2x/week.
5. **Owner-side dashboards have data-integrity rough edges** (e.g. booking history views that don't preserve filter/date-range state) that erode trust in the dashboard as a single source of truth.

### The structural gap behind all of this

Most competitors are a **discovery/listing layer** sitting on top of whatever the venue's real booking process is (often still a register or WhatsApp). The app's "available slots" can lie because the backend truth lives somewhere else. Hudle is the only major player treating this as a systems/inventory problem rather than a listings problem — likely why it's the fastest-growing funded competitor.

**Implication for this build:** the owner-side dashboard's slot state must BE the single source of truth, not a sync layer on top of a separate owner process. This is a schema/architecture decision, not just a feature.

---

## Product priorities (in order), derived from the gaps above

1. **Single source of truth architecture** — when an owner blocks a slot (walk-in, maintenance, weather), it must disappear from player-facing availability instantly. Fixes failure mode #1.
2. **Visible, structured cancellation/reschedule policy per venue**, shown before booking, with a warning when a player approaches their limit. Fixes failure mode #2.
3. **No-show accountability layer** — reliability score, forfeitable deposit, or cooldown after repeated last-minute drops. No major competitor has solved this well; open differentiation opportunity.
4. **Notification preference controls** — user-configurable frequency/type, not blanket engagement notifications.
5. **Trustworthy owner-side analytics** — accurate historical booking views, exportable reports, simple GST invoicing.
6. **Hyperlocal-first, not breadth-first.** Win 2-3 sports in Hyderabad with zero booking-trust failures before chasing Playo's 50-sport catalog.

---

## LOCKED: Business model

**Do not change this without explicit user confirmation. If asked to implement a different commission structure, flag the conflict before proceeding.**

### Structure: Volume-tiered commission, near-zero entry

| Venue's monthly bookings via platform | Commission |
|---|---|
| 0–50 bookings/month | **0%** for first 90 days on the platform (any volume) |
| 0–50 bookings/month (post-90 days) | 4% |
| 51–150 bookings/month | 3% |
| 150+ bookings/month | 2% |

Tiers scale **down** with volume (not up with tenure) — this rewards the venues bringing the most transaction volume and gives a natural upsell narrative ("hit 150 bookings/month, your rate drops"), rather than just rewarding whoever joined first.

### Three non-negotiable rules

1. **Commission applies only to platform-originated bookings.** Bookings the venue brings in themselves (existing walk-ins, regulars manually added to the calendar) are NOT commissionable. This is the single biggest objection venues have to platforms in general, and removing it is a core trust/adoption lever.

   **Schema implication:** every booking record must carry a clear, queryable origin flag — e.g. `booking_source: 'platform' | 'owner_manual'` — set at creation time, not inferred later. This needs to exist from the first migration, not retrofitted. Flag to the user immediately if the current schema can't already make this distinction.

2. **No player-side convenience fee stacked on top of commission.** Commission comes entirely out of the venue's side. Do not add a separate player-facing booking fee — this is a specific, named pain point reviewers use to favorably contrast KheloMore against competitors who do stack fees.

3. **No subscription/listing fee for venues at launch.** Zero SaaS tier in v1. This is an explicit Phase 2 lever once dashboard tooling (GST invoicing, staff management, analytics) is mature enough to be worth paying for independent of the marketplace. Don't build paywalls around dashboard features prematurely.

### Why this model (for context, not re-litigation)

Pure flat commission (Playo/KheloMore's ~10% model) makes a new entrant identical to incumbents on the one dimension owners care about most, while asking for maximum trust with zero pricing differentiation. Hudle's 0%-commission choice proved that giving up commission to win supply, then monetizing via tooling/stickiness, is a viable path for a two-sided challenger — this model borrows that logic while still building toward commission revenue once liquidity exists.

---

## Open questions / not yet decided

- Whether dashboard tooling (GST invoicing, analytics, staff management) becomes a paid SaaS tier in Phase 2, and at what venue maturity point that conversation starts.
- Exact mechanics of the no-show accountability layer (deposit vs. reliability score vs. cooldown) — flagged as a priority gap but not specced.
- Multi-city expansion sequencing beyond Hyderabad.
