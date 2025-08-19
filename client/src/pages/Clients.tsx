import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Star, Phone, Mail, MapPin, Calendar, FileText, DollarSign, Building, User, Plus, Eye } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  totalSpent: number;
  rating: number;
  isActive: boolean;
  lastContactDate?: Date;
  tags?: string[];
  preferredContactMethod: string;
  notes?: string;
  jobsCount: number;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  lastJobDate?: Date;
  createdAt: Date;
}

interface ClientJob {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  progress: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  contractorName?: string;
  createdAt: Date;
}

interface ClientDocument {
  id: string;
  jobId: string;
  jobTitle: string;
  documentType: 'invoice' | 'estimate' | 'contract' | 'work_order';
  documentName: string;
  amount?: number;
  status: string;
  createdAt: Date;
  signedAt?: Date;
  documentUrl: string;
}

export default function Clients() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: clientJobs } = useQuery<ClientJob[]>({
    queryKey: ["/api/clients", selectedClient?.id, "jobs"],
    enabled: !!selectedClient,
  });

  const { data: clientDocuments } = useQuery<ClientDocument[]>({
    queryKey: ["/api/clients", selectedClient?.id, "documents"],
    enabled: !!selectedClient,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'sent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your client relationships and communications
          </p>
        </div>
        <Button data-testid="button-add-client" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clients?.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" data-testid={`text-client-name-${client.id}`}>
                      {client.name}
                    </h3>
                    {client.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-rating-${client.id}`}>
                          {client.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={client.isActive ? "default" : "secondary"}
                  className="text-xs"
                  data-testid={`status-${client.id}`}
                >
                  {client.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3 w-3" />
                    <span className="truncate" data-testid={`text-email-${client.id}`}>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-3 w-3" />
                    <span data-testid={`text-phone-${client.id}`}>{client.phone}</span>
                  </div>
                )}
                {(client.city || client.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span data-testid={`text-location-${client.id}`}>
                      {client.city}{client.city && client.state && ', '}{client.state}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-total-spent-${client.id}`}>
                    {formatCurrency(client.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-jobs-count-${client.id}`}>
                    {client.totalJobs}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jobs</p>
                </div>
              </div>

              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {client.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-1" data-testid={`tag-${tag}-${client.id}`}>
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => setSelectedClient(client)}
                      data-testid={`button-view-details-${client.id}`}
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        {client.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                        <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs ({client.totalJobs})</TabsTrigger>
                        <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {client.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span>{client.email}</span>
                                </div>
                              )}
                              {client.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                              {client.secondaryPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span>{client.secondaryPhone} (Secondary)</span>
                                </div>
                              )}
                              {(client.address || client.city) && (
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                  <div>
                                    {client.address && <div>{client.address}</div>}
                                    {(client.city || client.state || client.zipCode) && (
                                      <div>
                                        {client.city}{client.city && (client.state || client.zipCode) && ', '}
                                        {client.state} {client.zipCode}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <Separator />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Contact</p>
                                <p className="font-medium capitalize">{client.preferredContactMethod}</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Business Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(client.totalSpent)}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {client.totalJobs}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {client.completedJobs}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {client.activeJobs}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                                </div>
                              </div>
                              {client.rating > 0 && (
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{client.rating.toFixed(1)}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Client Rating</span>
                                </div>
                              )}
                              {client.lastContactDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">Last contact: {formatDate(client.lastContactDate)}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {client.notes && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 dark:text-gray-300">{client.notes}</p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="jobs" className="space-y-4">
                        {clientJobs && clientJobs.length > 0 ? (
                          <div className="space-y-4">
                            {clientJobs.map((job) => (
                              <Card key={job.id}>
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        {job.title}
                                      </h4>
                                      {job.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                          {job.description}
                                        </p>
                                      )}
                                    </div>
                                    <Badge className={getStatusColor(job.status)}>
                                      {job.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                      <p className="font-semibold">{formatCurrency(job.totalAmount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                                      <p className="font-semibold text-green-600">{formatCurrency(job.paidAmount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                                      <p className="font-semibold">{job.progress}%</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Contractor</p>
                                      <p className="font-semibold">{job.contractorName || 'Unassigned'}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    {job.startDate && (
                                      <span>Started: {formatDate(job.startDate)}</span>
                                    )}
                                    {job.dueDate && (
                                      <span>Due: {formatDate(job.dueDate)}</span>
                                    )}
                                    {job.completedDate && (
                                      <span>Completed: {formatDate(job.completedDate)}</span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card>
                            <CardContent className="p-6 text-center">
                              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">No jobs found for this client</p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="documents" className="space-y-4">
                        {clientDocuments && clientDocuments.length > 0 ? (
                          <div className="space-y-4">
                            {clientDocuments.map((document) => (
                              <Card key={document.id}>
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          {document.documentName}
                                        </h4>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Job: {document.jobTitle}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <Badge className={getStatusColor(document.status)} variant="outline">
                                        {document.status.toUpperCase()}
                                      </Badge>
                                      {document.amount && (
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                                          {formatCurrency(document.amount)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-4">
                                      <span>Type: {document.documentType.replace('_', ' ').toUpperCase()}</span>
                                      <span>Created: {formatDate(document.createdAt)}</span>
                                      {document.signedAt && (
                                        <span>Signed: {formatDate(document.signedAt)}</span>
                                      )}
                                    </div>
                                    <Button variant="outline" size="sm">
                                      View PDF
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card>
                            <CardContent className="p-6 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">No documents found for this client</p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Clients Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building relationships by adding your first client
            </p>
            <Button data-testid="button-add-first-client" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}