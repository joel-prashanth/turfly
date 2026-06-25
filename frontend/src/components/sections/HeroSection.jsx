import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import Section from "../ui/Section";
import Button from "../ui/Button";
import AnimatedCounter from "../ui/AnimatedCounter";

import { getPlatformStats } from "../../api/stats";

import heroImage from "../../assets/images/hero-turf.png";

function HeroSection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    turfs: 0,
    owners: 0,
    players: 0,
    bookings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch platform stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-green-50">
      {/* Background Glow */}
      <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
      <div className="absolute -right-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-emerald-200/25 blur-3xl" />

      <div className="relative grid items-center gap-20 lg:grid-cols-2">
        {/* ================= Left ================= */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">
            <Star size={15} fill="currentColor" />
            India's Premium Turf Booking Platform
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
            Find & Book
            <span className="block text-green-600">Premium Sports Turfs</span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Discover verified football, cricket, badminton, tennis and
            multi-sport venues across India. Fast bookings, transparent pricing,
            and an experience built for players.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/turfs${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);
            }}
            className="mt-10 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-300 focus-within:border-green-300 focus-within:shadow-2xl"
          >
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by turf or city..."
                  className="w-full bg-transparent py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Button type="submit" className="px-8">Search</Button>
            </div>
          </form>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/turfs">
              <Button>
                Browse Turfs
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="secondary">Become an Owner</Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              {
                icon: ShieldCheck,
                text: "Verified Venues",
              },
              {
                icon: CalendarCheck,
                text: "Instant Booking",
              },
              {
                icon: MapPin,
                text: "Multiple Cities",
              },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm"
              >
                <Icon size={16} className="text-green-600" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ================= Right ================= */}
        <div className="relative hidden items-center justify-center lg:flex">
          {/* Background Glow */}
          <div className="absolute h-[540px] w-[540px] rounded-full bg-green-200/30 blur-3xl" />

          {/* Hero Image */}
          <div className="relative rounded-[2rem] border border-white/70 bg-white/30 p-3 shadow-2xl backdrop-blur-sm">
            <img
              src={heroImage}
              alt="Turfly Hero"
              className="h-[560px] w-full rounded-[1.6rem] object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>

          {/* Rating Card */}
          <div className="absolute left-0 top-14 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Star
                  size={20}
                  fill="currentColor"
                  className="text-yellow-500"
                />
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">4.9</p>
                <p className="text-sm text-slate-500">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Live Turf Count */}
          <div className="absolute bottom-10 right-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
            <p className="text-3xl font-bold text-green-600">
              <AnimatedCounter end={stats.turfs} suffix="+" />
            </p>

            <p className="mt-1 text-sm text-slate-500">Premium Turfs</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default HeroSection;
