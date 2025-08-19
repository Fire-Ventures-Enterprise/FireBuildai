import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Camera, Check, Clock, Plus, Wrench, Fuel, Hammer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Expense {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  jobId?: string;
  status: 'processed' | 'processing' | 'failed';
}

interface Job {
  id: string;
  title: string;
  clientName: string;
  status: string;
  progress: number;
  contractorName: string;
  dueDate: string;
  totalAmount: number;
}

export default function ExpenseOCRSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentExpenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/recent"],
  });

  const { data: activeJobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs/active"],
  });

  const receiptCaptureMutation = useMutation({
    mutationFn: async () => {
      // Simulate receipt capture - in real app would handle file upload
      const response = await apiRequest("POST", "/api/expenses/capture-receipt", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Receipt Captured",
        description: "OCR processing started. Data will be extracted automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
    },
    onError: (error) => {
      toast({
        title: "Capture Failed",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/jobs", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Created",
        description: "New job has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/active"] });
    },
  });

  const handleReceiptCapture = () => {
    receiptCaptureMutation.mutate();
  };

  const handleCreateJob = () => {
    createJobMutation.mutate();
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'materials':
      case 'plumbing supplies':
        return Wrench;
      case 'fuel':
      case 'gas':
        return Fuel;
      case 'tools':
      case 'tool rental':
        return Hammer;
      default:
        return Check;
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="expense-ocr-section">
      {/* Smart Expense Capture (OCR) */}
      <div className="glass-card p-6 rounded-xl" data-testid="expense-ocr-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Smart Expense Capture (OCR)</h3>
          <div className="text-xs bg-fire-orange/20 text-fire-orange px-2 py-1 rounded-full">
            99% Accuracy
          </div>
        </div>
        
        {/* OCR Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center mb-6 hover:border-fire-blue/50 transition-colors" data-testid="receipt-upload-area">
          <div className="w-16 h-16 bg-fire-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="text-fire-blue text-2xl" />
          </div>
          <p className="text-white mb-2 font-medium">Snap a photo of your receipt</p>
          <p className="text-sm text-gray-400 mb-4">AI will extract all data automatically</p>
          <button 
            onClick={handleReceiptCapture}
            disabled={receiptCaptureMutation.isPending}
            className="bg-fire-blue hover:bg-fire-blue/80 text-white px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
            data-testid="button-capture-receipt"
          >
            <Camera className="w-4 h-4 mr-2 inline" />
            {receiptCaptureMutation.isPending ? "Processing..." : "Capture Receipt"}
          </button>
        </div>
        
        {/* Recent OCR Processed Receipts */}
        <div className="space-y-3">
          <h4 className="font-medium text-white text-sm mb-3">Recently Processed</h4>
          
          {expensesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-800/50 rounded-lg">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            recentExpenses?.map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category);
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg" data-testid={`expense-${expense.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${expense.status === 'processed' ? 'bg-fire-success/20' : expense.status === 'processing' ? 'bg-fire-orange/20' : 'bg-red-500/20'} rounded-lg flex items-center justify-center`}>
                      <CategoryIcon className={`${expense.status === 'processed' ? 'text-fire-success' : expense.status === 'processing' ? 'text-fire-orange' : 'text-red-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white" data-testid={`text-expense-vendor-${expense.id}`}>
                        {expense.vendor}
                      </p>
                      <p className="text-xs text-gray-400" data-testid={`text-expense-category-${expense.id}`}>
                        {expense.category}
                        {expense.jobId && ` - Job #${expense.jobId.slice(-6)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white" data-testid={`text-expense-amount-${expense.id}`}>
                      ${expense.amount.toFixed(2)}
                    </p>
                    <p className={`text-xs ${expense.status === 'processed' ? 'text-fire-success' : expense.status === 'processing' ? 'text-yellow-400' : 'text-red-500'}`} data-testid={`text-expense-status-${expense.id}`}>
                      {expense.status === 'processed' && <><Check className="w-3 h-3 inline mr-1" />Processed</>}
                      {expense.status === 'processing' && <><Clock className="w-3 h-3 inline mr-1" />Processing</>}
                      {expense.status === 'failed' && <>Failed</>}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Active Jobs Management */}
      <div className="glass-card p-6 rounded-xl" data-testid="jobs-management-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Active Jobs</h3>
          <button 
            onClick={handleCreateJob}
            disabled={createJobMutation.isPending}
            className="bg-fire-success hover:bg-fire-success/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            data-testid="button-create-job"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            {createJobMutation.isPending ? "Creating..." : "New Job"}
          </button>
        </div>
        
        <div className="space-y-4">
          {jobsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-700 rounded-lg p-4">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-2 bg-gray-700 rounded w-full"></div>
              </div>
            ))
          ) : (
            activeJobs?.map((job) => (
              <div key={job.id} className="border border-gray-700 rounded-lg p-4 hover:border-fire-blue/50 transition-colors" data-testid={`job-${job.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white" data-testid={`text-job-title-${job.id}`}>
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-400" data-testid={`text-job-client-${job.id}`}>
                      {job.clientName}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'in_progress' 
                      ? 'bg-fire-success/20 text-fire-success' 
                      : job.status === 'planned' 
                      ? 'bg-fire-orange/20 text-fire-orange' 
                      : 'bg-gray-600 text-gray-300'
                  }`} data-testid={`text-job-status-${job.id}`}>
                    {job.status.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span data-testid={`text-job-progress-${job.id}`}>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${job.progress > 50 ? 'bg-fire-success' : job.progress > 0 ? 'bg-fire-orange' : 'bg-gray-600'}`}
                      style={{ width: `${job.progress}%` }}
                      data-testid={`progress-bar-${job.id}`}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400" data-testid={`text-job-contractor-${job.id}`}>
                      <i className="fas fa-user mr-1"></i>{job.contractorName}
                    </span>
                    <span className="text-gray-400" data-testid={`text-job-due-date-${job.id}`}>
                      <i className="fas fa-calendar mr-1"></i>Due: {new Date(job.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-white font-medium" data-testid={`text-job-amount-${job.id}`}>
                    ${job.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
