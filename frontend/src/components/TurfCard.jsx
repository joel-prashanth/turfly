export default function TurfCard({ turf }) {
  return (
    <div className="border rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold">{turf.name}</h2>

      <p className="text-gray-600 mt-2">{turf.description}</p>

      <p className="mt-2">📍 {turf.location}</p>

      <p className="mt-2 font-semibold">₹{turf.pricePerHour}/hour</p>
    </div>
  );
}
