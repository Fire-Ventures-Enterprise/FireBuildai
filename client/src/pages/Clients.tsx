import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Star, Phone, Mail, MapPin, Plus, Eye, Search, User, DollarSign, Calendar, FileText, Building, MessageSquare, PhoneCall, Send, Camera } from "lucide-react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDeviceDetection, isPlatformFeatureAvailable } from "@/hooks/useDeviceDetection";

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
  documentNumber?: string;
  amount?: number;
  status: string;
  createdAt: Date;
  signedAt?: Date;
  documentUrl: string;
}

interface Communication {
  id: string;
  clientId: string;
  type: 'sms' | 'email' | 'call';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content?: string;
  phoneNumber?: string;
  emailAddress?: string;
  duration?: number;
  status: string;
  sentAt: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = z.object({
  type: z.enum(["sms", "email", "call"]),
  subject: z.string().optional(),
  content: z.string().optional(),
  duration: z.number().optional(),
}).refine((data) => {
  // Content is required for SMS and email
  if ((data.type === "sms" || data.type === "email") && !data.content?.trim()) {
    return false;
  }
  // Duration is required for calls
  if (data.type === "call" && (!data.duration || data.duration <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Please fill in all required fields",
  path: ["content"], // This will show the error on the content field
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deviceInfo = useDeviceDetection();
  
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

  const { data: clientCommunications } = useQuery<Communication[]>({
    queryKey: ["/api/clients", selectedClient?.id, "communications"],
    enabled: !!selectedClient,
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: "email",
      content: "",
      duration: 0,
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      if (!selectedClient) throw new Error("No client selected");

      const messageData = {
        clientId: selectedClient.id,
        type: data.type,
        direction: "outgoing",
        subject: data.subject,
        content: data.content,
        emailAddress: data.type === "email" ? selectedClient.email : undefined,
        phoneNumber: (data.type === "sms" || data.type === "call") ? selectedClient.phone : undefined,
        duration: data.type === "call" ? data.duration : undefined,
        status: data.type === "call" ? "completed" : "sent",
        sentAt: new Date(),
      };

      return apiRequest("POST", "/api/communications", messageData);
    },
    onSuccess: (_, variables) => {
      const actionText = variables.type === "call" ? "Call Logged" : "Message Sent";
      const descriptionText = variables.type === "call" 
        ? "Your call has been logged in the client's communication history." 
        : "Your message has been sent successfully.";
      
      toast({
        title: actionText,
        description: descriptionText,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients", selectedClient?.id, "communications"] });
      messageForm.reset();
      setShowMessageDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
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

  // Search functionality with document numbers using backend API
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/clients/search", searchTerm],
    enabled: !!searchTerm.trim(),
    staleTime: 1000, // Cache for 1 second
  });

  const filteredClients = useMemo(() => {
    if (searchTerm.trim()) {
      return Array.isArray(searchResults) ? searchResults : [];
    }
    return Array.isArray(clients) ? clients : [];
  }, [clients, searchResults, searchTerm]);

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

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search clients by name, address, phone, or document number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-clients"
        />
      </div>

      {/* Results count */}
      {searchTerm && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClients?.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                      {getInitials(client.name)}
                    </span>
                  </div>
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
                  {client.tags.slice(0, 2).map((tag: string, index: number) => (
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
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-700 dark:text-blue-300 font-semibold">
                            {getInitials(client.name)}
                          </span>
                        </div>
                        {client.name}
                      </DialogTitle>
                      <DialogDescription>
                        Complete client information and document history
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                        <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs ({client.totalJobs})</TabsTrigger>
                        <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
                        <TabsTrigger value="communications" data-testid="tab-communications">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Communications
                        </TabsTrigger>
                        <TabsTrigger value="photos" data-testid="tab-photos">
                          <Camera className="h-4 w-4 mr-1" />
                          Photos
                        </TabsTrigger>
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
                                        {document.documentNumber && (
                                          <Badge variant="outline" className="ml-2">
                                            #{document.documentNumber}
                                          </Badge>
                                        )}
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

                      <TabsContent value="communications" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Communications</h3>
                          <div className="flex gap-2">
                            {selectedClient?.phone && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => window.open(`tel:${selectedClient.phone}`, '_self')}
                              >
                                <PhoneCall className="h-4 w-4" />
                                Call Now
                              </Button>
                            )}
                            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                  <Send className="h-4 w-4" />
                                  Send Message
                                </Button>
                              </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Send Message to {selectedClient?.name}</DialogTitle>
                                <DialogDescription>
                                  Send an SMS, email, or log a completed call with this client
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...messageForm}>
                                <form onSubmit={messageForm.handleSubmit((data) => sendMessageMutation.mutate(data))} className="space-y-4">
                                  <FormField
                                    control={messageForm.control}
                                    name="type"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Message Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="email">
                                              <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email
                                              </div>
                                            </SelectItem>
                                            {isPlatformFeatureAvailable('sms', deviceInfo) ? (
                                              <SelectItem value="sms">
                                                <div className="flex items-center gap-2">
                                                  <MessageSquare className="h-4 w-4" />
                                                  SMS
                                                </div>
                                              </SelectItem>
                                            ) : (
                                              <SelectItem value="sms" disabled>
                                                <div className="flex items-center gap-2">
                                                  <MessageSquare className="h-4 w-4 opacity-50" />
                                                  SMS (Mobile Only)
                                                </div>
                                              </SelectItem>
                                            )}
                                            <SelectItem value="call">
                                              <div className="flex items-center gap-2">
                                                <PhoneCall className="h-4 w-4" />
                                                Call
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  {messageForm.watch("type") === "email" && (
                                    <FormField
                                      control={messageForm.control}
                                      name="subject"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Subject</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Enter email subject" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  {messageForm.watch("type") === "call" && (
                                    <FormField
                                      control={messageForm.control}
                                      name="duration"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Call Duration (minutes)</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              placeholder="Enter call duration in minutes"
                                              min="1"
                                              {...field}
                                              onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                          </FormControl>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Log the duration of a completed call
                                          </p>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  {messageForm.watch("type") !== "call" && (
                                    <FormField
                                      control={messageForm.control}
                                      name="content"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {messageForm.watch("type") === "email" ? "Email Content" : "SMS Message"}
                                          </FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder={
                                                messageForm.watch("type") === "email"
                                                  ? "Enter your email message..."
                                                  : "Enter your SMS message (160 characters max)..."
                                              }
                                              rows={messageForm.watch("type") === "email" ? 6 : 3}
                                              maxLength={messageForm.watch("type") === "sms" ? 160 : undefined}
                                              {...field}
                                            />
                                          </FormControl>
                                          {messageForm.watch("type") === "sms" && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {field.value?.length || 0}/160 characters
                                            </p>
                                          )}
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  {messageForm.watch("type") === "call" && (
                                    <FormField
                                      control={messageForm.control}
                                      name="content"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Call Notes (Optional)</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="What was discussed during the call? Any follow-up actions needed?"
                                              rows={4}
                                              {...field}
                                            />
                                          </FormControl>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Document what was discussed and any next steps
                                          </p>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => setShowMessageDialog(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      disabled={sendMessageMutation.isPending}
                                      className="gap-2"
                                    >
                                      {messageForm.watch("type") === "call" ? (
                                        <PhoneCall className="h-4 w-4" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                      {sendMessageMutation.isPending 
                                        ? "Processing..." 
                                        : messageForm.watch("type") === "call" 
                                          ? "Log Call" 
                                          : "Send Message"
                                      }
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          </div>
                        </div>
                        
                        {Array.isArray(clientCommunications) && clientCommunications.length > 0 ? (
                          <div className="space-y-3">
                            {clientCommunications.map((comm) => (
                              <Card key={comm.id} className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full ${
                                    comm.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                                    comm.type === 'sms' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                                    'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                                  }`}>
                                    {comm.type === 'email' ? <Mail className="h-4 w-4" /> :
                                     comm.type === 'sms' ? <MessageSquare className="h-4 w-4" /> :
                                     <PhoneCall className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          comm.direction === 'outgoing' 
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                          {comm.direction === 'outgoing' ? '→ Outgoing' : '← Incoming'}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {comm.type.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(comm.sentAt)}
                                      </div>
                                    </div>
                                    
                                    {comm.subject && (
                                      <h4 className="font-medium text-gray-900 dark:text-white mt-1">
                                        {comm.subject}
                                      </h4>
                                    )}
                                    
                                    {comm.content && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {comm.content}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                      {comm.type === 'email' && comm.emailAddress && (
                                        <span>To: {comm.emailAddress}</span>
                                      )}
                                      {(comm.type === 'sms' || comm.type === 'call') && comm.phoneNumber && (
                                        <span>Phone: {comm.phoneNumber}</span>
                                      )}
                                      {comm.type === 'call' && comm.duration && (
                                        <span>Duration: {Math.floor(comm.duration / 60)}:{(comm.duration % 60).toString().padStart(2, '0')}</span>
                                      )}
                                      <span className={`px-2 py-1 rounded-full ${getStatusColor(comm.status)}`}>
                                        {comm.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card className="text-center py-12">
                            <CardContent>
                              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">No communications found for this client</p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="photos" className="space-y-4">
                        <ClientPhotos client={selectedClient} />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="h-16 w-16 rounded-full bg-gray-400 dark:bg-gray-600 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
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

interface ClientPhoto {
  id: string;
  clientId: string;
  imageUrl: string;
  description?: string;
  createdAt: Date;
}

function ClientPhotos({ client }: { client: Client | null }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deviceInfo = useDeviceDetection();

  const photosQuery = useQuery<ClientPhoto[]>({
    queryKey: [`/api/clients/${client?.id}/photos`],
    enabled: !!client?.id,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest("DELETE", `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${client?.id}/photos`] });
      toast({
        title: "Photo deleted",
        description: "The photo has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadPhoto = async (imageData: string) => {
    if (!client?.id) return;

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/photos/upload-url");
      const { uploadURL } = await uploadResponse.json();

      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Upload to object storage
      await fetch(uploadURL, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      // Save photo record
      const objectPath = new URL(uploadURL).pathname;
      await apiRequest("POST", `/api/clients/${client.id}/photos`, {
        imageUrl: objectPath,
        description: "Photo captured from client portal",
      });

      queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}/photos`] });
      setCapturedImage(null);
      setIsCameraOpen(false);
      
      toast({
        title: "Photo saved",
        description: "The photo has been added to the client's profile.",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to save the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const CameraCapture = () => {
    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Use back camera on mobile
        });
        if (videoRef) {
          videoRef.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to take photos.",
          variant: "destructive",
        });
      }
    };

    const capturePhoto = () => {
      if (videoRef && canvasRef) {
        const context = canvasRef.getContext('2d');
        if (context) {
          canvasRef.width = videoRef.videoWidth;
          canvasRef.height = videoRef.videoHeight;
          context.drawImage(videoRef, 0, 0);
          const imageData = canvasRef.toDataURL('image/jpeg');
          setCapturedImage(imageData);
          
          // Stop camera stream
          const stream = videoRef.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        }
      }
    };

    return (
      <div className="space-y-4">
        {!capturedImage ? (
          <div className="relative">
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
              onLoadedMetadata={startCamera}
            />
            <canvas ref={setCanvasRef} className="hidden" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full h-16 w-16 bg-white text-black hover:bg-gray-100"
              >
                <Camera className="h-8 w-8" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
            <div className="flex gap-2">
              <Button
                onClick={() => setCapturedImage(null)}
                variant="outline"
                className="flex-1"
              >
                Retake
              </Button>
              <Button
                onClick={() => uploadPhoto(capturedImage)}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? "Saving..." : "Save Photo"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!client) return null;

  const canTakePhotos = isPlatformFeatureAvailable('camera', deviceInfo);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Client Photos</h3>
        {canTakePhotos ? (
          <Button
            onClick={() => setIsCameraOpen(true)}
            className="gap-2"
            data-testid="button-take-photo"
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            📱 Photo capture available on mobile devices only
          </div>
        )}
      </div>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Take Photo</DialogTitle>
            <DialogDescription>
              Capture a photo for {client?.name}'s profile
            </DialogDescription>
          </DialogHeader>
          <CameraCapture />
        </DialogContent>
      </Dialog>

      {photosQuery.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photosQuery.data && photosQuery.data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photosQuery.data.map((photo: ClientPhoto) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.imageUrl}
                alt={photo.description || "Client photo"}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deletePhotoMutation.mutate(photo.id)}
                  disabled={deletePhotoMutation.isPending}
                >
                  Delete
                </Button>
              </div>
              {photo.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {photo.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No photos yet</p>
            {canTakePhotos ? (
              <Button
                onClick={() => setIsCameraOpen(true)}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Take First Photo
              </Button>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                📱 Use the mobile app to capture photos
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}