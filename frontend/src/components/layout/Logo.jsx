import { Link } from "react-router-dom";

function Logo({ light = false }) {
  const stemColor = light ? "#0D1A0D" : "white";
  const textColor = light ? "#0D1A0D" : "white";

  return (
    <Link to="/" className="transition-opacity hover:opacity-80" aria-label="Turfly">

      {/* Mobile: T mark only */}
      <svg
        className="block md:hidden"
        height="28" viewBox="0 0 34 33"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="0"  y="0"  width="34" height="9"  fill="#22C55E" rx="0.5"/>
        <rect x="12" y="9"  width="10" height="24" fill={stemColor} rx="0.5"/>
      </svg>

      {/* Desktop: full integrated wordmark [T]URFLY */}
      <svg
        className="hidden md:block"
        height="28" viewBox="0 0 240 44"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="0"  y="3"  width="34" height="9"  fill="#22C55E" rx="0.5"/>
        <rect x="12" y="12" width="10" height="32" fill={stemColor} rx="0.5"/>
        <text
          x="35" y="41"
          fontFamily="'Barlow Condensed', Impact, system-ui"
          fontWeight="800"
          fontSize="44"
          fill={textColor}
          letterSpacing="0.5"
        >
          URFLY
        </text>
      </svg>

    </Link>
  );
}

export default Logo;
