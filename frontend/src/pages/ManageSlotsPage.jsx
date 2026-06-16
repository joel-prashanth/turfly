import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import SlotForm from "../components/sections/SlotForm/SlotForm";
import SlotList from "../components/slots/SlotList";

import { getSlotsByTurfId } from "../api/slotApi";

function ManageSlotsPage() {
  const navigate = useNavigate();
  const { turfId } = useParams();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
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

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/owner/turfs")}>
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={18} className="mr-2" />
          Add Slot
        </Button>
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
        <p className="text-sm text-slate-500">
          {slots.length} {slots.length === 1 ? "slot" : "slots"}
        </p>

        {turf && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {turf.sport}
          </span>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <SlotList
            slots={slots}
            refreshSlots={fetchSlots}
            onEdit={(slot) => {
              setSelectedSlot(slot);
              setShowEditModal(true);
            }}
          />
        )}
      </div>

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
