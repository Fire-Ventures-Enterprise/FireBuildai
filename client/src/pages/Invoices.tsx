import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Search, Plus, Eye, Edit, Send, FileDown, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  documentNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
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

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/invoices/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
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

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    let filtered = invoices;
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice: Invoice) => invoice.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((invoice: Invoice) =>
        invoice.documentNumber.toLowerCase().includes(term) ||
        invoice.clientName.toLowerCase().includes(term) ||
        invoice.jobTitle.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [invoices, statusFilter, searchTerm]);

  const handleSendInvoice = (invoiceId: string) => {
    updateInvoiceMutation.mutate({ id: invoiceId, status: 'sent' });
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
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Manage and track your invoices
            </p>
          </div>
        </div>
        <Button data-testid="button-create-invoice">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices by number, client, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-invoices"
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice Cards */}
      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first invoice to get started"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice: Invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg" data-testid={`text-invoice-number-${invoice.id}`}>
                        {invoice.documentNumber}
                      </h3>
                      <Badge className={statusColors[invoice.status]} data-testid={`badge-status-${invoice.id}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">Client:</span> {invoice.clientName}</p>
                      <p><span className="font-medium">Job:</span> {invoice.jobTitle}</p>
                      <p><span className="font-medium">Amount:</span> {formatCurrency(invoice.amount)}</p>
                      <p><span className="font-medium">Due:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                      data-testid={`button-view-invoice-${invoice.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-edit-invoice-${invoice.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {invoice.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendInvoice(invoice.id)}
                        data-testid={`button-send-invoice-${invoice.id}`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-download-invoice-${invoice.id}`}
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

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.documentNumber}</DialogTitle>
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
                    <h4 className="font-semibold mb-2">Invoice Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Number:</span> {selectedInvoice.documentNumber}</p>
                      <p><span className="font-medium">Status:</span> {selectedInvoice.status}</p>
                      <p><span className="font-medium">Amount:</span> {formatCurrency(selectedInvoice.amount)}</p>
                      <p><span className="font-medium">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Client & Job</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Client:</span> {selectedInvoice.clientName}</p>
                      <p><span className="font-medium">Job:</span> {selectedInvoice.jobTitle}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="items">
                <p className="text-muted-foreground">Line items functionality coming soon...</p>
              </TabsContent>
              <TabsContent value="history">
                <p className="text-muted-foreground">Invoice history functionality coming soon...</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}