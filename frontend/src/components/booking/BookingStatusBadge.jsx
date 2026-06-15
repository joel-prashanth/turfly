import Badge from "../ui/Badge";

const STATUS_MAP = {
  CONFIRMED: {
    label: "Upcoming",
    variant: "success",
  },

  COMPLETED: {
    label: "Completed",
    variant: "secondary",
  },

  CANCELLED: {
    label: "Cancelled",
    variant: "danger",
  },

  BLOCKED: {
    label: "Blocked",
    variant: "warning",
  },

  AVAILABLE: {
    label: "Available",
    variant: "success",
  },

  BOOKED: {
    label: "Booked",
    variant: "primary",
  },
};

function BookingStatusBadge({ status }) {
  const config = STATUS_MAP[status] || {
    label: status,
    variant: "secondary",
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default BookingStatusBadge;
