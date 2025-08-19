import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Tracking from "@/pages/Tracking";
import Contractors from "@/pages/Contractors";
import Expenses from "@/pages/Expenses";
import Analytics from "@/pages/Analytics";
import Clients from "@/pages/Clients";
import Fleet from "@/pages/Fleet";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function AppContent() {
  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <div className="flex flex-col w-64 bg-card border-r border-border">
        <Navigation />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/documents" component={Documents} />
            <Route path="/tracking" component={Tracking} />
            <Route path="/contractors" component={Contractors} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/clients" component={Clients} />
            <Route path="/fleet" component={Fleet} />
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
