import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";

import { getPlatformStats } from "../api/stats";
import { getTurfs } from "../api/turfApi";
import TurfCard from "../components/turf/TurfCard";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import Button from "../components/ui/Button";
import heroImage from "../assets/images/hero-turf.png";

const TICKER_ITEMS = [
  "Football", "Cricket", "Badminton",
  "Tennis", "Basketball", "Volleyball",
  "Football", "Cricket", "Badminton",
  "Tennis", "Basketball", "Volleyball",
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Find your sport",
    body: "Search by sport, location, or venue name. Filter by price or time of day.",
  },
  {
    num: "02",
    title: "Pick a live slot",
    body: "Every slot shown is actually open — no double-bookings, no stale listings.",
  },
  {
    num: "03",
    title: "Confirm instantly",
    body: "Your booking is locked in the moment you tap confirm. No calls, no WhatsApp follow-ups.",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ turfs: 0, owners: 0, players: 0, bookings: 0 });
  const [turfs, setTurfs] = useState([]);
  const [turfsLoading, setTurfsLoading] = useState(true);

  useEffect(() => {
    getPlatformStats().then(setStats).catch(() => {});
    getTurfs({ limit: 3 })
      .then((r) => setTurfs(r.turfs))
      .catch(() => {})
      .finally(() => setTurfsLoading(false));
  }, []);

  return (
    <main className="antialiased">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden bg-[#090E09]">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Gradient: transparent top → solid bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090E09] via-[#090E09]/70 to-[#090E09]/10" />

        {/* Content — anchored to bottom */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8">

          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
            Hyderabad's Sports Booking Platform
          </p>

          <h1 className="font-display text-[clamp(64px,12vw,120px)] font-extrabold uppercase leading-[0.88] tracking-tight text-white">
            Book Your<br />
            <span className="text-green-400">Court.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-7 text-white/60">
            Find and reserve football, cricket, and badminton courts across Hyderabad —
            real slots, instant confirmation.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/turfs${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);
            }}
            className="mt-10 flex max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm transition-colors focus-within:border-green-400/60"
          >
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search size={17} className="shrink-0 text-white/35" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sport, turf name, or area…"
                className="w-full bg-transparent py-4 text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="m-1.5 rounded-xl bg-green-500 px-6 font-semibold text-white transition hover:bg-green-400 active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Live stats row */}
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[
              { key: "turfs", label: "Turfs" },
              { key: "bookings", label: "Bookings" },
              { key: "players", label: "Players" },
              { key: "owners", label: "Venue Partners" },
            ].map(({ key, label }) => (
              <div key={key}>
                <p className="font-display text-3xl font-bold text-white">
                  <AnimatedCounter end={stats[key]} suffix="+" />
                </p>
                <p className="mt-1 text-sm text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS TICKER ───────────────────────────────── */}
      <div className="overflow-hidden bg-green-600 py-3.5 select-none">
        <div className="animate-marquee flex gap-12">
          {TICKER_ITEMS.map((sport, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-white"
            >
              {sport}
              <span className="ml-12 opacity-30">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED TURFS ──────────────────────────────── */}
      <section className="bg-[#F7F7F5] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-green-600">
                Live in Hyderabad
              </p>
              <h2 className="font-display text-[clamp(32px,5vw,52px)] font-extrabold uppercase leading-[0.92] text-gray-900">
                Play at the<br className="hidden sm:block" /> City's Best Turfs
              </h2>
            </div>
            <Link
              to="/turfs"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-green-600 transition hover:text-green-500 sm:flex"
            >
              See all turfs <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {turfsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
                ))
              : turfs.length === 0
              ? (
                <div className="col-span-3 rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
                  New venues coming soon — check back shortly.
                </div>
              )
              : turfs.map((turf) => (
                  <TurfCard
                    key={turf.id}
                    turf={turf}
                    actions={
                      <Link to={`/turfs/${turf.id}`}>
                        <Button className="w-full">View & Book</Button>
                      </Link>
                    }
                  />
                ))
            }
          </div>

          <div className="mt-8 sm:hidden">
            <Link to="/turfs">
              <Button className="w-full">See all turfs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-14 max-w-lg">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-green-600">
              How it works
            </p>
            <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold uppercase leading-[0.92] text-gray-900">
              Three steps.<br />Zero friction.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} className="border-t-2 border-gray-900 pt-7">
                <span className="font-display text-[56px] font-extrabold leading-none text-gray-300">
                  {step.num}
                </span>
                <h3 className="mt-3 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-gray-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section className="bg-[#F7F7F5] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "turfs",    label: "Turfs on platform" },
              { key: "bookings", label: "Bookings completed" },
              { key: "players",  label: "Registered players" },
              { key: "owners",   label: "Venue partners" },
            ].map(({ key, label }) => (
              <div key={key} className="border-t-2 border-green-500 pt-6">
                <p className="font-display text-[clamp(48px,7vw,72px)] font-extrabold leading-none text-gray-900">
                  <AnimatedCounter end={stats[key]} suffix="+" />
                </p>
                <p className="mt-3 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLAYER + OWNER CTA ──────────────────────────── */}
      <section className="bg-[#090E09] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid overflow-hidden rounded-3xl border border-white/8 md:grid-cols-2">

            {/* Player */}
            <div className="bg-white/5 p-10 md:p-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-400">
                For Players
              </p>
              <h3 className="font-display mt-4 text-[clamp(30px,4vw,46px)] font-extrabold uppercase leading-[0.92] text-white">
                Ready to play?
              </h3>
              <p className="mt-4 max-w-xs text-base leading-7 text-white/50">
                Browse live slots, pick your game, and book in under a minute.
              </p>
              <Link
                to="/turfs"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-400"
              >
                Find a turf <ArrowRight size={15} />
              </Link>
            </div>

            {/* Owner */}
            <div className="border-t border-white/8 bg-green-600/10 p-10 md:border-l md:border-t-0 md:p-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-400">
                For Venue Owners
              </p>
              <h3 className="font-display mt-4 text-[clamp(30px,4vw,46px)] font-extrabold uppercase leading-[0.92] text-white">
                Own a turf?
              </h3>
              <p className="mt-4 max-w-xs text-base leading-7 text-white/50">
                List your venue, manage slots, and fill your calendar — 0% commission for 90 days.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-green-400/60 px-6 py-3.5 text-sm font-semibold text-green-400 transition hover:border-green-400 hover:bg-green-400 hover:text-white"
              >
                List your venue <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-white/8 bg-[#090E09]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            <div className="lg:col-span-2">
              <Link to="/" className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                Turfly
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/35">
                Find and book sports venues across Hyderabad. Real slots, instant confirmation, zero hassle.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Platform</p>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link to="/turfs" className="transition hover:text-white">Browse Turfs</Link></li>
                <li><Link to="/register" className="transition hover:text-white">Become an Owner</Link></li>
                <li><Link to="/login" className="transition hover:text-white">Sign in</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Contact</p>
              <ul className="space-y-3 text-sm text-white/40">
                <li>hello@turfly.in</li>
                <li>Hyderabad, India</li>
              </ul>
            </div>

          </div>

          <div className="mt-12 border-t border-white/8 pt-6 text-xs text-white/20">
            © {new Date().getFullYear()} Turfly. All rights reserved.
          </div>
        </div>
      </footer>

    </main>
  );
}

export default LandingPage;
