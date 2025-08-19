import { 
  type Contractor, 
  type InsertContractor,
  type Job,
  type InsertJob,
  type Payment,
  type InsertPayment,
  type Expense,
  type InsertExpense,
  type Review,
  type InsertReview,
  type Vehicle,
  type InsertVehicle,
  type ClientMessage,
  type InsertClientMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Metrics
  getMetrics(): Promise<{
    activeJobs: number;
    revenue: number;
    contractorsOnline: number;
    reviewScore: number;
  }>;

  // Contractors
  getActiveContractors(): Promise<Array<{
    id: string;
    name: string;
    profileImageUrl?: string;
    currentJob: string;
    eta: string;
    distance: string;
    status: string;
  }>>;

  // Payments
  getRecentPayment(): Promise<{
    id: string;
    amount: number;
    invoiceNumber: string;
    project: string;
    client: string;
    reviewRequestSent: boolean;
  } | null>;

  // Reviews
  getRecentReviews(): Promise<Array<{
    id: string;
    platform: string;
    client: string;
    project: string;
    timeAgo: string;
  }>>;

  // Expenses
  getRecentExpenses(): Promise<Array<{
    id: string;
    vendor: string;
    amount: number;
    category: string;
    jobId?: string;
    status: 'processed' | 'processing' | 'failed';
  }>>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Jobs
  getActiveJobs(): Promise<Array<{
    id: string;
    title: string;
    clientName: string;
    status: string;
    progress: number;
    contractorName: string;
    dueDate: string;
    totalAmount: number;
  }>>;
  createJob(job: InsertJob): Promise<Job>;

  // Analytics
  getRevenueAnalytics(): Promise<{
    months: string[];
    revenue: number[];
    growth: number;
    totalRevenue: number;
    completedJobs: number;
  }>;

  getTeamPerformance(): Promise<Array<{
    id: string;
    name: string;
    profileImageUrl?: string;
    role: string;
    rating: number;
    reviews: number;
    monthlyRevenue: number;
    growthPercentage: number;
    isTopPerformer: boolean;
  }>>;

  // Client communication
  getClientMessages(): Promise<Array<{
    id: string;
    clientName: string;
    jobTitle: string;
    message: string;
    timeAgo: string;
    replied: boolean;
    replyText?: string;
  }>>;
  replyToClientMessage(messageId: string, reply: string): Promise<void>;
  getClientStats(): Promise<{
    responseRate: number;
    averageRating: number;
  }>;

  // Vehicles
  getVehicles(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    make?: string;
    model?: string;
    contractorName?: string;
    status: string;
    location: string;
    distance?: string;
    eta?: string;
  }>>;

  getFleetStats(): Promise<{
    totalVehicles: number;
    currentlyActive: number;
    milesToday: number;
    uptime: number;
  }>;
}

export class MemStorage implements IStorage {
  private contractors: Map<string, Contractor> = new Map();
  private jobs: Map<string, Job> = new Map();
  private payments: Map<string, Payment> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private reviews: Map<string, Review> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private clientMessages: Map<string, ClientMessage> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize contractors
    const contractor1: Contractor = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "(555) 123-4567",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: "4.9",
      totalReviews: 45,
      status: "active",
      currentLatitude: "40.7128",
      currentLongitude: "-74.0060",
      lastLocationUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const contractor2: Contractor = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Sarah Davis",
      email: "sarah@example.com",
      phone: "(555) 234-5678",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: "4.8",
      totalReviews: 32,
      status: "active",
      currentLatitude: "40.7589",
      currentLongitude: "-73.9851",
      lastLocationUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const contractor3: Contractor = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Carlos Martinez",
      email: "carlos@example.com",
      phone: "(555) 345-6789",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: "4.7",
      totalReviews: 28,
      status: "break",
      currentLatitude: "40.7505",
      currentLongitude: "-73.9934",
      lastLocationUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.contractors.set(contractor1.id, contractor1);
    this.contractors.set(contractor2.id, contractor2);
    this.contractors.set(contractor3.id, contractor3);

