import { useParams } from "react-router-dom";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";

import SlotForm from "../components/sections/SlotForm/SlotForm";

function CreateSlotPage() {
  const { turfId } = useParams();

  return (
    <Container className="py-10">
      <PageHeader
        title="Create Slot"
        subtitle="Calendar an available time for players to book."
      />

      <div className="mt-8">
        <SlotForm turfId={turfId} />
      </div>
    </Container>
  );
}

export default CreateSlotPage;
