import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Trash2, Calculator, FileText, Building2, User, Package } from "lucide-react";

// Purchase Order Line Item schema
const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
});

// Purchase Order form schema
const purchaseOrderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  contractorId: z.string().min(1, "Contractor is required"),
  jobId: z.string().optional(),
  quoteId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  requestedDeliveryDate: z.string().min(1, "Delivery date is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>;

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function CreatePurchaseOrder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      contractorId: "",
      jobId: "none",
      quoteId: "none",
      priority: "medium",
      requestedDeliveryDate: "",
      lineItems: lineItems,
      notes: "",
      termsAndConditions: "Standard terms and conditions apply. Payment due within 30 days of delivery.",
    },
  });

  // Fetch contractors
  const { data: contractors = [] } = useQuery<any[]>({
    queryKey: ["/api/contractors"],
  });

  // Fetch jobs
  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
  });

  // Fetch quotes
  const { data: quotes = [] } = useQuery<any[]>({
    queryKey: ["/api/quotes"],
  });

  // Create Purchase Order mutation
  const createPOMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/purchase-orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Purchase Order Created",
        description: "The purchase order has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setLocation("/purchase-orders");
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Purchase Order",
        description: error.message || "Failed to create purchase order.",
        variant: "destructive",
      });
    },
  });

  // Calculate line item total
  const calculateLineItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  // Add new line item
  const addLineItem = () => {
    const newLineItem = { description: "", quantity: 1, unitPrice: 0, total: 0 };
    const updatedLineItems = [...lineItems, newLineItem];
    setLineItems(updatedLineItems);
    form.setValue("lineItems", updatedLineItems);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedLineItems = lineItems.filter((_, i) => i !== index);
      setLineItems(updatedLineItems);
      form.setValue("lineItems", updatedLineItems);
    }
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index] = { ...updatedLineItems[index], [field]: value };
    
    // Recalculate total if quantity or unitPrice changed
    if (field === "quantity" || field === "unitPrice") {
      const { quantity, unitPrice } = updatedLineItems[index];
      updatedLineItems[index].total = calculateLineItemTotal(quantity, unitPrice);
    }
    
    setLineItems(updatedLineItems);
    form.setValue("lineItems", updatedLineItems);
  };

  // Calculate subtotal, tax, and total
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const onSubmit = (data: PurchaseOrderForm) => {
    const submissionData = {
      ...data,
      jobId: data.jobId === "none" ? null : data.jobId,
      quoteId: data.quoteId === "none" ? null : data.quoteId,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: grandTotal.toFixed(2),
      lineItems: lineItems.filter(item => item.description.trim() !== ""),
    };

    createPOMutation.mutate(submissionData);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/purchase-orders")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Purchase Order</h1>
            <p className="text-muted-foreground">
              Create a new purchase order for contractors and trades people
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Order Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Electrical Supplies for Office Renovation" 
                            {...field}
                            data-testid="input-title"
                          />
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
                            placeholder="Additional details about this purchase order..."
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requestedDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Delivery Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              data-testid="input-delivery-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contractor & Job Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Assignment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contractorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contractor *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-contractor">
                                <SelectValue placeholder="Select contractor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contractors.map((contractor: any) => (
                                <SelectItem key={contractor.id} value={contractor.id}>
                                  {contractor.name} - {contractor.trade}
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
                          <FormLabel>Associated Job (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-job">
                                <SelectValue placeholder="Select job" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No job selected</SelectItem>
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

                  <FormField
                    control={form.control}
                    name="quoteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Based on Quote (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-quote">
                              <SelectValue placeholder="Select quote" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No quote selected</SelectItem>
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
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Line Items</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addLineItem}
                      data-testid="button-add-line-item"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg">
                      <div className="col-span-5">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Input
                          id={`description-${index}`}
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, "description", e.target.value)}
                          data-testid={`input-line-item-description-${index}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`quantity-${index}`}>Qty</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                          data-testid={`input-line-item-quantity-${index}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                        <Input
                          id={`unitPrice-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          data-testid={`input-line-item-price-${index}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <div className="text-sm font-medium p-2 bg-muted rounded" data-testid={`text-line-item-total-${index}`}>
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center pt-6">
                        {lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            data-testid={`button-remove-line-item-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Internal notes for your team..."
                            {...field}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Terms and conditions for this purchase order..."
                            {...field}
                            data-testid="textarea-terms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span data-testid="text-tax">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span data-testid="text-total">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createPOMutation.isPending}
                      data-testid="button-create-po"
                    >
                      {createPOMutation.isPending ? "Creating..." : "Create Purchase Order"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setLocation("/purchase-orders")}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">PO Number:</span>
                    <span className="ml-2 text-muted-foreground">Auto-generated</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 text-muted-foreground">Draft</span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2 text-muted-foreground">Today</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}