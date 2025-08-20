import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Smartphone,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Demo page imports

export default function Demo() {
  const [, setLocation] = useLocation();
  const [currentDemo, setCurrentDemo] = useState("dashboard");
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSections = [
    {
      id: "dashboard",
      title: "Dashboard Overview",
      description: "See how the main dashboard provides real-time insights",
      icon: Monitor,
      route: "/"
    },
    {
      id: "tracking",
      title: "GPS Tracking",
      description: "Live contractor location monitoring",
      icon: MapPin,
      route: "/tracking"
    },
    {
      id: "purchase-orders",
      title: "Purchase Orders",
      description: "Create and manage contractor POs",
      icon: FileText,
      route: "/purchase-orders"
    },
    {
      id: "contractors",
      title: "Contractor Management",
      description: "Manage your team and assignments",
      icon: Users,
      route: "/contractors"
    },
    {
      id: "analytics",
      title: "Business Analytics",
      description: "Performance metrics and insights",
      icon: DollarSign,
      route: "/analytics"
    }
  ];

  const handleStartDemo = (route: string) => {
    setLocation(route);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="gap-2"
            data-testid="back-to-landing"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Landing
          </Button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/images/logo-light.jpg"
              alt="FireBuild.ai" 
              className="h-8 w-auto dark:hidden"
              data-testid="demo-logo-light"
            />
            <img 
              src="/images/logo-dark.jpg"
              alt="FireBuild.ai" 
              className="h-8 w-auto hidden dark:block"
              data-testid="demo-logo-dark"
            />
            <span className="text-xl font-bold text-foreground">Demo</span>
          </div>
          
          <Button onClick={() => setLocation("/")} data-testid="try-full-app">
            Try Full App
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Interactive Demo
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Experience FireBuild.ai
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore the full functionality of our contractor management platform. 
            Click through each section to see how FireBuild.ai can transform your business.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={togglePlayback}
            className="gap-2"
            data-testid="demo-play-pause"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause Tour" : "Start Guided Tour"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setCurrentDemo("dashboard")}
            className="gap-2"
            data-testid="demo-reset"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo
          </Button>
        </div>

        {/* Demo Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {demoSections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = currentDemo === section.id;
            
            return (
              <Card 
                key={section.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isActive ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
                onClick={() => setCurrentDemo(section.id)}
                data-testid={`demo-section-${section.id}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {section.description}
                  </CardDescription>
                  <Button 
                    size="sm" 
                    variant={isActive ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartDemo(section.route);
                    }}
                    className="w-full"
                    data-testid={`demo-try-${section.id}`}
                  >
                    {isActive ? "Try This Feature" : "View Demo"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Showcase */}
        <Tabs value={currentDemo} onValueChange={setCurrentDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {demoSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="gap-2"
                  data-testid={`tab-${section.id}`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.title.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Dashboard Overview
                </CardTitle>
                <CardDescription>
                  Your central command center for managing all business operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Real-time Metrics</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor active jobs, revenue, contractor status, and customer reviews in real-time
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Quick Actions</h4>
                    <p className="text-sm text-muted-foreground">
                      Create jobs, generate purchase orders, and manage contractors with one-click access
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Activity Feed</h4>
                    <p className="text-sm text-muted-foreground">
                      Stay updated with payments, GPS check-ins, and automated review requests
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Team Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Track contractor productivity and earnings with detailed performance metrics
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartDemo("/")}
                  className="w-full"
                  data-testid="try-dashboard"
                >
                  Try Dashboard Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  GPS Tracking System
                </CardTitle>
                <CardDescription>
                  Monitor contractor locations in real-time with advanced GPS tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Live Location Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      See where your contractors are in real-time with automatic location updates
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Job Site Check-ins</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated notifications when contractors arrive at and leave job sites
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Route Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Help contractors find the most efficient routes between job sites
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Time Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Accurate time tracking for payroll and project management
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartDemo("/tracking")}
                  className="w-full"
                  data-testid="try-tracking"
                >
                  Try GPS Tracking
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase-orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purchase Order Management
                </CardTitle>
                <CardDescription>
                  Create and manage purchase orders for contractors and suppliers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Quick PO Creation</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate professional purchase orders with automatic calculations and branding
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Quote Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Import items and pricing directly from uploaded contractor quotes
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Status Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor PO status from draft to completion with automated notifications
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Custom Branding</h4>
                    <p className="text-sm text-muted-foreground">
                      All documents include your company logo, contact info, and branding
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartDemo("/purchase-orders")}
                  className="w-full"
                  data-testid="try-purchase-orders"
                >
                  Try Purchase Orders
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contractors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contractor Management
                </CardTitle>
                <CardDescription>
                  Manage your contractor team with comprehensive profiles and assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Contractor Profiles</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed profiles with skills, certifications, and performance history
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Job Assignments</h4>
                    <p className="text-sm text-muted-foreground">
                      Assign contractors to jobs based on skills, location, and availability
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Performance Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor productivity, earnings, and job completion rates
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Communication Hub</h4>
                    <p className="text-sm text-muted-foreground">
                      Direct messaging and notification system for team coordination
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartDemo("/contractors")}
                  className="w-full"
                  data-testid="try-contractors"
                >
                  Try Contractor Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Business Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive insights and reporting for data-driven decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Revenue Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Track revenue trends, profit margins, and financial performance over time
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Project Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyze project completion rates, delays, and cost overruns
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Customer Satisfaction</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor review scores, response rates, and client feedback trends
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Custom Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate detailed reports for stakeholders and business planning
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartDemo("/analytics")}
                  className="w-full"
                  data-testid="try-analytics"
                >
                  Try Business Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-6">
            Experience the full power of FireBuild.ai with your own data and team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation("/")}
              data-testid="demo-cta-start"
            >
              Start Using FireBuild.ai
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="demo-cta-contact"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}