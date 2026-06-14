import { useAuth } from "../hooks/useAuth";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import DashboardStats from "../components/owner/DashboardStats";
import QuickActions from "../components/owner/QuickActions";

function OwnerDashboardPage() {
  const { user } = useAuth();

  return (
    <Container className="py-10">
      <PageHeader
        title={`Welcome back, ${user?.name} 👋`}
        subtitle="Manage your sports venues from one place."
      />

      <DashboardStats />

      <QuickActions />
    </Container>
  );
}

export default OwnerDashboardPage;
