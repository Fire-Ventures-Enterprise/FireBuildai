import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Estimate } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Search, Plus, Eye, Edit, Send, FileDown, Filter, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const estimateSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expiresAt: z.string().min(1, "Expiration date is required"),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

// Using Estimate type from shared schema

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function Estimates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Check if we're on the new estimate route
  const isNewEstimatePage = location.includes('/estimates/new');
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const clientId = urlParams.get('clientId');

  // Auto-open create dialog if on new estimate page
  useEffect(() => {
    if (isNewEstimatePage) {
      setShowCreateDialog(true);
    }
  }, [isNewEstimatePage]);

  const { data: estimates = [], isLoading } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  const createEstimateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/estimates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: "Estimate created successfully",
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

  const updateEstimateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/estimates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: "Estimate updated successfully",
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

  const filteredEstimates = useMemo(() => {
    if (!estimates) return [];
    
    let filtered = estimates;
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((estimate: Estimate) => estimate.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((estimate: Estimate) =>
        estimate.documentNumber.toLowerCase().includes(term) ||
        estimate.clientName.toLowerCase().includes(term) ||
        estimate.jobTitle.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [estimates, statusFilter, searchTerm]);

  const handleSendEstimate = (estimateId: string) => {
    updateEstimateMutation.mutate({ id: estimateId, status: 'sent' });
  };

  const handleApproveEstimate = (estimateId: string) => {
    updateEstimateMutation.mutate({ id: estimateId, status: 'approved' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
            <p className="text-muted-foreground">
              Create and manage project estimates
            </p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open && isNewEstimatePage) {
            setLocation('/estimates');
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-estimate">
              <Plus className="h-4 w-4 mr-2" />
              Create Estimate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isNewEstimatePage && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation('/clients')}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Calculator className="h-5 w-5" />
                Create New Estimate
              </DialogTitle>
            </DialogHeader>
            
            <EstimateForm 
              clientId={clientId}
              onSuccess={() => {
                setShowCreateDialog(false);
                if (isNewEstimatePage) {
                  setLocation('/estimates');
                }
              }}
              onCancel={() => {
                setShowCreateDialog(false);
                if (isNewEstimatePage) {
                  setLocation('/clients');
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search estimates by number, client, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-estimates"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estimate Cards */}
      <div className="grid gap-4">
        {filteredEstimates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No estimates found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first estimate to get started"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEstimates.map((estimate: Estimate) => (
            <Card key={estimate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg" data-testid={`text-estimate-number-${estimate.id}`}>
                        {estimate.documentNumber}
                      </h3>
                      <Badge className={statusColors[estimate.status]} data-testid={`badge-status-${estimate.id}`}>
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">Client:</span> {estimate.clientName}</p>
                      <p><span className="font-medium">Job:</span> {estimate.jobTitle}</p>
                      <p><span className="font-medium">Amount:</span> {formatCurrency(estimate.amount)}</p>
                      <p><span className="font-medium">Expires:</span> {new Date(estimate.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEstimate(estimate)}
                      data-testid={`button-view-estimate-${estimate.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-edit-estimate-${estimate.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {estimate.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendEstimate(estimate.id)}
                        data-testid={`button-send-estimate-${estimate.id}`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    {estimate.status === 'sent' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => handleApproveEstimate(estimate.id)}
                        data-testid={`button-approve-estimate-${estimate.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-download-estimate-${estimate.id}`}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estimate Details Dialog */}
      {selectedEstimate && (
        <Dialog open={!!selectedEstimate} onOpenChange={() => setSelectedEstimate(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Estimate Details - {selectedEstimate.documentNumber}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="items">Line Items</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Estimate Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Number:</span> {selectedEstimate.documentNumber}</p>
                      <p><span className="font-medium">Status:</span> {selectedEstimate.status}</p>
                      <p><span className="font-medium">Amount:</span> {formatCurrency(selectedEstimate.amount)}</p>
                      <p><span className="font-medium">Expires:</span> {new Date(selectedEstimate.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Client & Job</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Client:</span> {selectedEstimate.clientName}</p>
                      <p><span className="font-medium">Job:</span> {selectedEstimate.jobTitle}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="items">
                <p className="text-muted-foreground">Line items functionality coming soon...</p>
              </TabsContent>
              <TabsContent value="history">
                <p className="text-muted-foreground">Estimate history functionality coming soon...</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// EstimateForm Component
interface EstimateFormProps {
  clientId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function EstimateForm({ clientId, onSuccess, onCancel }: EstimateFormProps) {
  const { toast } = useToast();
  
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      clientId: clientId || "",
      jobTitle: "",
      description: "",
      amount: 0,
      expiresAt: "",
    },
  });

  const createEstimateMutation = useMutation({
    mutationFn: (data: EstimateFormData) => {
      const estimateData = {
        ...data,
        expiresAt: new Date(data.expiresAt),
        status: 'draft',
        documentNumber: `EST-${Date.now()}`,
      };
      return apiRequest("POST", "/api/estimates", estimateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: "Estimate created successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EstimateFormData) => {
    createEstimateMutation.mutate(data);
  };

  // Get default expiration date (30 days from now)
  const defaultExpirationDate = new Date();
  defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 30);
  const defaultDateString = defaultExpirationDate.toISOString().split('T')[0];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(clients as any[]).map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimate Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter job title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the work to be performed..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  {...field}
                  defaultValue={defaultDateString}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={createEstimateMutation.isPending}
          >
            {createEstimateMutation.isPending ? "Creating..." : "Create Estimate"}
          </Button>
        </div>
      </form>
    </Form>
  );
}