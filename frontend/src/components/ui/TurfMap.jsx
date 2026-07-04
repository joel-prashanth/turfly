import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TurfMap.css";

// Custom green pin using a div icon
const greenPin = L.divIcon({
  className: "",
  html: `
    <div style="
      width:36px;height:36px;
      background:#16a34a;
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
});

const HYDERABAD = [17.385, 78.4867];

// Fit map to show all pins when multiple turfs exist
function FitBounds({ positions }) {
  const map = useMap();
  if (positions.length > 1) {
    map.fitBounds(positions, { padding: [60, 60], maxZoom: 13 });
  }
  return null;
}

export default function TurfMap({ turfs = [] }) {
  const mapped = turfs.filter((t) => t.lat && t.lng);
  const positions = mapped.map((t) => [t.lat, t.lng]);

  return (
    // isolate creates a stacking context so Leaflet's z-indexes
    // don't escape and overlap the sticky navbar (z-50)
    <div className="isolate">
      <MapContainer
        center={HYDERABAD}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: "480px" }}
      >
        {/* CARTO Voyager — clean, modern, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {mapped.length > 1 && <FitBounds positions={positions} />}

        {mapped.length === 0 ? (
          <Marker position={HYDERABAD} icon={greenPin}>
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 140 }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>Turfly — Hyderabad</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 0" }}>Venues coming soon near you</p>
              </div>
            </Popup>
          </Marker>
        ) : (
          mapped.map((t) => (
            <Marker key={t.id} position={[t.lat, t.lng]} icon={greenPin}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", minWidth: 160 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: "#111827" }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: "3px 0 0" }}>{t.location}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", margin: "4px 0 6px" }}>
                    ₹{t.pricePerHour}/hr
                  </p>
                  <a
                    href={`/turfs/${t.id}`}
                    style={{
                      display: "inline-block",
                      background: "#16a34a",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "5px 12px",
                      borderRadius: 8,
                      textDecoration: "none",
                    }}
                  >
                    View &amp; Book →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    </div>
  );
}
