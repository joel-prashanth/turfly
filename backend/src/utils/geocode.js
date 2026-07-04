const https = require("https");

const lookup = (query) =>
  new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const req = https.get(
      url,
      { headers: { "User-Agent": "Turfly/1.0 (joel.prashanth0528@gmail.com)" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const results = JSON.parse(data);
            resolve(results.length > 0 ? { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) } : null);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });

const geocode = async (locationText) => {
  // Strip Plus codes and pin codes, then try progressively shorter address segments
  const cleaned = locationText
    .replace(/[A-Z0-9]{4}\+[A-Z0-9]{2,}/g, "")
    .replace(/\b\d{6}\b/g, "")
    .trim();

  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);

  for (let i = 0; i < parts.length; i++) {
    const attempt = parts.slice(i).join(", ") + ", India";
    const result = await lookup(attempt);
    if (result) return result;
  }

  return null;
};

module.exports = { geocode };
