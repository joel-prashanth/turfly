import { Link } from "react-router-dom";

export default function TurfCard({ turf }) {
  return (
    <Link to={`/turfs/${turf.id}`}>
      <div className="border rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer">
        <h2 className="text-xl font-bold">{turf.name}</h2>

        <p className="text-gray-600 mt-2">{turf.description}</p>

        <p className="mt-2">📍 {turf.location}</p>

        <p className="mt-2 font-semibold">₹{turf.pricePerHour}/hour</p>
      </div>
    </Link>
  );
}
