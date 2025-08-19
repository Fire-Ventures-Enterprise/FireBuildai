import Header from "@/components/Header";
import MetricsDashboard from "@/components/MetricsDashboard";
import LiveTrackingSection from "@/components/LiveTrackingSection";
import ExpenseOCRSection from "@/components/ExpenseOCRSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import ClientPortalSection from "@/components/ClientPortalSection";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MetricsDashboard />
        <LiveTrackingSection />
        <ExpenseOCRSection />
        <AnalyticsSection />
        <ClientPortalSection />
        <EquipmentSection />
      </main>

      <Footer />
    </div>
  );
}
