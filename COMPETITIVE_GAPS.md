# Competitive Gaps Checklist

Engineering-facing companion to CLAUDE.md. These are confirmed failure modes pulled from real competitor app-store reviews, not assumptions. Use this as a checklist when designing a feature or reviewing a PR that touches booking, availability, cancellation, or notifications — if a change makes one of these worse, that's a flag, not just a nitpick.

---

## 1. Availability must never lie

**The failure (competitor):** A booking is shown as confirmed in-app, but the venue has no record of it / has already given the slot to someone else. Player shows up, gets turned away. Platform's only resolution is a refund — which doesn't fix the trust break.

**Root cause:** Two separate sources of truth — the app's booking record and the venue's actual slot state — that can drift out of sync.

**What to check in any related PR:**
- Is there ever a code path where a slot can be marked "available" in the player-facing view while the owner has it blocked/booked elsewhere? If yes, that's the bug class — stop and redesign.
- When an owner blocks a slot (walk-in, maintenance, rain), does that write happen to the *same* table/record the player-facing availability query reads from? Not a cache, not a sync job, not eventual consistency — the same source.
- Are there race conditions where two players could both successfully book the same slot? (Classic double-booking — needs a DB-level constraint or transaction lock, not just app-level validation.)
- If a booking write fails partway (payment succeeds, slot reservation fails, or vice versa), is there a defined rollback? "Confirmed but not really confirmed" is often a partial-failure bug, not a logic bug.

---

## 2. Policies must be visible before commitment, not discovered after

**The failure (competitor):** Reschedule/cancellation limits are set per-venue, not shown to the player before booking, and there's no warning when a player is about to exhaust their last reschedule. Once exhausted, cancellation isn't possible either — player finds out by hitting a wall.

**What to check in any related PR:**
- Does the booking confirmation screen display the *specific* venue's cancellation/reschedule policy, not a generic platform-wide one?
- If a venue has a "1 reschedule allowed" rule, does the UI show "this is your last reschedule" before they use it, not after?
- Is there ever a state where a player has no cancellation path available and isn't told why, in advance?
- When policies differ per venue, is that data actually queryable per-venue in the schema, or hardcoded/global? (If global, this whole feature can't work correctly.)

---

## 3. No-show / last-minute cancellation needs a real consequence

**The failure (competitor):** Players cancel an hour or two before a group game with no deterrent, breaking it for everyone else. Long-time users specifically asked for *some* mechanism — none of the major competitors have shipped one well.

**What to check in any related PR:**
- Does the data model support tracking a player's cancellation/no-show history at all? (If not, nothing downstream — score, deposit, cooldown — can be built later without a migration.)
- Is "time before slot start" captured at the moment of cancellation, not just "cancelled: true/false"? You need the *timing* to differentiate a fine 3-day-ahead cancellation from a same-hour bail.
- This doesn't need to be solved in v1, but the cancellation event needs to capture enough data (who, when relative to slot start, which venue's policy was in effect) that a reliability score or deposit system can be retrofitted without re-deriving history.

---

## 4. Notifications need a ceiling and a preference, not just a trigger

**The failure (competitor):** High-frequency push notifications for engagement (reminders, social features, recommendations) sent regardless of how often the user actually interacts with the app — explicitly called out as annoying by long-term users.

**What to check in any related PR:**
- Does every new notification type have an associated user preference (on/off, or frequency), or is it hardcoded to fire?
- Is there a reasonable default ceiling (e.g. max N notifications/day) that a stack of well-intentioned individual features could collectively blow past?
- Booking-critical notifications (slot confirmed, reschedule deadline approaching, cancellation processed) should be treated differently from engagement notifications (recommendations, social activity, marketing) — don't let them share the same on/off toggle.

---

## 5. Owner-side data views must be internally consistent

**The failure (competitor):** A partner/owner dashboard's booking history view doesn't preserve date-range filters when navigating into a booking detail and back — silently resets to "today," and only shows a small fixed number of results per range instead of the full set.

**What to check in any related PR:**
- When an owner drills into a booking detail and navigates back, does the dashboard preserve their filter/date-range state, or silently reset it?
- Are list views that claim to show "all bookings in this range" actually paginated under the hood without making that obvious? (Silent truncation reads as a data-integrity bug to an owner reconciling revenue.)
- Any owner-facing number (revenue, booking count, occupancy) needs to be traceable back to the underlying records — if an owner can't reconcile what the dashboard says against what they remember happening, that's the same trust failure as #1, just on the supply side.

---

## How to use this file

- When scoping a new feature touching booking/availability/cancellation/notifications, skim the relevant section above before writing the design.
- When reviewing a PR in these areas, treat a "yes, this could happen" answer to any check above as a blocker, not a nice-to-have fix later — these are exactly the failure modes that have already cost competitors user trust at scale.
- This file is about *failure modes*, not feature specs. For sequencing/priority of fixes, see CLAUDE.md and (once available) ROADMAP.md.
