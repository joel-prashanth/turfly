import { Link } from "react-router-dom";

function OwnerDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>

      <div className="flex gap-4">
        <Link to="/owner/turfs/create" className="border px-4 py-2 rounded">
          Create Turf
        </Link>

        <Link to="/owner/turfs" className="border px-4 py-2 rounded">
          My Turfs
        </Link>
      </div>
    </div>
  );
}

export default OwnerDashboardPage;
