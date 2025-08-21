import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Send, Download, User, Calendar, DollarSign } from "lucide-react";
import { type Estimate } from "@shared/schema";

export default function EstimateView() {
  const { id } = useParams();

  const { data: estimate, isLoading } = useQuery<Estimate>({
    queryKey: ["/api/estimates", id],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Estimate Not Found</h2>
        <Link href="/estimates">
          <Button>Back to Estimates</Button>
        </Link>
      </div>
    );
  }

  const client = (clients as any[]).find(c => c.id === estimate.clientId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'sent': return 'secondary';
      case 'declined': return 'destructive';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/estimates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">#{estimate.documentNumber}</h1>
            <p className="text-gray-600 mt-1">{estimate.jobTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(estimate.status)} className="text-sm">
            {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
          </Badge>
          
          <Link href={`/estimates/${estimate.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Send to Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estimate Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{estimate.jobTitle}</h3>
                <p className="text-gray-600 leading-relaxed">{estimate.description}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-3xl font-bold text-green-600">
                    ${Number(estimate.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future: Line Items would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Line items feature coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client ? (
                <>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </div>
                  {client.address && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        {client.address}
                        {client.city && `, ${client.city}`}
                        {client.state && `, ${client.state}`}
                        {client.zipCode && ` ${client.zipCode}`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Client information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span>{estimate.createdAt ? new Date(estimate.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">
                  {estimate.expiresAt ? new Date(estimate.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              {estimate.sentAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sent:</span>
                  <span>{new Date(estimate.sentAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {estimate.approvedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Approved:</span>
                  <span className="text-green-600 font-medium">
                    {new Date(estimate.approvedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {estimate.declinedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Declined:</span>
                  <span className="text-red-600 font-medium">
                    {new Date(estimate.declinedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Convert to Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}