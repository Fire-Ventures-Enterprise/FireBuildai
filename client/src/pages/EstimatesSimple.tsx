import { useQuery, useMutation } from "@tanstack/react-query";
import { type Estimate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Plus, User, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function EstimatesSimple() {
  const { toast } = useToast();
  
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

  // Get client name for estimate
  const getClientName = (clientId: string) => {
    const client = (clients as any[]).find(c => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'sent': return 'secondary';
      case 'declined': return 'destructive';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading estimates...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {String(error)}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-gray-600 mt-1">Manage your project estimates and proposals</p>
        </div>
        <Link href="/estimates/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Estimate
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : estimates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No estimates yet</h3>
            <p className="text-gray-600 mb-6">Create your first estimate to get started with project proposals.</p>
            <Link href="/estimates/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Estimate
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {estimates.map((estimate) => (
            <Card key={estimate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold">#{estimate.documentNumber}</h3>
                      <Badge variant={getStatusBadgeVariant(estimate.status)}>
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{estimate.jobTitle}</h4>
                    <p className="text-gray-600 text-sm mb-4">{estimate.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{getClientName(estimate.clientId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Expires {new Date(estimate.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      ${Number(estimate.amount).toLocaleString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/estimates/${estimate.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteEstimateMutation.mutate(estimate.id)}
                        disabled={deleteEstimateMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}