/**
 * One-off script: geocode all turfs that have null lat/lng.
 * Run: node backend/scripts/geocode-turfs.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const https = require("https");
const prisma = require("../src/config/prisma");

const nominatim = (q) =>
  new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const req = https.get(
      url,
      { headers: { "User-Agent": "Turfly/1.0 (joel.prashanth0528@gmail.com)" } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const r = JSON.parse(data);
            resolve(r.length ? { lat: parseFloat(r[0].lat), lng: parseFloat(r[0].lon) } : null);
          } catch { resolve(null); }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
  });

// Strip Plus codes (e.g. "P877+8M3"), pin codes, and progressively shorten
// until Nominatim finds a match.
const geocode = async (locationText) => {
  // Remove Plus codes and 6-digit pin codes
  let cleaned = locationText
    .replace(/[A-Z0-9]{4}\+[A-Z0-9]{2,},?\s*/g, "")
    .replace(/\b\d{6}\b,?\s*/g, "")
    .trim();

  // Build progressively shorter candidates by dropping leading comma-parts
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  const candidates = [];
  for (let i = 0; i < parts.length; i++) {
    candidates.push(parts.slice(i).join(", ") + ", India");
  }

  for (const q of candidates) {
    console.log(`  trying: "${q}"`);
    const result = await nominatim(q);
    if (result) return result;
    await sleep(1100);
  }
  return null;
};

// Nominatim allows max 1 req/sec
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const turfs = await prisma.turf.findMany({
    where: { OR: [{ lat: null }, { lng: null }] },
    select: { id: true, name: true, location: true },
  });

  console.log(`Found ${turfs.length} turf(s) without coordinates.`);

  for (const turf of turfs) {
    console.log(`\nGeocoding "${turf.name}" — ${turf.location}`);
    const coords = await geocode(turf.location);

    if (coords) {
      await prisma.turf.update({
        where: { id: turf.id },
        data: { lat: coords.lat, lng: coords.lng },
      });
      console.log(`  ✓ lat=${coords.lat}, lng=${coords.lng}`);
    } else {
      console.log(`  ✗ No result — check the location text`);
    }

    await sleep(1100); // respect Nominatim rate limit
  }

  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
