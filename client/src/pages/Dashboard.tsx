import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Star, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Truck,
  Receipt,
  Plus,
  Eye,
  Edit,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Metrics {
  activeJobs: number;
  revenue: number;
  contractorsOnline: number;
  reviewScore: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["/api/jobs/active"],
  });

  const { data: recentPayments } = useQuery({
    queryKey: ["/api/payments/recent"],
  });

  const { data: recentExpenses } = useQuery({
    queryKey: ["/api/expenses/recent"],
  });

  const { data: contractors } = useQuery({
    queryKey: ["/api/contractors/active"],
  });

  const metricCards = [
    {
      title: "Active Jobs",
      value: metrics?.activeJobs || 0,
      change: "+3 new this week",
      icon: Briefcase,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-950",
      route: "/jobs",
      testId: "metric-active-jobs"
    },
    {
      title: "Revenue (MTD)",
      value: `$${(metrics?.revenue || 0).toLocaleString()}`,
      change: "+18% vs last month",
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50 dark:bg-green-950",
      route: "/analytics",
      testId: "metric-revenue"
    },
    {
      title: "Contractors Online",
      value: metrics?.contractorsOnline || 0,
      change: "Live GPS tracking",
      icon: MapPin,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50 dark:bg-orange-950",
      route: "/tracking",
      testId: "metric-contractors-online"
    },
    {
      title: "Review Score",
      value: metrics?.reviewScore || "4.9",
      change: "★★★★★ 127 reviews",
      icon: Star,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgLight: "bg-yellow-50 dark:bg-yellow-950",
      route: "/analytics",
      testId: "metric-review-score"
    },
  ];

  const quickActions = [
    { title: "Create Job", icon: Plus, route: "/jobs", description: "Start a new project" },
    { title: "New Purchase Order", icon: FileText, route: "/purchase-orders/create", description: "Create PO for contractors" },
    { title: "Track Contractors", icon: MapPin, route: "/tracking", description: "View live GPS locations" },
    { title: "Manage Expenses", icon: Receipt, route: "/expenses", description: "Upload and categorize" },
    { title: "Client Messages", icon: MessageSquare, route: "/messages", description: "Respond to clients" },
    { title: "Fleet Management", icon: Truck, route: "/fleet", description: "Monitor vehicles" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your contractor management platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLocation("/jobs")} data-testid="button-new-job">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
          <Button onClick={() => setLocation("/purchase-orders/create")} variant="outline" data-testid="button-new-po">
            <FileText className="h-4 w-4 mr-2" />
            New PO
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => setLocation(metric.route)}
              data-testid={metric.testId}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold" data-testid={`${metric.testId}-value`}>
                      {metric.value}
                    </p>
                    <p className={`text-sm ${metric.textColor}`}>{metric.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${metric.bgLight} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${metric.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setLocation(action.route)}
                  data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment Received</p>
                  <p className="text-xs text-muted-foreground">Invoice INV-2024-0847 - $2,450</p>
                </div>
                <Badge variant="secondary" className="text-xs">2 min ago</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Auto Review Request Sent</p>
                  <p className="text-xs text-muted-foreground">SMS sent to client with Google & Facebook review links</p>
                </div>
                <Badge variant="secondary" className="text-xs">5 min ago</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">GPS Update</p>
                  <p className="text-xs text-muted-foreground">Mike Johnson checked in at job site</p>
                </div>
                <Badge variant="secondary" className="text-xs">12 min ago</Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/analytics")}>
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
            <CardDescription>Contractor productivity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">MJ</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mike Johnson</p>
                    <p className="text-xs text-muted-foreground">$18.5k this month</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Top Performer
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">SD</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah Davis</p>
                    <p className="text-xs text-muted-foreground">$15.2k this month</p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">RC</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Robert Chen</p>
                    <p className="text-xs text-muted-foreground">$12.8k this month</p>
                  </div>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/contractors")}>
              Manage Contractors
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews Generated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Reviews Generated
            </CardTitle>
            <CardDescription>Latest customer feedback collected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex text-yellow-500">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Google Review</p>
                  <p className="text-xs text-muted-foreground">"Excellent work on our kitchen renovation. Very professional team."</p>
                </div>
                <Badge variant="secondary" className="text-xs">Today</Badge>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex text-yellow-500">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Facebook Review</p>
                  <p className="text-xs text-muted-foreground">"Fast service and great communication throughout the project."</p>
                </div>
                <Badge variant="secondary" className="text-xs">Yesterday</Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/analytics")}>
              View All Reviews
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fleet Status
            </CardTitle>
            <CardDescription>Vehicle tracking and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-xs text-muted-foreground">Maintenance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fleet Utilization</span>
                <span>80%</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            
            <Button variant="outline" size="sm" className="w-full" onClick={() => setLocation("/fleet")}>
              Manage Fleet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
