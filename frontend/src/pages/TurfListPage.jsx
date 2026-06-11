import { useEffect, useState } from "react";

import TurfCard from "../components/TurfCard";
import { getTurfs } from "../api/turfApi";

export default function TurfListPage() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const data = await getTurfs();

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
      <h1 className="text-3xl font-bold mb-6">Turfly</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {turfs.map((turf) => (
          <TurfCard key={turf.id} turf={turf} />
        ))}
      </div>
    </div>
  );
}
