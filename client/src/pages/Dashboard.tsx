import MetricsDashboard from "@/components/MetricsDashboard";
import LiveTrackingSection from "@/components/LiveTrackingSection";
import ExpenseOCRSection from "@/components/ExpenseOCRSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import ClientPortalSection from "@/components/ClientPortalSection";
import EquipmentSection from "@/components/EquipmentSection";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your contractor management platform
        </p>
      </div>
      
      <div className="space-y-8">
        <MetricsDashboard />
        <LiveTrackingSection />
        <ExpenseOCRSection />
        <AnalyticsSection />
        <ClientPortalSection />
        <EquipmentSection />
      </div>
    </div>
  );
}
