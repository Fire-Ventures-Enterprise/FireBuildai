import { useState } from "react";
import { useLocation } from "wouter";
import logoLight from "@/assets/logo-light.jpg";
import logoDark from "@/assets/logo-dark.jpg";
import { 
  Play, 
  CheckCircle, 
  MapPin, 
  DollarSign, 
  Users, 
  FileText, 
  Star, 
  ArrowRight,
  Shield,
  Clock,
  Smartphone,
  BarChart3,
  MessageSquare,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const features = [
    {
      icon: MapPin,
      title: "Real-Time GPS Tracking",
      description: "Monitor your contractors' locations with live GPS tracking and automated check-ins."
    },
    {
      icon: FileText,
      title: "Purchase Order System",
      description: "Create and manage POs for contractors with integrated quote management."
    },
    {
      icon: DollarSign,
      title: "Automated Payments",
      description: "Process payments efficiently with integrated Stripe payment processing."
    },
    {
      icon: MessageSquare,
      title: "Client Communication",
      description: "Streamlined communication portal with automated review requests."
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Comprehensive dashboard with performance metrics and insights."
    },
    {
      icon: Truck,
      title: "Fleet Management",
      description: "Track vehicles, maintenance schedules, and optimize routes."
    }
  ];

  const benefits = [
    "Increase productivity by 40% with automated workflows",
    "Reduce administrative time by 60% with smart automation",
    "Improve client satisfaction with real-time updates",
    "Streamline contractor payments and documentation",
    "Monitor job progress with live tracking",
    "Generate more reviews with automated requests"
  ];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, redirect to dashboard
    setLocation("/dashboard");
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={logoLight}
              alt="FireBuild.ai" 
              className="h-12 w-auto dark:hidden"
              data-testid="landing-header-logo-light"
            />
            <img 
              src={logoDark}
              alt="FireBuild.ai" 
              className="h-12 w-auto hidden dark:block"
              data-testid="landing-header-logo-dark"
            />
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => setLocation("/demo")} data-testid="nav-demo">
              Demo
            </Button>
            <Button variant="ghost" data-testid="nav-features">
              Features
            </Button>
            <Button variant="ghost" data-testid="nav-pricing">
              Pricing
            </Button>
            <Button 
              onClick={() => {
                setAuthMode("login");
                setIsAuthOpen(true);
              }}
              data-testid="nav-login"
            >
              Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            The Future of Contractor Management
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Streamline Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Construction Business
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete contractor management platform with GPS tracking, automated payments, 
            client communication, and business analytics. Everything you need to run your 
            construction business efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => {
                setAuthMode("signup");
                setIsAuthOpen(true);
              }}
              data-testid="cta-get-started"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="text-lg px-8 py-3" data-testid="cta-watch-demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>FireBuild.ai Platform Demo</DialogTitle>
                </DialogHeader>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Demo video coming soon</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setLocation("/demo")}
                      data-testid="try-live-demo"
                    >
                      Try Live Demo Instead
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-3"
              onClick={() => setLocation("/demo")}
              data-testid="cta-live-demo"
            >
              Live Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>10,000+ Contractors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From GPS tracking to payment processing, FireBuild.ai provides all the tools 
              you need to streamline your construction operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Transform Your Construction Business
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of contractors who have streamlined their operations 
                and increased profitability with FireBuild.ai.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="mt-8"
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthOpen(true);
                }}
                data-testid="benefits-cta"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">$247K</div>
                      <div className="text-blue-100">Monthly Revenue</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-200" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">23</div>
                      <div className="text-blue-100">Active Contractors</div>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">4.9★</div>
                      <div className="text-blue-100">Client Rating</div>
                    </div>
                    <Star className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of contractors already using FireBuild.ai to streamline 
            their operations and grow their business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-3"
              onClick={() => {
                setAuthMode("signup");
                setIsAuthOpen(true);
              }}
              data-testid="final-cta-signup"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600"
              onClick={() => setLocation("/demo")}
              data-testid="final-cta-demo"
            >
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={logoDark} 
                  alt="FireBuild.ai" 
                  className="h-12 w-auto"
                  data-testid="footer-logo"
                />
              </div>
              <p className="text-gray-400">
                The complete contractor management platform for modern construction businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Demo</div>
                <div>API</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
                <div>Contact</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Documentation</div>
                <div>Status</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FireBuild.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === "login" ? "Welcome Back" : "Get Started"}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@company.com"
                    data-testid="input-login-email"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password"
                    data-testid="input-login-password"
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-login">
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <Input 
                      id="signup-firstname" 
                      placeholder="John"
                      data-testid="input-signup-firstname"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input 
                      id="signup-lastname" 
                      placeholder="Doe"
                      data-testid="input-signup-lastname"
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-company">Company Name</Label>
                  <Input 
                    id="signup-company" 
                    placeholder="Your Construction Company"
                    data-testid="input-signup-company"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@company.com"
                    data-testid="input-signup-email"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password"
                    data-testid="input-signup-password"
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-signup">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}