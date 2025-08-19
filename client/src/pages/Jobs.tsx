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
import { PlusCircle, Search, Edit, Trash2, Calendar, Clock, DollarSign, User, MapPin, Briefcase } from "lucide-react";
import { createInsertSchema } from "drizzle-zod";
import { jobs } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  paidAmount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  contractorId: z.string().optional(),
  totalAmount: z.string().min(1, "Amount is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type InsertJob = z.infer<typeof insertJobSchema>;

interface Job {
  id: string;
  title: string;
  description?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  status: string;
  priority: string;
  progress: number;
  totalAmount: string;
  paidAmount: string;
  contractorId?: string;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
};

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: contractors = [] } = useQuery({
    queryKey: ["/api/contractors"],
  });

  const form = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      title: "",
      description: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      clientAddress: "",
      status: "planned",
      priority: "medium",
      progress: 0,
      totalAmount: "",
      contractorId: "",
      notes: "",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: InsertJob) => {
      return apiRequest("POST", "/api/jobs", jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: Partial<Job> }) => {
      return apiRequest("PUT", `/api/jobs/${jobId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setSelectedJob(null);
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    },
  });

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (job.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: InsertJob) => {
    createJobMutation.mutate(data);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    const progress = newStatus === "completed" ? 100 : 
                    newStatus === "in_progress" ? 50 : 0;
    updateJobMutation.mutate({ 
      jobId, 
      updates: { 
        status: newStatus, 
        progress,
        ...(newStatus === "completed" && { completedDate: new Date().toISOString() })
      } 
    });
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
        <h1 className="text-3xl font-bold text-foreground">Jobs Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-job" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a new job to your project management system.
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
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Kitchen Renovation" {...field} data-testid="input-job-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} data-testid="input-client-name" />
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
                          placeholder="Detailed job description..."
                          className="resize-none"
                          {...field}
                          data-testid="input-job-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-client-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Email</FormLabel>
                        <FormControl>
                          <Input placeholder="client@example.com" {...field} data-testid="input-client-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clientAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, State 12345" {...field} data-testid="input-client-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-job-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-job-priority">
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
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000.00" {...field} data-testid="input-total-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Contractor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contractor">
                              <SelectValue placeholder="Select contractor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-due-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes or special instructions..."
                          className="resize-none"
                          {...field}
                          data-testid="input-job-notes"
                        />
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
                    disabled={createJobMutation.isPending}
                    data-testid="button-submit-job"
                  >
                    {createJobMutation.isPending ? "Creating..." : "Create Job"}
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
            placeholder="Search jobs by title, client, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Jobs Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedStatus !== "all" 
              ? "No jobs match your current filters." 
              : "Get started by creating your first job."
            }
          </p>
          {!searchQuery && selectedStatus === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create First Job
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job: Job) => {
            const contractor = contractors.find((c: any) => c.id === job.contractorId);
            return (
              <Card key={job.id} className="border-border bg-card hover:shadow-lg transition-all duration-200" data-testid={`card-job-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-card-foreground text-lg">{job.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {job.clientName}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedJob(job)}
                        data-testid={`button-edit-${job.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteJobMutation.mutate(job.id)}
                        data-testid={`button-delete-${job.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={priorityColors[job.priority as keyof typeof priorityColors]}>
                      {job.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Contractor:</span>
                      <span className="text-card-foreground">
                        {contractor?.name || "Unassigned"}
                      </span>
                    </div>
                    
                    {job.clientAddress && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-card-foreground truncate">{job.clientAddress}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-card-foreground font-medium">
                        ${parseFloat(job.totalAmount).toLocaleString()}
                      </span>
                    </div>

                    {job.dueDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due:</span>
                        <span className="text-card-foreground">
                          {new Date(job.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="text-card-foreground">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select 
                      value={job.status} 
                      onValueChange={(value) => handleStatusChange(job.id, value)}
                    >
                      <SelectTrigger className="text-xs h-8" data-testid={`select-status-${job.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}