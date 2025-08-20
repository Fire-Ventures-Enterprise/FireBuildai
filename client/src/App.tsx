import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import { Menu, X } from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import Demo from "@/pages/Demo";
import Invoices from "@/pages/Invoices";
import Estimates from "@/pages/Estimates";
import Documents from "@/pages/Documents";
import Tracking from "@/pages/Tracking";
import Contractors from "@/pages/Contractors";
import Expenses from "@/pages/Expenses";
import Analytics from "@/pages/Analytics";
import Clients from "@/pages/Clients";
import Fleet from "@/pages/Fleet";
import Messages from "@/pages/Messages";
import Jobs from "@/pages/Jobs";
import PurchaseOrders from "@/pages/PurchaseOrders";
import CreatePurchaseOrder from "@/pages/CreatePurchaseOrder";
import Quotes from "@/pages/Quotes";
import SettingsPage from "@/pages/Settings";
import Verification from "@/pages/Verification";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import NotFound from "@/pages/not-found";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-toggle"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Sidebar - Only show when opened */}
      {sidebarOpen && (
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64
          transform transition-transform duration-300 ease-in-out
          bg-card border-r border-border
          flex flex-col
        `}>
          <Navigation />
        </div>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header with Menu Button */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="menu-toggle"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/attached_assets/1_1755652872023.jpg" 
              alt="FireBuild.ai" 
              className="h-8 w-auto dark:hidden"
              data-testid="header-logo-light"
            />
            <img 
              src="/attached_assets/3_1755652955031.jpg" 
              alt="FireBuild.ai" 
              className="h-8 w-auto hidden dark:block"
              data-testid="header-logo-dark"
            />
          </div>
        </div>

        <main className="h-full overflow-y-auto">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/jobs" component={Jobs} />
            <Route path="/purchase-orders" component={PurchaseOrders} />
            <Route path="/purchase-orders/create" component={CreatePurchaseOrder} />
            <Route path="/quotes" component={Quotes} />
            <Route path="/invoices" component={Invoices} />
            <Route path="/estimates" component={Estimates} />
            <Route path="/documents" component={Documents} />
            <Route path="/tracking" component={Tracking} />
            <Route path="/contractors" component={Contractors} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/clients" component={Clients} />
            <Route path="/fleet" component={Fleet} />
            <Route path="/messages" component={Messages} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Switch>
      {/* Landing page as default */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      <Route path="/demo" component={Demo} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/verification" component={Verification} />
      <Route path="/verify" component={Verification} />
      
      {/* Payment routes - Full page without sidebar */}
      <Route path="/checkout/:invoiceId" component={Checkout} />
      <Route path="/payment/success" component={PaymentSuccess} />
      
      {/* Main Application - With sidebar */}
      <Route path="/dashboard" component={AppLayout} />
      <Route path="/jobs" component={AppLayout} />
      <Route path="/purchase-orders" component={AppLayout} />
      <Route path="/quotes" component={AppLayout} />
      <Route path="/invoices" component={AppLayout} />
      <Route path="/estimates" component={AppLayout} />
      <Route path="/documents" component={AppLayout} />
      <Route path="/tracking" component={AppLayout} />
      <Route path="/contractors" component={AppLayout} />
      <Route path="/expenses" component={AppLayout} />
      <Route path="/analytics" component={AppLayout} />
      <Route path="/clients" component={AppLayout} />
      <Route path="/fleet" component={AppLayout} />
      <Route path="/messages" component={AppLayout} />
      <Route path="/settings" component={AppLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="firebuild-ui-theme">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
