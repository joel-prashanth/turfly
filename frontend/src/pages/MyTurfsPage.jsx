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

import { getMyTurfs, deleteTurf } from "../api/turfApi";

function MyTurfsPage() {
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: null,
  });

  const fetchTurfs = async () => {
    try {
      const data = await getMyTurfs();
      setTurfs(data.turfs);
    } catch (error) {
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

  const handleDelete = (id, name) => {
    setDeleteModal({
      open: true,
      id,
      name,
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
      });
    }
  };

  if (loading) {
    return (
      <Container className="py-10">
        <div className="mb-8">
          <PageHeader
            title="My Turfs"
            subtitle="Manage all your sports venues."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TurfCardSkeleton />
          <TurfCardSkeleton />
          <TurfCardSkeleton />
          <TurfCardSkeleton />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between">
        <PageHeader
          title="My Turfs"
          subtitle="Manage all your sports venues."
        />

        <Link to="/owner/turfs/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Turf
          </Button>
        </Link>
      </div>

      <div className="mb-8">
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
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredTurfs.map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              actions={
                <div className="flex flex-wrap gap-3">
                  <Link to={`/owner/turfs/${turf.id}/slots/create`}>
                    <Button>
                      <CalendarDays size={18} className="mr-2" />
                      Create Slot
                    </Button>
                  </Link>

                  <Link to={`/owner/turfs/${turf.id}/edit`}>
                    <Button variant="secondary">
                      <Pencil size={18} className="mr-2" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    onClick={() => handleDelete(turf.id, turf.name)}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete
                  </Button>
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
        onClose={() =>
          setDeleteModal({
            open: false,
            id: null,
            name: null,
          })
        }
        onConfirm={confirmDelete}
      />
    </Container>
  );
}

export default MyTurfsPage;
