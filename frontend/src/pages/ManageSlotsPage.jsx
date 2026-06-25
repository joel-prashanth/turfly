import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Sparkles, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import SlotForm from "../components/sections/SlotForm/SlotForm";
import SlotList from "../components/slots/SlotList";
import BulkGenerateModal from "../components/slots/BulkGenerateModal";
import WalkInModal from "../components/slots/WalkInModal";

import { getSlotsByTurfId } from "../api/slotApi";

const TABS = ["Upcoming", "Past"];

const formatGroupDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function groupByDate(slots) {
  const groups = {};
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!groups[key]) groups[key] = { label: formatGroupDate(slot.startTime), slots: [] };
    groups[key].slots.push(slot);
  }
  return Object.values(groups);
}

function ManageSlotsPage() {
  const navigate = useNavigate();
  const { turfId } = useParams();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [walkInSlot, setWalkInSlot] = useState(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await getSlotsByTurfId(turfId);
      setTurf(data.turf);
      setSlots(data.slots);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [turfId]);

  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const up = slots
      .filter((s) => new Date(s.endTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const pa = slots.filter((s) => new Date(s.endTime) <= now).reverse();
    return { upcoming: up, past: pa };
  }, [slots]);

  const visibleSlots = activeTab === "Upcoming" ? upcoming : past;
  const groups = groupByDate(visibleSlots);

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/owner/turfs")}>
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
            <Sparkles size={16} className="mr-1.5" />
            Generate
          </Button>
          <Button variant="secondary" onClick={() => setWalkInSlot("new")}>
            <UserPlus size={16} className="mr-1.5" />
            Walk-in
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-1.5" />
            Add Slot
          </Button>
        </div>
      </div>

      <PageHeader
        title={turf?.name || "Manage Slots"}
        subtitle={
          turf
            ? `${turf.location} • ₹${turf.pricePerHour}/hour`
            : "Manage all slots for this turf."
        }
      />

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {TABS.map((tab) => {
            const count = tab === "Upcoming" ? upcoming.length : past.length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    activeTab === tab
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {turf && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {turf.sport?.replaceAll("_", " ")}
          </span>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            title={activeTab === "Upcoming" ? "No upcoming slots" : "No past slots"}
            description={
              activeTab === "Upcoming"
                ? "Add a slot to start accepting bookings."
                : "Past slots will appear here."
            }
          />
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </h3>
                <SlotList
                  slots={group.slots}
                  pricePerHour={turf?.pricePerHour}
                  refreshSlots={fetchSlots}
                  onEdit={(slot) => {
                    setSelectedSlot(slot);
                    setShowEditModal(true);
                  }}
                  onWalkIn={(slot) => setWalkInSlot(slot)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <WalkInModal
        open={!!walkInSlot}
        turfId={turfId}
        pricePerHour={turf?.pricePerHour}
        prefillSlot={walkInSlot !== "new" ? walkInSlot : null}
        onClose={() => setWalkInSlot(null)}
        onSuccess={fetchSlots}
      />

      <BulkGenerateModal
        open={showBulkModal}
        turfId={turfId}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchSlots}
      />

      <Modal
        open={showCreateModal}
        title="Create Slot"
        onClose={() => setShowCreateModal(false)}
      >
        <SlotForm
          turfId={turfId}
          embedded
          onSuccess={async () => {
            await fetchSlots();
            setShowCreateModal(false);
          }}
        />
      </Modal>
      <Modal
        open={showEditModal}
        title="Edit Slot"
        onClose={() => {
          setShowEditModal(false);
          setSelectedSlot(null);
        }}
      >
        {selectedSlot && (
          <SlotForm
            turfId={turfId}
            mode="edit"
            initialValues={selectedSlot}
            embedded
            onSuccess={async () => {
              await fetchSlots();
              setShowEditModal(false);
              setSelectedSlot(null);
            }}
          />
        )}
      </Modal>
    </Container>
  );
}

export default ManageSlotsPage;
