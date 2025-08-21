import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Estimate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Mail, FileText, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface EstimateDetailProps {
  estimateId: string;
}

export default function EstimateDetail({ estimateId }: EstimateDetailProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const { data: estimate, isLoading } = useQuery<Estimate>({
    queryKey: ["/api/estimates", estimateId],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const getClientInfo = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    return {
      name: client?.name || 'Unknown Client',
      address: client?.address || '',
      city: client?.city || '',
      state: client?.state || '',
      zipCode: client?.zipCode || '',
      phone: client?.phone || '',
      email: client?.email || '',
    };
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  if (isLoading || !estimate) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const clientInfo = getClientInfo(estimate.clientId);
  
  // Mock line items for demonstration
  const lineItems = [
    {
      id: '1',
      description: estimate.jobTitle,
      details: estimate.description || 'Complete kitchen renovation project',
      rate: Number(estimate.amount),
      quantity: 1,
      total: Number(estimate.amount)
    }
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.13; // 13% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/estimates')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Estimates
            </Button>
            <h1 className="text-xl font-semibold">Estimate #{estimate.documentNumber}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              EDIT
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              EMAIL
            </Button>
            
            <Select defaultValue="pending">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">PENDING</SelectItem>
                <SelectItem value="approved">APPROVED</SelectItem>
                <SelectItem value="declined">DECLINED</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              GENERATE INVOICE
            </Button>
            
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              MORE
            </Button>
          </div>
        </div>
      </div>

      {/* Estimate Document */}
      <div className="p-8">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="text-gray-400 text-sm font-medium tracking-wider mb-4">ESTIMATE</div>
            </div>

            {/* Company & Client Info */}
            <div className="flex justify-between mb-8">
              {/* Company Logo & Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-pink-500 rounded flex items-center justify-center">
                  <div className="text-white font-bold text-xl">FB</div>
                </div>
                <div>
                  <h2 className="font-bold text-lg">FireBuild Kitchen & Cabinetry</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>123 Construction Ave</p>
                    <p>Builder City, BC K1A 2G0</p>
                    <p>Phone: (613) 555-0123</p>
                    <p>Email: info@firebuildcabinetry@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Service Address & Prepared For */}
              <div className="text-right space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Service Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{clientInfo.address}</p>
                    <p>{clientInfo.city}, {clientInfo.state} {clientInfo.zipCode}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Prepared For</h3>
                  <div className="text-sm text-gray-600">
                    <p>{clientInfo.name}</p>
                    <p>{clientInfo.address}</p>
                    <p>{clientInfo.city}, {clientInfo.state} {clientInfo.zipCode}</p>
                    <p>{clientInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate Details */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-semibold text-lg">{estimate.jobTitle}</h3>
                <div className="text-sm text-gray-600 mt-2">
                  <p>{clientInfo.address}</p>
                  <p>{estimate.description}</p>
                </div>
              </div>
              
              <div className="text-right text-sm">
                <div className="space-y-1">
                  <div><span className="font-medium">Estimate #:</span> {estimate.documentNumber}</div>
                  <div><span className="font-medium">Date:</span> {new Date(estimate.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-medium">PO #:</span> {clientInfo.address || 'N/A'}</div>
                  <div><span className="font-medium">Business / Tax #:</span> 789574288T0001</div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold">Description</th>
                    <th className="text-right py-3 font-semibold w-24">Rate</th>
                    <th className="text-right py-3 font-semibold w-20">Quantity</th>
                    <th className="text-right py-3 font-semibold w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-4">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                          {item.details}
                        </div>
                      </td>
                      <td className="text-right py-4">{formatCurrency(item.rate)}</td>
                      <td className="text-right py-4">{item.quantity}</td>
                      <td className="text-right py-4 font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HST</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Deposit Due</span>
                    <span>{formatCurrency(total * 0.5)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 space-y-4">
              <div className="font-medium">THANK YOU FOR YOUR BUSINESS!</div>
              <div className="text-sm text-gray-600">
                By signing this document, the customer agrees to the services and conditions outlined in this document.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}