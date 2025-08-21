import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Estimate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Eye, Mail, MailOpen, Download, Filter } from "lucide-react";
import { Link } from "wouter";

export default function EstimatesSimple() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  
  const { data: estimates = [], isLoading, error } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const deleteEstimateMutation = useMutation({
    mutationFn: (estimateId: string) => {
      return apiRequest("DELETE", `/api/estimates/${estimateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: "Estimate deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get client name and details
  const getClient = (clientId: string) => {
    return (clients as any[]).find(c => c.id === clientId);
  };

  // Filter estimates by status and search
  const filterEstimatesByStatus = (status: string) => {
    let filtered = estimates;
    
    // Filter by status
    if (status === "pending") {
      filtered = estimates.filter(est => est.status === "draft" || est.status === "sent");
    } else if (status === "approved") {
      filtered = estimates.filter(est => est.status === "approved");
    } else if (status === "declined") {
      filtered = estimates.filter(est => est.status === "declined" || est.status === "expired");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(est => {
        const client = getClient(est.clientId);
        return (
          est.documentNumber.toLowerCase().includes(query) ||
          est.jobTitle.toLowerCase().includes(query) ||
          client?.name.toLowerCase().includes(query) ||
          client?.address?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  };

  // Group estimates by month
  const groupEstimatesByMonth = (estimatesList: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    estimatesList.forEach(estimate => {
      const date = new Date(estimate.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push({ ...estimate, monthLabel });
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // Most recent first
      .map(key => ({
        month: groups[key][0].monthLabel,
        estimates: groups[key],
        total: groups[key].reduce((sum, est) => sum + Number(est.amount), 0)
      }));
  };

  const getCurrentEstimates = () => filterEstimatesByStatus(activeTab);
  const monthlyGroups = groupEstimatesByMonth(getCurrentEstimates());

  const getStatusCounts = () => {
    const pending = estimates.filter(est => est.status === "draft" || est.status === "sent").length;
    const approved = estimates.filter(est => est.status === "approved").length;
    const declined = estimates.filter(est => est.status === "declined" || est.status === "expired").length;
    return { pending, approved, declined };
  };

  const counts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {String(error)}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </div>
            
            <Link href="/estimates/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Estimate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search all estimates by Name, Address, Estimate # or PO #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="pending" className="relative">
              PENDING
              {counts.pending > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="relative">
              APPROVED
              {counts.approved > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.approved}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="declined" className="relative">
              DECLINED
              {counts.declined > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.declined}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {monthlyGroups.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No estimates found" : `No ${activeTab} estimates`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery 
                      ? "Try adjusting your search terms" 
                      : `Create your first estimate to get started`
                    }
                  </p>
                  {!searchQuery && (
                    <Link href="/estimates/new">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Estimate
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              monthlyGroups.map((group, groupIndex) => (
                <div key={group.month} className="space-y-4">
                  {/* Month Header */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">{group.month}</h2>
                    <div className="text-lg font-semibold text-gray-900">
                      Total: ${group.total.toLocaleString()}
                    </div>
                  </div>

                  {/* Estimates for this month */}
                  <div className="space-y-2">
                    {group.estimates.map((estimate) => {
                      const client = getClient(estimate.clientId);
                      return (
                        <Card key={estimate.id} className="bg-white hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              {/* Left side - Estimate info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {client?.name || "Unknown Client"} - #{estimate.documentNumber}
                                  </h3>
                                  
                                  {estimate.status === "sent" && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                      ISSUED
                                    </Badge>
                                  )}
                                  
                                  {estimate.status === "draft" && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                      DRAFT
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-1">
                                  {new Date(estimate.createdAt).toLocaleDateString()}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{estimate.jobTitle}</span>
                                  {client?.address && <span>{client.address}</span>}
                                  <span>{client?.phone}</span>
                                </div>
                                
                                {/* Email status indicators */}
                                <div className="flex items-center gap-4 mt-2">
                                  {estimate.sentAt ? (
                                    <div className="flex items-center gap-1 text-sm text-blue-600">
                                      <MailOpen className="h-4 w-4" />
                                      <span>Email opened</span>
                                    </div>
                                  ) : estimate.status === "sent" ? (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Mail className="h-4 w-4" />
                                      <span>Email sent</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              {/* Right side - Amount and actions */}
                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900 mb-3">
                                  ${Number(estimate.amount).toLocaleString()}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Link href={`/estimates/${estimate.id}`}>
                                    <Button variant="outline" size="sm">
                                      Open
                                    </Button>
                                  </Link>
                                  
                                  <Link href={`/estimates/${estimate.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}