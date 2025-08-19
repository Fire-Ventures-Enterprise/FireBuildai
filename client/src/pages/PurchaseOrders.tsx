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
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Search, Edit, Trash2, Calendar, DollarSign, User, FileText, Send, Check, X, Plus, Minus } from "lucide-react";
import { createInsertSchema } from "drizzle-zod";
import { purchaseOrders, poLineItems } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const insertPOSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  poNumber: true,
  companyId: true,
  sentAt: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  contractorId: z.string().min(1, "Contractor is required"),
  totalAmount: z.string().min(1, "Amount is required"),
  deliveryDate: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    totalPrice: z.string().min(1, "Total price is required"),
    notes: z.string().optional(),
  })).min(1, "At least one line item is required"),
});

type InsertPO = z.infer<typeof insertPOSchema>;

interface PurchaseOrder {
  id: string;
  poNumber: string;
  companyId: string;
  jobId?: string;
  contractorId: string;
  quoteId?: string;
  title: string;
  description?: string;
  totalAmount: string;
  status: string;
  terms?: string;
  deliveryDate?: string;
  sentAt?: string;
  acceptedAt?: string;
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
  quote?: {
    id: string;
    quoteNumber: string;
    title: string;
  };
  lineItems?: {
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    notes?: string;
  }[];
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  completed: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
};

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();

  const { data: purchaseOrders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: contractors = [] } = useQuery<any[]>({
    queryKey: ["/api/contractors"],
  });

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: quotes = [] } = useQuery<any[]>({
    queryKey: ["/api/quotes"],
  });

  const form = useForm<InsertPO>({
    resolver: zodResolver(insertPOSchema),
    defaultValues: {
      title: "",
      description: "",
      contractorId: "",
      jobId: "",
      quoteId: "",
      totalAmount: "",
      status: "draft",
      terms: "",
      deliveryDate: "",
      lineItems: [
        {
          description: "",
          quantity: "1",
          unitPrice: "",
          totalPrice: "",
          notes: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const createPOMutation = useMutation({
    mutationFn: async (poData: InsertPO) => {
      return apiRequest("POST", "/api/purchase-orders", poData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  const updatePOStatusMutation = useMutation({
    mutationFn: async ({ poId, status }: { poId: string; status: string }) => {
      return apiRequest("PUT", `/api/purchase-orders/${poId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Success",
        description: "Purchase order status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive",
      });
    },
  });

  const filteredPOs = purchaseOrders.filter((po: PurchaseOrder) => {
    const matchesSearch = po.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (po.contractor?.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const calculateLineItemTotal = (index: number) => {
    const quantity = parseFloat(form.watch(`lineItems.${index}.quantity`) || "0");
    const unitPrice = parseFloat(form.watch(`lineItems.${index}.unitPrice`) || "0");
    const total = quantity * unitPrice;
    form.setValue(`lineItems.${index}.totalPrice`, total.toFixed(2));
    calculateTotalAmount();
  };

  const calculateTotalAmount = () => {
    const lineItems = form.getValues("lineItems");
    const total = lineItems.reduce((sum, item) => {
      return sum + parseFloat(item.totalPrice || "0");
    }, 0);
    form.setValue("totalAmount", total.toFixed(2));
  };

  const onSubmit = (data: InsertPO) => {
    createPOMutation.mutate(data);
  };

  const handleStatusChange = (poId: string, newStatus: string) => {
    updatePOStatusMutation.mutate({ poId, status: newStatus });
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
        <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-po" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
              <DialogDescription>
                Create a purchase order to submit to contractors or trade people.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Kitchen Renovation Materials" {...field} data-testid="input-po-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of work or materials..."
                          className="resize-none"
                          {...field}
                          data-testid="input-po-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
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
                  <FormField
                    control={form.control}
                    name="quoteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Quote (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-quote">
                              <SelectValue placeholder="Select quote" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No quote selected</SelectItem>
                            {quotes.map((quote: any) => (
                              <SelectItem key={quote.id} value={quote.id}>
                                {quote.quoteNumber} - {quote.title}
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
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-delivery-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Line Items</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => append({
                        description: "",
                        quantity: "1",
                        unitPrice: "",
                        totalPrice: "",
                        notes: "",
                      })}
                      data-testid="button-add-line-item"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-4 rounded-lg">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Item description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="1" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    calculateLineItemTotal(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0.00" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    calculateLineItemTotal(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.totalPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly className="bg-muted" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            data-testid={`button-remove-item-${index}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Payment terms, delivery conditions, etc..."
                            className="resize-none"
                            {...field}
                            data-testid="input-po-terms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col justify-end">
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount ($)</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted text-lg font-semibold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

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
                    disabled={createPOMutation.isPending}
                    data-testid="button-submit-po"
                  >
                    {createPOMutation.isPending ? "Creating..." : "Create Purchase Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search purchase orders by title, PO number, or contractor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-pos"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Orders Grid */}
      {filteredPOs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Purchase Orders Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedStatus !== "all" 
              ? "No purchase orders match your current filters." 
              : "Get started by creating your first purchase order."
            }
          </p>
          {!searchQuery && selectedStatus === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create First Purchase Order
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPOs.map((po: PurchaseOrder) => (
            <Card key={po.id} className="border-border bg-card hover:shadow-lg transition-all duration-200" data-testid={`card-po-${po.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-card-foreground text-lg">{po.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      PO# {po.poNumber}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[po.status as keyof typeof statusColors]}>
                    {po.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {po.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {po.description}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contractor:</span>
                    <span className="text-card-foreground">
                      {po.contractor?.name || "Unknown"}
                    </span>
                  </div>

                  {po.job && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Job:</span>
                      <span className="text-card-foreground truncate">{po.job.title}</span>
                    </div>
                  )}

                  {po.quote && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Quote:</span>
                      <span className="text-card-foreground truncate">{po.quote.quoteNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="text-card-foreground font-medium">
                      ${parseFloat(po.totalAmount).toLocaleString()}
                    </span>
                  </div>

                  {po.deliveryDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className="text-card-foreground">
                        {new Date(po.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {po.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(po.id, "sent")}
                      data-testid={`button-send-${po.id}`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  )}
                  {po.status === "sent" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(po.id, "accepted")}
                        data-testid={`button-accept-${po.id}`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(po.id, "rejected")}
                        data-testid={`button-reject-${po.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {po.status === "accepted" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(po.id, "completed")}
                      data-testid={`button-complete-${po.id}`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Complete
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