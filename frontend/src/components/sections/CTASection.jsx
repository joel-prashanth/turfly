import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Button from "../ui/Button";
import Section from "../ui/Section";

function CTASection() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 shadow-2xl md:px-16">
        {/* Background Glow */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-green-600/20 blur-3xl" />

        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-green-400">
            Ready To Play?
          </p>

          <h2 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Your Next Match Is Just One Click Away
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Discover premium sports venues, reserve your preferred time slot,
            and enjoy a seamless booking experience with Turfly.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-400" />
              Verified Venues
            </div>

            <div className="flex items-center gap-2">
              <CalendarCheck size={18} className="text-green-400" />
              Instant Booking
            </div>

            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-green-400" />
              Trusted Platform
            </div>

            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-green-400" />
              Premium Experience
            </div>
          </div>

          <div className="mt-12">
            <Link to="/turfs">
              <Button
                variant="white"
                size="lg"
                className="group rounded-2xl px-8"
              >
                Browse Turfs

                <ArrowRight
                  size={20}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default CTASection;