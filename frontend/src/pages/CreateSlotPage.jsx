import { useParams } from "react-router-dom";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";

import CreateSlotForm from "../components/sections/CreateSlotForm/CreateSlotForm";

function CreateSlotPage() {
  const { turfId } = useParams();

  return (
    <Container className="py-10">
      <PageHeader
        title="Create Slot"
        subtitle="Schedule an available time for players to book."
      />

      <div className="mt-8">
        <CreateSlotForm turfId={turfId} />
      </div>
    </Container>
  );
}

export default CreateSlotPage;
