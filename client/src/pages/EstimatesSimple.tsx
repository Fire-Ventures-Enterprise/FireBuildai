import { useQuery, useMutation } from "@tanstack/react-query";
import { type Estimate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EstimatesSimple() {
  const { toast } = useToast();
  const { data: estimates = [], isLoading, error } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createEstimateMutation = useMutation({
    mutationFn: () => {
      const client = (clients as any[])[0]; // Use first client for demo
      const estimateData = {
        clientId: client?.id || "demo-client",
        jobTitle: "Kitchen Renovation",
        description: "Complete kitchen renovation project",
        amount: 25000,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'draft',
        documentNumber: `EST-${Date.now()}`,
      };
      return apiRequest("POST", "/api/estimates", estimateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: "Demo estimate created successfully",
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

  console.log("Estimates component rendering", { estimates, isLoading, error, clients });

  if (isLoading) {
    return <div className="p-8">Loading estimates...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {String(error)}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Estimates</h1>
        <Button 
          onClick={() => createEstimateMutation.mutate()}
          disabled={createEstimateMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createEstimateMutation.isPending ? "Creating..." : "Create Demo Estimate"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total estimates: {estimates.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No estimates found. Create your first estimate to get started.</p>
              <Button 
                onClick={() => createEstimateMutation.mutate()}
                disabled={createEstimateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createEstimateMutation.isPending ? "Creating..." : "Create Demo Estimate"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <Card key={estimate.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">#{estimate.documentNumber}</h3>
                        <p className="text-gray-600">{estimate.jobTitle}</p>
                        <p className="text-sm text-gray-500">{estimate.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${Number(estimate.amount).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Status: {estimate.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}