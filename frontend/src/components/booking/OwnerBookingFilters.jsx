import Input from "../ui/Input";
import Select from "../ui/Select";

function OwnerBookingFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end">
      <div className="flex-1">
        <Input
          label="Search"
          placeholder="Search by player, phone or turf..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="w-full md:w-56">
        <Select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Bookings</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>
    </div>
  );
}

export default OwnerBookingFilters;
