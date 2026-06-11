import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTurfs } from "../api/turfApi";

function MyTurfsPage() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const data = await getMyTurfs();

        setTurfs(data.turfs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Turfs</h1>

      {turfs.length === 0 ? (
        <p>No turfs created yet.</p>
      ) : (
        turfs.map((turf) => (
          <div key={turf.id} className="border rounded p-4 mb-4">
            <h2 className="text-xl font-semibold">{turf.name}</h2>

            <p>{turf.location}</p>

            <p>₹{turf.pricePerHour}/hour</p>

            <Link
              to={`/owner/turfs/${turf.id}/slots/create`}
              className="inline-block mt-3 border px-3 py-2 rounded"
            >
              Create Slot
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default MyTurfsPage;
