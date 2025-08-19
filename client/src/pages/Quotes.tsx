import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Search, Upload, FileText, Calendar, DollarSign, User, Check, X, Download } from "lucide-react";
import { createInsertSchema } from "drizzle-zod";
import { quotes } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  companyId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  contractorId: z.string().min(1, "Contractor is required"),
  totalAmount: z.string().min(1, "Amount is required"),
});

type InsertQuote = z.infer<typeof insertQuoteSchema>;

interface Quote {
  id: string;
  companyId: string;
  jobId?: string;
  contractorId: string;
  quoteNumber: string;
  title: string;
  description?: string;
  totalAmount: string;
  status: string;
  validUntil?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  contractor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  job?: {
    id: string;
    title: string;
  };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
};

export default function Quotes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["/api/quotes"],
  });

  const { data: contractors = [] } = useQuery({
    queryKey: ["/api/contractors"],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      quoteNumber: "",
      title: "",
      description: "",
      contractorId: "",
      jobId: "",
      totalAmount: "",
      status: "pending",
      validUntil: "",
      documentUrl: "",
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: InsertQuote) => {
      return apiRequest("POST", "/api/quotes", quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
    },
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      return apiRequest("PUT", `/api/quotes/${quoteId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Success",
        description: "Quote status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive",
      });
    },
  });

  const uploadQuoteMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/quotes/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Quote document uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload quote document",
        variant: "destructive",
      });
    },
  });

  const filteredQuotes = quotes.filter((quote: Quote) => {
    const matchesSearch = quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (quote.contractor?.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || quote.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: InsertQuote) => {
    createQuoteMutation.mutate(data);
  };

  const handleStatusChange = (quoteId: string, newStatus: string) => {
    updateQuoteStatusMutation.mutate({ quoteId, status: newStatus });
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("document", selectedFile);
    uploadQuoteMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-muted rounded w-64"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Quotes Management</h1>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-upload-quote" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Quote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Quote Document</DialogTitle>
                <DialogDescription>
                  Upload a quote document from contractors or suppliers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Click to select a quote document or drag and drop
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mt-2"
                      data-testid="input-quote-file"
                    />
                  </div>
                </div>
                {selectedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || uploadQuoteMutation.isPending}
                    data-testid="button-upload-submit"
                  >
                    {uploadQuoteMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-quote" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quote</DialogTitle>
                <DialogDescription>
                  Create a new quote record for tracking contractor quotes.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quoteNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quote Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Q-2024-001" {...field} data-testid="input-quote-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quote Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Kitchen Renovation Quote" {...field} data-testid="input-quote-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Quote description and details..."
                            className="resize-none"
                            {...field}
                            data-testid="input-quote-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contractorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contractor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-contractor">
                                <SelectValue placeholder="Select contractor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contractors.map((contractor: any) => (
                                <SelectItem key={contractor.id} value={contractor.id}>
                                  {contractor.name}
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
                      name="jobId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Job (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-job">
                                <SelectValue placeholder="Select job" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No job selected</SelectItem>
                              {jobs.map((job: any) => (
                                <SelectItem key={job.id} value={job.id}>
                                  {job.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="5000.00" {...field} data-testid="input-total-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-valid-until" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="documentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} data-testid="input-document-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createQuoteMutation.isPending}
                      data-testid="button-submit-quote"
                    >
                      {createQuoteMutation.isPending ? "Creating..." : "Create Quote"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search quotes by title, number, or contractor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-quotes"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Quotes Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedStatus !== "all" 
              ? "No quotes match your current filters." 
              : "Get started by creating or uploading your first quote."
            }
          </p>
          {!searchQuery && selectedStatus === "all" && (
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Quote
              </Button>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Quote
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((quote: Quote) => (
            <Card key={quote.id} className="border-border bg-card hover:shadow-lg transition-all duration-200" data-testid={`card-quote-${quote.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-card-foreground text-lg">{quote.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {quote.quoteNumber}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[quote.status as keyof typeof statusColors]}>
                    {quote.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {quote.description}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contractor:</span>
                    <span className="text-card-foreground">
                      {quote.contractor?.name || "Unknown"}
                    </span>
                  </div>

                  {quote.job && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Job:</span>
                      <span className="text-card-foreground truncate">{quote.job.title}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-card-foreground font-medium">
                      ${parseFloat(quote.totalAmount).toLocaleString()}
                    </span>
                  </div>

                  {quote.validUntil && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span className="text-card-foreground">
                        {new Date(quote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {quote.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(quote.id, "approved")}
                        data-testid={`button-approve-${quote.id}`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(quote.id, "rejected")}
                        data-testid={`button-reject-${quote.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {quote.documentUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(quote.documentUrl, "_blank")}
                      data-testid={`button-download-${quote.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}