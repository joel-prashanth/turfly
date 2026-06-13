import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import Section from "../ui/Section";
import Button from "../../components/ui/Button";

import heroImage from "../../assets/images/hero-turf.png";

function HeroSection() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/40 to-emerald-100/40">
      {/* Background Blur */}
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative grid items-center gap-20 lg:grid-cols-2">
        {/* ================= Left ================= */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100/70 px-4 py-2 text-sm font-semibold text-green-700">
            <Star size={16} fill="currentColor" />
            India's Premium Turf Booking Platform
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Find & Book
            <span className="block text-green-600">Premium Sports Turfs</span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
            Book football, cricket, badminton, tennis and more at verified
            sports venues across India. Fast, reliable and hassle-free.
          </p>

          {/* Search */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="text-slate-400" size={20} />

                <input
                  type="text"
                  placeholder="Search by turf or location..."
                  className="w-full bg-transparent py-3 outline-none"
                />
              </div>

              <Button className="px-8">Search</Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/turfs">
              <Button>
                Browse Turfs
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="secondary">Become an Owner</Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" />
              Verified Venues
            </div>

            <div className="flex items-center gap-2">
              <CalendarCheck size={18} className="text-green-600" />
              Instant Booking
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />
              Multiple Cities
            </div>
          </div>
        </div>

        {/* ================= Right ================= */}
        <div className="relative hidden lg:flex items-center justify-center">
          {/* Glow */}
          <div className="absolute h-[520px] w-[520px] rounded-full bg-green-200/40 blur-3xl" />

          {/* Image */}
          <img
            src={heroImage}
            alt="Turfly Hero"
            className="relative z-10 h-[560px] w-full rounded-3xl object-cover shadow-2xl"
          />

          {/* Floating Rating */}
          <div className="absolute left-0 top-14 z-20 rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-3xl font-bold text-green-600">★ 4.9</p>

            <p className="mt-1 text-sm text-slate-500">Average Rating</p>
          </div>

          {/* Floating Turf Count */}
          <div className="absolute bottom-10 right-0 z-20 rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-3xl font-bold text-slate-900">500+</p>

            <p className="mt-1 text-sm text-slate-500">Premium Turfs</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default HeroSection;