    // Initialize jobs
    const job1: Job = {
      id: randomUUID(),
      companyId: "company-1",
      contractorId: contractor1.id,
      title: "Kitchen Renovation",
      description: "Complete kitchen remodel",
      clientName: "The Johnson Residence",
      clientAddress: "123 Oak St",
      clientPhone: "(555) 987-6543",
      clientEmail: "johnson@email.com",
      totalAmount: "12500.00",
      paidAmount: "9000.00",
      status: "in_progress",
      progress: 75,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const job2: Job = {
      id: randomUUID(),
      companyId: "company-1",
      contractorId: contractor2.id,
      title: "Bathroom Remodel",
      description: "Master bathroom renovation",
      clientName: "Smith Family Home",
      clientAddress: "456 Pine Ave",
      clientPhone: "(555) 876-5432",
      clientEmail: "smith@email.com",
      totalAmount: "8750.00",
      paidAmount: "2000.00",
      status: "planned",
      progress: 15,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const job3: Job = {
      id: randomUUID(),
      companyId: "company-1",
      contractorId: contractor3.id,
      title: "Deck Installation",
      description: "Outdoor deck construction",
      clientName: "Williams Property",
      clientAddress: "789 Maple Dr",
      clientPhone: "(555) 765-4321",
      clientEmail: "williams@email.com",
      totalAmount: "15200.00",
      paidAmount: "0.00",
      status: "planned",
      progress: 0,
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job1.id, job1);
    this.jobs.set(job2.id, job2);
    this.jobs.set(job3.id, job3);

    // Initialize recent payment
    const payment1: Payment = {
      id: randomUUID(),
      jobId: job1.id,
      amount: "2450.00",
      status: "completed",
      invoiceNumber: "INV-2024-0847",
      paymentMethod: "credit_card",
      paidAt: new Date(Date.now() - 2 * 60 * 1000),
      reviewRequestSent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.payments.set(payment1.id, payment1);

    // Initialize reviews
    const review1: Review = {
      id: randomUUID(),
      jobId: job1.id,
      platform: "google",
      rating: 5,
      reviewText: "Excellent work!",
      clientName: "The Smiths",
      reviewUrl: "https://g.page/r/example-google-review-1",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    };

    const review2: Review = {
      id: randomUUID(),
      jobId: job2.id,
      platform: "facebook",
      rating: 5,
      reviewText: "Great service!",
      clientName: "Mike & Lisa",
      reviewUrl: "https://www.facebook.com/example-review-2",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    };

    this.reviews.set(review1.id, review1);
    this.reviews.set(review2.id, review2);

    // Initialize expenses
    const expense1: Expense = {
      id: randomUUID(),
      jobId: job1.id,
      contractorId: contractor1.id,
      vendor: "Home Depot",
      amount: "127.45",
      category: "Plumbing supplies",
      description: "PVC pipes and fittings",
      receiptUrl: "/objects/receipts/receipt-1.jpg",
      ocrData: { vendor: "Home Depot", amount: "127.45", date: new Date() },
      taxDeductible: true,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expense2: Expense = {
      id: randomUUID(),
      jobId: null,
      contractorId: contractor2.id,
      vendor: "Shell Gas Station",
      amount: "68.90",
      category: "Fuel",
      description: "Vehicle fuel",
      receiptUrl: "/objects/receipts/receipt-2.jpg",
      ocrData: { vendor: "Shell Gas Station", amount: "68.90", date: new Date() },
      taxDeductible: true,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expense3: Expense = {
      id: randomUUID(),
      jobId: job2.id,
      contractorId: contractor3.id,
      vendor: "Harbor Freight",
      amount: "89.99",
      category: "Tool rental",
      description: "Power tools rental",
      receiptUrl: "/objects/receipts/receipt-3.jpg",
      ocrData: { vendor: "Harbor Freight", amount: "89.99", date: new Date() },
      taxDeductible: true,
      processedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.expenses.set(expense1.id, expense1);
    this.expenses.set(expense2.id, expense2);
    this.expenses.set(expense3.id, expense3);

    // Initialize vehicles
    const vehicle1: Vehicle = {
      id: randomUUID(),
      companyId: "company-1",
      contractorId: contractor1.id,
      name: "Truck #001",
      type: "truck",
      make: "Ford",
      model: "F-250",
      year: "2022",
      plateNumber: "FB-T001",
      status: "active",
      currentLatitude: "40.7128",
      currentLongitude: "-74.0060",
      lastLocationUpdate: new Date(),
      mileageToday: "45.2",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vehicle2: Vehicle = {
      id: randomUUID(),
      companyId: "company-1",
      contractorId: contractor2.id,
      name: "Truck #002",
      type: "truck",
      make: "Chevy",
      model: "Silverado",
      year: "2021",
      plateNumber: "FB-T002",
      status: "en_route",
      currentLatitude: "40.7589",
      currentLongitude: "-73.9851",
      lastLocationUpdate: new Date(),
      mileageToday: "32.8",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.vehicles.set(vehicle1.id, vehicle1);
    this.vehicles.set(vehicle2.id, vehicle2);

    // Initialize client messages
    const message1: ClientMessage = {
      id: randomUUID(),
      jobId: job1.id,
      clientName: "Jennifer K.",
      message: "The tile work looks amazing! When will the final touches be completed?",
      replied: false,
      replyText: null,
      repliedAt: null,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    };

    const message2: ClientMessage = {
      id: randomUUID(),
      jobId: job2.id,
      clientName: "Mike & Lisa",
      message: "Thank you for the progress photos! Everything looks perfect.",
      replied: true,
      replyText: "Thank you! We're glad you're happy with the progress.",
      repliedAt: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    };

    this.clientMessages.set(message1.id, message1);
    this.clientMessages.set(message2.id, message2);
  }

  async getMetrics() {
    const activeJobs = Array.from(this.jobs.values()).filter(job => job.status === 'in_progress').length;
    const totalRevenue = Array.from(this.payments.values())
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const contractorsOnline = Array.from(this.contractors.values()).filter(c => c.status === 'active').length;
    const reviewScore = 4.9; // Mock average review score

    return {
      activeJobs,
      revenue: totalRevenue,
      contractorsOnline,
      reviewScore,
    };
  }

  async getActiveContractors() {
    return Array.from(this.contractors.values())
      .filter(contractor => contractor.status === 'active' || contractor.status === 'break')
      .map(contractor => ({
        id: contractor.id,
        name: contractor.name,
        profileImageUrl: contractor.profileImageUrl,
        currentJob: contractor.status === 'active' ? "Plumbing Repair → 123 Oak St" : "Break",
        eta: contractor.status === 'active' ? "ETA: 8 min" : "Break",
        distance: contractor.status === 'active' ? "0.8 miles away" : "1.2 miles away",
        status: contractor.status,
      }));
  }

  async getRecentPayment() {
    const payments = Array.from(this.payments.values())
      .filter(payment => payment.status === 'completed')
      .sort((a, b) => (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0));

    if (payments.length === 0) return null;

    const payment = payments[0];
    const job = this.jobs.get(payment.jobId);

    return {
      id: payment.id,
      amount: parseFloat(payment.amount),
      invoiceNumber: payment.invoiceNumber,
      project: job?.title || "Unknown Project",
      client: job?.clientName || "Unknown Client",
      reviewRequestSent: payment.reviewRequestSent,
    };
  }

  async getRecentReviews() {
    return Array.from(this.reviews.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map(review => {
        const job = this.jobs.get(review.jobId);
        return {
          id: review.id,
          platform: review.platform,
          client: review.clientName || "Unknown Client",
          project: job?.title || "Unknown Project",
          timeAgo: this.getTimeAgo(review.createdAt),
        };
      });
  }

  async getRecentExpenses() {
    return Array.from(this.expenses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map(expense => ({
        id: expense.id,
        vendor: expense.vendor,
        amount: parseFloat(expense.amount),
        category: expense.category,
        jobId: expense.jobId,
        status: expense.processedAt ? 'processed' as const : 'processing' as const,
      }));
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const expense: Expense = {
      id: randomUUID(),
      ...expenseData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.expenses.set(expense.id, expense);
    return expense;
  }

  async getActiveJobs() {
    const contractors = Array.from(this.contractors.values());
    return Array.from(this.jobs.values())
      .filter(job => job.status !== 'completed' && job.status !== 'cancelled')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map(job => {
        const contractor = contractors.find(c => c.id === job.contractorId);
        return {
          id: job.id,
          title: job.title,
          clientName: job.clientName,
          status: job.status,
          progress: job.progress,
          contractorName: contractor ? contractor.name.split(' ')[0] + ' ' + contractor.name.split(' ')[1][0] + '.' : "Unassigned",
          dueDate: job.dueDate?.toISOString() || new Date().toISOString(),
          totalAmount: parseFloat(job.totalAmount),
        };
      });
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const job: Job = {
      id: randomUUID(),
      ...jobData,
      paidAmount: "0.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async getRevenueAnalytics() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenue = [12000, 19000, 15000, 25000, 32000, 47250];
    
    return {
      months,
      revenue,
      growth: 23,
      totalRevenue: 156000,
      completedJobs: 42,
    };
  }

  async getTeamPerformance() {
    return Array.from(this.contractors.values()).map((contractor, index) => ({
      id: contractor.id,
      name: contractor.name,
      profileImageUrl: contractor.profileImageUrl,
      role: "Senior Contractor",
      rating: parseFloat(contractor.rating || "4.8"),
      reviews: contractor.totalReviews,
      monthlyRevenue: index === 0 ? 18450 : index === 1 ? 14200 : 12890,
      growthPercentage: index === 0 ? 15 : index === 1 ? 12 : 8,
      isTopPerformer: index === 0,
    }));
  }

  async getClientMessages() {
    return Array.from(this.clientMessages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(message => {
        const job = this.jobs.get(message.jobId);
        return {
          id: message.id,
          clientName: message.clientName,
          jobTitle: job?.title || "Unknown Job",
          message: message.message,
          timeAgo: this.getTimeAgo(message.createdAt),
          replied: message.replied,
          replyText: message.replyText,
        };
      });
  }

  async replyToClientMessage(messageId: string, reply: string): Promise<void> {
    const message = this.clientMessages.get(messageId);
    if (message) {
      message.replied = true;
      message.replyText = reply;
      message.repliedAt = new Date();
      this.clientMessages.set(messageId, message);
    }
  }

  async getClientStats() {
    return {
      responseRate: 98,
      averageRating: 4.9,
    };
  }

  async getVehicles() {
    const contractors = Array.from(this.contractors.values());
    return Array.from(this.vehicles.values()).map(vehicle => {
      const contractor = contractors.find(c => c.id === vehicle.contractorId);
      return {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        contractorName: contractor?.name,
        status: vehicle.status,
        location: vehicle.status === 'active' ? "123 Oak St • On site" : 
                  vehicle.status === 'en_route' ? "456 Pine Ave" : "Main Office • Available",
        distance: vehicle.status === 'active' ? "0.8 mi away" : 
                  vehicle.status === 'en_route' ? "2.1 mi away" : undefined,
        eta: vehicle.status === 'en_route' ? "15 min" : undefined,
      };
    });
  }

  async getFleetStats() {
    return {
      totalVehicles: 15,
      currentlyActive: 12,
      milesToday: 847,
      uptime: 96,
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hrs ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  }
}

export const storage = new MemStorage();
