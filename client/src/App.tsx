import { Switch, Route } from "wouter";
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
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

      {/* Navigation Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarOpen ? 'w-64' : 'w-0'}
        transition-all duration-300 ease-in-out
        fixed md:relative z-40 h-full
        flex flex-col bg-card border-r border-border
        md:translate-x-0 md:w-64
      `}>
        <Navigation />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden md:ml-0">
        {/* Desktop Menu Button */}
        <div className="hidden md:block p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="desktop-menu-toggle"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <main className="h-full overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
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
