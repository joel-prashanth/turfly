import { Link } from "react-router-dom";
import { Trophy, Mail, Phone, MapPin } from "lucide-react";

import Container from "../ui/Container";

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white">
                <Trophy size={24} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Turfly</h3>

                <p className="text-sm text-slate-400">Play More.</p>
              </div>
            </Link>

            <p className="mt-6 leading-7 text-slate-400">
              Discover and book premium sports venues across India. Fast,
              reliable and built for players.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-5 text-lg font-semibold text-white">Explore</h4>

            <ul className="space-y-3">
              <li>
                <Link to="/turfs" className="transition hover:text-green-400">
                  Browse Turfs
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="transition hover:text-green-400"
                >
                  Become an Owner
                </Link>
              </li>

              <li>
                <Link to="/login" className="transition hover:text-green-400">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-5 text-lg font-semibold text-white">Company</h4>

            <ul className="space-y-3">
              <li>
                <a href="#" className="transition hover:text-green-400">
                  About
                </a>
              </li>

              <li>
                <a href="#" className="transition hover:text-green-400">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="#" className="transition hover:text-green-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-lg font-semibold text-white">Contact</h4>

            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-green-400" />
                hello@turfly.in
              </li>

              <li className="flex items-center gap-3">
                <Phone size={18} className="text-green-400" />
                +91 98765 43210
              </li>

              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-green-400" />
                Hyderabad, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Turfly. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
