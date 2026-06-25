import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import SearchInput from "../components/ui/SearchInput";

import DeleteConfirmationModal from "../components/modals/DeleteConfirmationModal";
import TurfCardSkeleton from "../components/skeletons/TurfCardSkeleton";
import TurfCard from "../components/turf/TurfCard";

import { getMyTurfs, deleteTurf, setTurfListingStatus } from "../api/turfApi";

function MyTurfsPage() {
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [togglingId, setTogglingId] = useState(null);

  const handleToggleListing = async (turf) => {
    setTogglingId(turf.id);
    const next = !turf.isActive;
    setTurfs((prev) => prev.map((t) => t.id === turf.id ? { ...t, isActive: next } : t));
    try {
      await setTurfListingStatus(turf.id, next);
      toast.success(next ? `${turf.name} is now listed.` : `${turf.name} unlisted.`);
    } catch {
      setTurfs((prev) => prev.map((t) => t.id === turf.id ? { ...t, isActive: !next } : t));
      toast.error("Failed to update listing status.");
    } finally {
      setTogglingId(null);
    }
  };

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: null,
    upcomingBookedSlots: 0,
  });

  const fetchTurfs = async () => {
    try {
      const data = await getMyTurfs();
      setTurfs(data.turfs);
    } catch {
      toast.error("Failed to fetch your turfs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const filteredTurfs = turfs.filter((turf) =>
    turf.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id, name, upcomingBookedSlots) => {
    setDeleteModal({
      open: true,
      id,
      name,
      upcomingBookedSlots: upcomingBookedSlots ?? 0,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);

      await deleteTurf(deleteModal.id);

      setTurfs((prev) => prev.filter((turf) => turf.id !== deleteModal.id));

      toast.success("Turf deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete turf");
    } finally {
      setDeleteLoading(false);

      setDeleteModal({
        open: false,
        id: null,
        name: null,
        upcomingBookedSlots: 0,
      });
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <PageHeader
          title="My Turfs"
          subtitle="Manage all your sports venues."
        />

        <div className="grid gap-5 xl:grid-cols-2">
          <TurfCardSkeleton />
          <TurfCardSkeleton />
          <TurfCardSkeleton />
          <TurfCardSkeleton />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageHeader title="My Turfs" subtitle="Manage all your sports venues.">
        <Link to="/owner/turfs/create">
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            Create Turf
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-6 max-w-md">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your turfs..."
        />
      </div>

      {turfs.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="No turfs yet"
          description="Create your first turf and start accepting bookings."
          actionText="Create Turf"
          onAction={() => navigate("/owner/turfs/create")}
        />
      ) : filteredTurfs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching turfs"
          description="Try searching with a different name."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTurfs.map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              actions={
                <div className="flex flex-wrap items-center gap-2.5">

                  {/* Listing toggle */}
                  <button
                    onClick={() => handleToggleListing(turf)}
                    disabled={togglingId === turf.id}
                    className={[
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      turf.isActive
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
                      togglingId === turf.id ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {/* Toggle pill */}
                    <span className={[
                      "relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
                      turf.isActive ? "bg-green-500" : "bg-gray-300",
                    ].join(" ")}>
                      <span className={[
                        "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200",
                        turf.isActive ? "translate-x-3.5" : "translate-x-0.5",
                      ].join(" ")} />
                    </span>
                    {turf.isActive ? "Listed" : "Unlisted"}
                  </button>

                  <Link to={`/owner/turfs/${turf.id}/slots`}>
                    <Button size="sm">
                      <CalendarDays size={16} className="mr-2" />
                      Manage Slots
                    </Button>
                  </Link>

                  <Link to={`/owner/turfs/${turf.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil size={16} className="mr-2" />
                      Edit Turf
                    </Button>
                  </Link>

                  <button
                    title="Delete turf"
                    onClick={() => handleDelete(turf.id, turf.name, turf.upcomingBookedSlots)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        open={deleteModal.open}
        loading={deleteLoading}
        itemName={deleteModal.name || "turf"}
        warning={
          deleteModal.upcomingBookedSlots > 0
            ? `This turf has ${deleteModal.upcomingBookedSlots} upcoming booked slot${deleteModal.upcomingBookedSlots === 1 ? "" : "s"}. Those bookings will be cancelled when you delete.`
            : undefined
        }
        onClose={() =>
          setDeleteModal({
            open: false,
            id: null,
            name: null,
            upcomingBookedSlots: 0,
          })
        }
        onConfirm={confirmDelete}
      />
    </Container>
  );
}

export default MyTurfsPage;
