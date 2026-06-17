import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";

import DashboardStats from "../components/owner/DashboardStats";
import QuickActions from "../components/owner/QuickActions";
import RecentBookings from "../components/owner/RecentBookings";
import RevenueChart from "../components/owner/analytics/RevenueChart";

function OwnerDashboardPage() {
  return (
    <Container className="py-8">
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your business performance."
      />

      <DashboardStats />

      <QuickActions />

      <RevenueChart />

      <RecentBookings />
    </Container>
  );
}

export default OwnerDashboardPage;
