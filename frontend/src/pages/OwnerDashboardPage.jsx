import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import DashboardStats from "../components/owner/DashboardStats";
import Button from "../components/ui/Button";

function OwnerDashboardPage() {
  const { user } = useAuth();

  return (
    <Container className="py-10">
      <PageHeader
        title={`Welcome back, ${user?.name} 👋`}
        subtitle="Manage your sports venues from one place."
      />

      <DashboardStats />

      <div className="mt-12">
        <PageHeader
          title="Quick Actions"
          subtitle="Manage your business faster."
        />

        <div className="flex flex-wrap gap-4">
          <Link to="/owner/turfs/create">
            <Button>
              <Plus size={18} className="mr-2" />
              Create Turf
            </Button>
          </Link>

          <Link to="/owner/turfs">
            <Button variant="secondary">
              My Turfs
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default OwnerDashboardPage;