import { useParams } from "react-router-dom";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";

import TurfForm from "../components/sections/TurfForm/TurfForm";

function EditTurfPage() {
  const { turfId } = useParams();

  return (
    <Container className="py-10">
      <PageHeader title="Edit Turf" subtitle="Update your turf details." />

      <div className="mt-8">
        <TurfForm mode="edit" turfId={turfId} />
      </div>
    </Container>
  );
}

export default EditTurfPage;
