import { CalendarPlus, ClipboardList, MapPinned, Plus } from "lucide-react";

import PageHeader from "../ui/PageHeader";
import QuickActionCard from "./QuickActionCard";

function QuickActions() {
  return (
    <section className="mt-14">
      <PageHeader
        title="Quick Actions"
        subtitle="Everything you need to manage your business."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          title="Create Turf"
          description="Add a new sports venue and start accepting bookings."
          icon={<Plus size={28} />}
          to="/owner/turfs/create"
        />

        <QuickActionCard
          title="Manage Turfs"
          description="View, edit, and manage all your existing venues."
          icon={<MapPinned size={28} />}
          to="/owner/turfs"
        />

        <QuickActionCard
          title="Add Slots"
          description="Schedule playing slots and manage availability."
          icon={<CalendarPlus size={28} />}
          to="/owner/schedule"
        />

        <QuickActionCard
          title="Bookings"
          description="View and manage customer reservations."
          icon={<ClipboardList size={28} />}
          to="/owner/bookings"
        />
      </div>
    </section>
  );
}

export default QuickActions;
