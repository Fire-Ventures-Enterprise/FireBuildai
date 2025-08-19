import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Building, 
  Plus, 
  Search, 
  Filter,
  MapPin, 
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  contractorId?: string;
  contractorName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  totalAmount: z.number().min(0, "Amount must be positive"),
  status: z.enum(['draft', 'active', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  contractorId: z.string().optional(),
  notes: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function JobManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: contractors = [] } = useQuery({
    queryKey: ["/api/contractors"],
  });

  const jobForm = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      clientId: "",
      totalAmount: 0,
      status: "draft",
      priority: "medium",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: (data: JobFormData) => apiRequest("POST", "/api/jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowAddDialog(false);
      jobForm.reset();
      toast({
        title: "Success",
        description: "Job created successfully",
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

  const updateJobMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<JobFormData>) => 
      apiRequest("PATCH", `/api/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowEditDialog(false);
      setSelectedJob(null);
      toast({
        title: "Success",
        description: "Job updated successfully",
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

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setSelectedJob(null);
      toast({
        title: "Success",
        description: "Job deleted successfully",
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

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Management</h2>
          <p className="text-muted-foreground">Manage all construction projects and assignments</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-job">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <Form {...jobForm}>
              <form onSubmit={jobForm.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={jobForm.control}
                    name="title"
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
                    control={jobForm.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client: any) => (
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
                </div>

                <FormField
                  control={jobForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the job details..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={jobForm.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="contractorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contractor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign contractor" />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={jobForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createJobMutation.isPending}>
                    {createJobMutation.isPending ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs by title, client, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-job-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{job.clientName}</span>
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={statusColors[job.status]}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={priorityColors[job.priority]} variant="outline">
                      {job.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-semibold">{formatCurrency(job.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="font-semibold text-green-600">{formatCurrency(job.paidAmount)}</p>
                  </div>
                </div>

                {job.dueDate && (
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Due: {formatDate(job.dueDate)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    data-testid={`button-view-job-${job.id}`}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Jobs Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "No jobs match your current filters" 
                : "Create your first job to get started"
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}