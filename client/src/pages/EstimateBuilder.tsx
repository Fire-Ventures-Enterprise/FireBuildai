import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Estimate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, Calendar, FileText, CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface LineItem {
  id: string;
  description: string;
  rate: number;
  markup: number;
  quantity: number;
  tax: boolean;
  total: number;
}

interface EstimateBuilderProps {
  estimateId?: string;
}

export default function EstimateBuilder({ estimateId }: EstimateBuilderProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [estimateNumber, setEstimateNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  // Settings
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [coverProcessingFee, setCoverProcessingFee] = useState(true);
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(true);
  const [allowApproval, setAllowApproval] = useState(true);

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: estimate, isLoading } = useQuery<Estimate>({
    queryKey: ["/api/estimates", estimateId],
    enabled: !!estimateId,
  });

  // Initialize form with existing estimate data
  useEffect(() => {
    if (estimate) {
      setSelectedClientId(estimate.clientId);
      setEstimateNumber(estimate.documentNumber);
      setDate(new Date(estimate.createdAt).toISOString().split('T')[0]);
      setExpirationDate(new Date(estimate.expiresAt).toISOString().split('T')[0]);
      // Initialize with a default line item based on estimate
      setLineItems([{
        id: '1',
        description: estimate.jobTitle,
        rate: Number(estimate.amount),
        markup: 0,
        quantity: 1,
        tax: true,
        total: Number(estimate.amount)
      }]);
    } else {
      // New estimate defaults
      setEstimateNumber(`EST-${Date.now()}`);
      const defaultExpiration = new Date();
      defaultExpiration.setDate(defaultExpiration.getDate() + 30);
      setExpirationDate(defaultExpiration.toISOString().split('T')[0]);
    }
  }, [estimate]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      rate: 0,
      markup: 0,
      quantity: 1,
      tax: true,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total when rate, markup, or quantity changes
        if (field === 'rate' || field === 'markup' || field === 'quantity') {
          const baseAmount = updated.rate * updated.quantity;
          const markupAmount = baseAmount * (updated.markup / 100);
          updated.total = baseAmount + markupAmount;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const markup = lineItems.reduce((sum, item) => sum + (item.rate * item.quantity * item.markup / 100), 0);
    const taxableAmount = lineItems.filter(item => item.tax).reduce((sum, item) => sum + item.total, 0);
    const tax = taxableAmount * 0.13; // 13% tax rate
    const total = subtotal + tax;
    
    return { subtotal, markup, tax, total };
  };

  const totals = calculateTotals();

  const getClientInfo = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client || null;
  };

  const selectedClient = getClientInfo(selectedClientId);

  const saveEstimate = useMutation({
    mutationFn: (data: any) => {
      const estimateData = {
        clientId: selectedClientId,
        jobTitle: lineItems[0]?.description || "New Estimate",
        description: lineItems.map(item => item.description).join('; '),
        amount: totals.total,
        expiresAt: new Date(expirationDate),
        status: 'draft',
        documentNumber: estimateNumber,
      };
      
      if (estimateId) {
        return apiRequest("PATCH", `/api/estimates/${estimateId}`, estimateData);
      } else {
        return apiRequest("POST", "/api/estimates", estimateData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: estimateId ? "Estimate updated successfully" : "Estimate created successfully",
      });
      setLocation('/estimates');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white">
        <div className="p-4">
          <div className="w-16 h-16 bg-pink-500 rounded mb-4 flex items-center justify-center">
            <div className="text-white font-bold text-xl">FB</div>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-green-600 rounded text-sm">
              <FileText className="h-4 w-4" />
              Estimates
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-300 text-sm">
              <FileText className="h-4 w-4" />
              Invoices
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-300 text-sm">
              <Users className="h-4 w-4" />
              Clients
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {estimateId ? `Estimate #${estimateNumber}` : 'New Estimate'}
            </h1>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/estimates')}
              >
                CANCEL
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => saveEstimate.mutate({})}
                disabled={saveEstimate.isPending}
              >
                {saveEstimate.isPending ? "SAVING..." : "SAVE"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="col-span-2 space-y-6">
              {/* Company Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-pink-500 rounded flex items-center justify-center">
                      <div className="text-white font-bold text-xl">FB</div>
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">FireBuild Kitchen & Cabinetry</h2>
                      <div className="text-sm text-gray-600">
                        <p>123 Construction Ave, Builder City, BC</p>
                        <p>K2M 2J9 • Canada</p>
                        <p>info@firebuildcabinetry@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Line Items</h3>
                    <Button onClick={addLineItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      ADD LINE ITEM
                    </Button>
                  </div>

                  {/* Line Items Table Header */}
                  <div className="grid grid-cols-12 gap-2 pb-3 border-b text-sm font-medium text-gray-600">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2 text-center">Rate</div>
                    <div className="col-span-1 text-center">Markup</div>
                    <div className="col-span-1 text-center">Quantity</div>
                    <div className="col-span-1 text-center">Tax</div>
                    <div className="col-span-2 text-center">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Existing Line Items */}
                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 py-3 border-b">
                      <div className="col-span-4">
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="text-center text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.1"
                          value={item.markup}
                          onChange={(e) => updateLineItem(item.id, 'markup', parseFloat(e.target.value) || 0)}
                          className="text-center text-sm"
                          placeholder="%"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="text-center text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => updateLineItem(item.id, 'tax', !item.tax)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {item.tax ? (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <div className="col-span-2 text-center text-sm font-medium py-2">
                        {formatCurrency(item.total)}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Line Item Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={addLineItem} 
                      variant="outline" 
                      className="w-full border-dashed border-2 text-green-600 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      ADD LINE ITEM
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-semibold">Settings</h3>
                  
                  {/* Online Payments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Online Payments</div>
                          <div className="text-sm text-gray-500">Accept Credit Cards and PayPal</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setOnlinePayments(!onlinePayments)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {onlinePayments ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Cover Payment Processing Fee</div>
                        <div className="text-sm text-gray-500">Applies a markup to cover your processing fee.</div>
                      </div>
                      <button
                        onClick={() => setCoverProcessingFee(!coverProcessingFee)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {coverProcessingFee ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto-generate Invoice</div>
                        <div className="text-sm text-gray-500">Automatically provides your client with an invoice after they approve this estimate.</div>
                      </div>
                      <button
                        onClick={() => setAutoGenerateInvoice(!autoGenerateInvoice)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {autoGenerateInvoice ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Allow Approval */}
                  <div className="bg-green-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">New! Allow customers to approve your estimate to automatically generate an invoice to receive payments.</div>
                      </div>
                      <button
                        onClick={() => setAllowApproval(!allowApproval)}
                        className="text-white"
                      >
                        {allowApproval ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Client & Details */}
            <div className="space-y-6">
              {/* Client Selection */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500 mb-4">ADD CLIENT</div>
                      <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {(clients as any[]).map((client: any) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedClient && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium">{selectedClient.name}</div>
                          <div className="text-gray-600">
                            {selectedClient.address}<br/>
                            {selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}<br/>
                            {selectedClient.phone}<br/>
                            {selectedClient.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Estimate Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimate #</label>
                    <Input
                      value={estimateNumber}
                      onChange={(e) => setEstimateNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expiration Date</label>
                    <Input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">PO Number</label>
                    <Input
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Markup</span>
                      <span className="text-green-600">Add</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span className="text-green-600">Add</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Request a deposit</span>
                      <span className="text-green-600">Add</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Schedule</span>
                      <span className="text-green-600">Add</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total (CAD)</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}