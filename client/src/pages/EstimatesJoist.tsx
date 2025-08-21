import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Estimate } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Search, Plus, Eye, Edit, Mail, FileText, ExternalLink } from "lucide-react";
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

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  sent: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  declined: 'bg-red-100 text-red-800 border-red-300',
  expired: 'bg-orange-100 text-orange-800 border-orange-300',
};

const statusLabels = {
  draft: 'DRAFT',
  sent: 'ISSUED',
  approved: 'APPROVED',
  declined: 'DECLINED',
  expired: 'EXPIRED',
};

export default function EstimatesJoist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pending");
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

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Group estimates by status for tabs
  const estimatesByStatus = useMemo(() => {
    const grouped = {
      pending: estimates.filter(e => ['draft', 'sent'].includes(e.status)),
      approved: estimates.filter(e => e.status === 'approved'),
      declined: estimates.filter(e => e.status === 'declined'),
    };
    return grouped;
  }, [estimates]);

  // Filter estimates based on active tab and search
  const filteredEstimates = useMemo(() => {
    let filtered = estimatesByStatus[activeTab as keyof typeof estimatesByStatus] || [];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((estimate: Estimate) => {
        const client = clients.find((c: any) => c.id === estimate.clientId);
        const clientName = client?.name || '';
        const clientAddress = client?.address || '';
        return estimate.documentNumber.toLowerCase().includes(term) ||
          clientName.toLowerCase().includes(term) ||
          estimate.jobTitle.toLowerCase().includes(term) ||
          clientAddress.toLowerCase().includes(term);
      });
    }
    
    return filtered;
  }, [estimatesByStatus, activeTab, searchTerm, clients]);

  // Group estimates by month
  const estimatesByMonth = useMemo(() => {
    const grouped: { [key: string]: typeof filteredEstimates } = {};
    
    filteredEstimates.forEach((estimate) => {
      const date = new Date(estimate.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(estimate);
    });
    
    return grouped;
  }, [filteredEstimates]);

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const getClientInfo = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    return {
      name: client?.name || 'Unknown Client',
      address: client?.address || '',
      city: client?.city || '',
      state: client?.state || '',
    };
  };

  const calculateMonthTotal = (monthEstimates: Estimate[]) => {
    return monthEstimates.reduce((total, estimate) => total + Number(estimate.amount), 0);
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
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" data-testid="button-export">
            Export
          </Button>
          <Select defaultValue="standard">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Use Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Template</SelectItem>
              <SelectItem value="detailed">Detailed Template</SelectItem>
              <SelectItem value="simple">Simple Template</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={() => setLocation('/estimates/new')}
            data-testid="button-new-estimate"
          >
            New Estimate
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search all estimates by Name, Address, Estimate # or PO #"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-estimates"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-0 border-b">
        {[
          { key: 'pending', label: 'PENDING', count: estimatesByStatus.pending.length },
          { key: 'approved', label: 'APPROVED', count: estimatesByStatus.approved.length },
          { key: 'declined', label: 'DECLINED', count: estimatesByStatus.declined.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Estimates by Month */}
      <div className="space-y-8">
        {Object.keys(estimatesByMonth).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No estimates found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try adjusting your search criteria" : "Create your first estimate to get started"}
            </p>
          </div>
        ) : (
          Object.entries(estimatesByMonth).map(([month, monthEstimates]) => (
            <div key={month} className="space-y-4">
              {/* Month Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {month}
                </h2>
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(calculateMonthTotal(monthEstimates))}
                </div>
              </div>

              {/* Estimate Cards */}
              <div className="space-y-3">
                {monthEstimates.map((estimate) => {
                  const clientInfo = getClientInfo(estimate.clientId);
                  return (
                    <Card key={estimate.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-base">
                                {estimate.jobTitle} - #{estimate.documentNumber}
                              </h3>
                              <Badge 
                                className={`${statusColors[estimate.status]} text-xs font-medium px-2 py-1`}
                                data-testid={`badge-status-${estimate.id}`}
                              >
                                {statusLabels[estimate.status]}
                              </Badge>
                              {estimate.status === 'sent' && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-xs text-blue-600">Sync Done</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {clientInfo.address && (
                                <p>{clientInfo.address}, {clientInfo.city} {clientInfo.state}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Client: {clientInfo.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {formatCurrency(estimate.amount)}
                              </div>
                              {estimate.status === 'sent' && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  <span>Email opened</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/estimates/${estimate.id}`)}
                                data-testid={`button-open-estimate-${estimate.id}`}
                              >
                                Open
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/estimates/${estimate.id}/edit`)}
                                data-testid={`button-edit-estimate-${estimate.id}`}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
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
      </div>
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
                  placeholder="Enter estimate description"
                  className="min-h-[100px]"
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
                  defaultValue={defaultDateString}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createEstimateMutation.isPending}>
            {createEstimateMutation.isPending ? "Creating..." : "Create Estimate"}
          </Button>
        </div>
      </form>
    </Form>
  );
}