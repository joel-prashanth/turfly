import { Link } from "react-router-dom";
import { MapPinned, CalendarDays, Plus, Layers3 } from "lucide-react";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/owner/StatCard";
import Button from "../components/ui/Button";

function OwnerDashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Container className="py-10">
      <PageHeader
        title={`Welcome back, ${user.name} 👋`}
        subtitle="Manage your sports venues from one place."
      />

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My Turfs"
          value="3"
          icon={<MapPinned className="text-green-700" />}
        />

        <StatCard
          title="Today's Slots"
          value="28"
          icon={<CalendarDays className="text-green-700" />}
        />

        <StatCard
          title="Bookings"
          value="14"
          icon={<Layers3 className="text-green-700" />}
        />

        <StatCard
          title="Revenue"
          value="₹0"
          icon={<MapPinned className="text-green-700" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <PageHeader
          title="Quick Actions"
          subtitle="Manage your business faster."
        />

        <div className="flex flex-wrap gap-4">
          <Link to="/owner/turfs/create">
            <Button>
              <Plus size={18} className="mr-2" />
              Create Turf
            </Button>
          </Link>

          <Link to="/owner/turfs">
            <Button variant="secondary">My Turfs</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default OwnerDashboardPage;
