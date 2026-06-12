import { Search, MapPin } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-10 py-20 text-white shadow-xl">
      {/* Background Glow */}

      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-black/10 blur-3xl" />

      <div className="relative max-w-3xl">
        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
          ⚽ India's Smartest Turf Booking Platform
        </span>

        <h1 className="mt-6 text-6xl font-black leading-tight tracking-tight">
          Never Miss
          <br />
          Match Day.
        </h1>

        <p className="mt-6 text-xl text-green-50 leading-8">
          Discover premium football, cricket and badminton venues. Book
          instantly and spend less time planning, more time playing.
        </p>

        <div className="mt-10 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by city or turf..."
              className="bg-white"
            />
          </div>

          <Button size="lg">
            <Search size={20} />

            <span className="ml-2">Search</span>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {["Cricket", "Football", "Badminton", "Box Cricket"].map((sport) => (
            <div
              key={sport}
              className="rounded-full bg-white/15 px-5 py-3 backdrop-blur"
            >
              {sport}
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-8">
          <div>
            <h2 className="text-3xl font-bold">500+</h2>

            <p className="text-green-100">Venues</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">10K+</h2>

            <p className="text-green-100">Players</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">50K+</h2>

            <p className="text-green-100">Bookings</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
