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
  type InsertClientMessage,
  type DocumentTemplate,
  type InsertDocumentTemplate,
  type JobDocument,
  type InsertJobDocument,
  type CompanySettings,
  type InsertCompanySettings,
  type Client,
  type InsertClient,
  type Communication,
  type InsertCommunication
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

  // Company Settings
  getCompanySettings(companyId: string): Promise<CompanySettings>;
  updateCompanySettings(companyId: string, settings: Partial<CompanySettings>): Promise<CompanySettings>;

  // Document Management
  getDocumentTemplates(): Promise<DocumentTemplate[]>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  getJobDocuments(jobId: string): Promise<JobDocument[]>;
  createJobDocument(document: InsertJobDocument): Promise<JobDocument>;
  updateJobDocument(documentId: string, updates: Partial<JobDocument>): Promise<JobDocument>;
  getClientDocuments(jobId: string): Promise<Array<{
    id: string;
    documentName: string;
    documentType: string;
    status: string;
    signedAt?: Date;
    signedBy?: string;
    documentUrl: string;
  }>>;
  getAllClientDocuments(): Promise<any[]>;
  createClientDocument(document: any): Promise<any>;

  // Client Management
  getAllClients(): Promise<Array<{
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
  }>>;
  getClient(clientId: string): Promise<Client | null>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(clientId: string, updates: Partial<Client>): Promise<Client>;
  searchClients(query: string): Promise<Array<{
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
  }>>;
  
  // Client Job History
  getClientJobs(clientId: string): Promise<Array<{
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
  }>>;

  // Client Documents & Invoices
  getClientInvoicesAndEstimates(clientId: string): Promise<Array<{
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
  }>>;

  // Communications
  getClientCommunications(clientId: string): Promise<Communication[]>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  updateCommunication(id: string, updates: Partial<InsertCommunication>): Promise<Communication>;
  deleteCommunication(id: string): Promise<void>;
  getRecentCommunications(): Promise<Communication[]>;
  getRecentCommunications(): Promise<Communication[]>;
}

export class MemStorage implements IStorage {
  private contractors: Map<string, Contractor> = new Map();
  private jobs: Map<string, Job> = new Map();
  private payments: Map<string, Payment> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private reviews: Map<string, Review> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private clientMessages: Map<string, ClientMessage> = new Map();
  private documentTemplates: Map<string, DocumentTemplate> = new Map();
  private jobDocuments: Map<string, JobDocument> = new Map();
  private companySettings: Map<string, CompanySettings> = new Map();
  private clients: Map<string, Client> = new Map();
  private communications: Map<string, Communication> = new Map();

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

    // Initialize job documents with searchable document numbers
    const document1: JobDocument = {
      id: randomUUID(),
      jobId: job1.id,
      templateId: randomUUID(),
      documentType: "invoice",
      documentName: "Kitchen Renovation Invoice",
      documentNumber: "INV-2024-0847",
      status: "sent",
      documentUrl: "/documents/invoice-1.pdf",
      signedAt: null,
      signedBy: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const document2: JobDocument = {
      id: randomUUID(),
      jobId: job1.id,
      templateId: randomUUID(),
      documentType: "estimate",
      documentName: "Kitchen Renovation Estimate",
      documentNumber: "EST-2024-0123",
      status: "signed",
      documentUrl: "/documents/estimate-1.pdf",
      signedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      signedBy: "John Johnson",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const document3: JobDocument = {
      id: randomUUID(),
      jobId: job2.id,
      templateId: randomUUID(),
      documentType: "estimate",
      documentName: "Bathroom Remodel Estimate",
      documentNumber: "EST-2024-0456",
      status: "draft",
      documentUrl: "/documents/estimate-2.pdf",
      signedAt: null,
      signedBy: null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const document4: JobDocument = {
      id: randomUUID(),
      jobId: job3.id,
      templateId: randomUUID(),
      documentType: "invoice",
      documentName: "Deck Installation Invoice",
      documentNumber: "INV-2024-0999",
      status: "draft",
      documentUrl: "/documents/invoice-3.pdf",
      signedAt: null,
      signedBy: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    this.jobDocuments.set(document1.id, document1);
    this.jobDocuments.set(document2.id, document2);
    this.jobDocuments.set(document3.id, document3);
    this.jobDocuments.set(document4.id, document4);

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

    // Initialize company settings
    const defaultCompanySettings: CompanySettings = {
      id: randomUUID(),
      companyId: "company-1",
      companyName: "ABC Contracting Inc.",
      logoUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&h=100&fit=crop",
      address: "123 Construction Way",
      city: "Builderville",
      state: "CA",
      zipCode: "90210",
      phone: "(555) 123-4567",
      email: "contact@abccontracting.com",
      website: "www.abccontracting.com",
      taxNumber: "12-3456789",
      licenseNumber: "LIC-ABC-12345",
      primaryColor: "#1e40af",
      secondaryColor: "#2563eb",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.companySettings.set(defaultCompanySettings.companyId, defaultCompanySettings);

    // Initialize clients based on job data
    const client1: Client = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Johnson Family",
      email: "johnson@email.com",
      phone: "(555) 987-6543",
      secondaryPhone: "(555) 876-5432",
      address: "123 Oak St",
      city: "Builderville",
      state: "CA",
      zipCode: "90210",
      preferredContactMethod: "email",
      notes: "VIP client - Kitchen renovation project. Very satisfied with work quality.",
      tags: ["VIP", "Residential", "Repeat Customer"],
      rating: "4.9",
      totalSpent: "12500.00",
      isActive: true,
      lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const client2: Client = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Smith Family Home",
      email: "smith@email.com",
      phone: "(555) 876-5432",
      secondaryPhone: null,
      address: "456 Pine Ave",
      city: "Builderville",
      state: "CA",
      zipCode: "90211",
      preferredContactMethod: "phone",
      notes: "Master bathroom renovation. Excellent communication throughout project.",
      tags: ["Residential", "Bathroom Specialist"],
      rating: "4.8",
      totalSpent: "8750.00",
      isActive: true,
      lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const client3: Client = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Williams Property",
      email: "williams@email.com",
      phone: "(555) 765-4321",
      secondaryPhone: "(555) 654-3210",
      address: "789 Maple Dr",
      city: "Builderville",
      state: "CA",
      zipCode: "90212",
      preferredContactMethod: "phone",
      notes: "Commercial property owner. Deck installation project planned for next month.",
      tags: ["Commercial", "Property Manager"],
      rating: "0.00",
      totalSpent: "0.00",
      isActive: true,
      lastContactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const client4: Client = {
      id: randomUUID(),
      companyId: "company-1",
      name: "Davis Corporation",
      email: "facility@davis-corp.com",
      phone: "(555) 654-3210",
      secondaryPhone: "(555) 543-2109",
      address: "321 Business Blvd",
      city: "Commerce City",
      state: "CA",
      zipCode: "90213",
      preferredContactMethod: "email",
      notes: "Large commercial client. Multiple ongoing projects including office renovations.",
      tags: ["Commercial", "Multi-Project", "High Value"],
      rating: "4.7",
      totalSpent: "45000.00",
      isActive: true,
      lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    this.clients.set(client1.id, client1);
    this.clients.set(client2.id, client2);
    this.clients.set(client3.id, client3);
    this.clients.set(client4.id, client4);

    // Initialize communications
    const comm1: Communication = {
      id: randomUUID(),
      clientId: client1.id,
      type: "email",
      direction: "outgoing",
      subject: "Project Update - Kitchen Renovation",
      content: "Hi Jennifer, just wanted to update you on the progress. The tile work is progressing beautifully and we're on track to finish by Friday as planned.",
      phoneNumber: null,
      emailAddress: client1.email!,
      duration: null,
      status: "sent",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      readAt: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };

    const comm2: Communication = {
      id: randomUUID(),
      clientId: client1.id,
      type: "sms",
      direction: "incoming",
      subject: null,
      content: "Thanks for the update! Can you send me a photo of the progress?",
      phoneNumber: client1.phone!,
      emailAddress: null,
      duration: null,
      status: "delivered",
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      readAt: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    };

    const comm3: Communication = {
      id: randomUUID(),
      clientId: client1.id,
      type: "call",
      direction: "outgoing",
      subject: null,
      content: "Discussed final details and delivery schedule",
      phoneNumber: client1.phone!,
      emailAddress: null,
      duration: 900, // 15 minutes
      status: "completed",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      readAt: null,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    };

    const comm4: Communication = {
      id: randomUUID(),
      clientId: client2.id,
      type: "email",
      direction: "outgoing",
      subject: "Work Complete - Bathroom Remodel",
      content: "Hi Mike and Lisa, the bathroom remodel is now complete! We'd love to get your feedback and would appreciate a review on Google.",
      phoneNumber: null,
      emailAddress: client2.email!,
      duration: null,
      status: "sent",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      readAt: null,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    };

    const comm5: Communication = {
      id: randomUUID(),
      clientId: client3.id,
      type: "sms",
      direction: "outgoing",
      subject: null,
      content: "Hi Robert, just confirming our appointment tomorrow at 9 AM for the deck repair consultation.",
      phoneNumber: client3.phone!,
      emailAddress: null,
      duration: null,
      status: "delivered",
      sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      readAt: null,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    };

    this.communications.set(comm1.id, comm1);
    this.communications.set(comm2.id, comm2);
    this.communications.set(comm3.id, comm3);
    this.communications.set(comm4.id, comm4);
    this.communications.set(comm5.id, comm5);

    // Update job data to reference clients
    job1.clientName = client1.name;
    job1.clientPhone = client1.phone;
    job1.clientEmail = client1.email;
    job1.clientAddress = `${client1.address}, ${client1.city}, ${client1.state} ${client1.zipCode}`;
    
    job2.clientName = client2.name;
    job2.clientPhone = client2.phone;
    job2.clientEmail = client2.email;
    job2.clientAddress = `${client2.address}, ${client2.city}, ${client2.state} ${client2.zipCode}`;
    
    job3.clientName = client3.name;
    job3.clientPhone = client3.phone;
    job3.clientEmail = client3.email;
    job3.clientAddress = `${client3.address}, ${client3.city}, ${client3.state} ${client3.zipCode}`;

    // Initialize document templates
    const invoiceTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Professional Invoice",
      type: "invoice",
      templateHtml: `
        <div class="document" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid \${primaryColor}; padding-bottom: 20px;">
            <div class="company-info">
              <img src="\${logoUrl}" alt="\${companyName}" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: \${primaryColor}; margin: 0; font-size: 28px;">\${companyName}</h1>
              <p style="margin: 5px 0; color: #666;">\${address}<br>\${city}, \${state} \${zipCode}<br>Phone: \${phone}<br>Email: \${email}<br>Website: \${website}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #888;">License: \${licenseNumber} | Tax ID: \${taxNumber}</p>
            </div>
            <div class="invoice-details" style="text-align: right;">
              <h2 style="color: \${primaryColor}; margin: 0 0 10px 0;">INVOICE</h2>
              <p style="margin: 5px 0;"><strong>Invoice #:</strong> \${invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> \${invoiceDate}</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> \${dueDate}</p>
              <p style="margin: 5px 0;"><strong>Job #:</strong> \${jobNumber}</p>
            </div>
          </div>
          <div class="client-info" style="margin-bottom: 30px;">
            <h3 style="color: \${primaryColor}; margin-bottom: 10px;">Bill To:</h3>
            <p style="margin: 5px 0;"><strong>\${clientName}</strong><br>\${clientAddress}<br>\${clientCity}, \${clientState} \${clientZip}<br>Phone: \${clientPhone}<br>Email: \${clientEmail}</p>
          </div>
          <div class="project-info" style="margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h3 style="color: \${primaryColor}; margin-top: 0;">Project Details:</h3>
            <p style="margin: 5px 0;"><strong>Project:</strong> \${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> \${projectDescription}</p>
            <p style="margin: 5px 0;"><strong>Start Date:</strong> \${startDate}</p>
            <p style="margin: 5px 0;"><strong>Completion Date:</strong> \${completionDate}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: \${primaryColor}; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Rate</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody>
              \${lineItems}
            </tbody>
          </table>
          <div class="totals" style="float: right; width: 300px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td><td style="padding: 8px; text-align: right;">$\${subtotal}</td></tr>
              <tr><td style="padding: 8px; text-align: right;"><strong>Tax (\${taxRate}%):</strong></td><td style="padding: 8px; text-align: right;">$\${taxAmount}</td></tr>
              <tr style="border-top: 2px solid \${primaryColor}; background: #f8f9fa;"><td style="padding: 12px; text-align: right; font-size: 18px;"><strong>Total:</strong></td><td style="padding: 12px; text-align: right; font-size: 18px; color: \${primaryColor};"><strong>$\${totalAmount}</strong></td></tr>
            </table>
          </div>
          <div style="clear: both; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h4 style="color: \${primaryColor};">Payment Terms:</h4>
            <p>Payment is due within 30 days of invoice date. Late payments may incur additional fees.</p>
            <p><strong>Payment Methods:</strong> Check, Bank Transfer, Credit Card</p>
            <p><strong>Questions?</strong> Contact us at \${phone} or \${email}</p>
          </div>
        </div>
      `,
      requiredFields: ["invoiceNumber", "invoiceDate", "dueDate", "jobNumber", "clientName", "clientAddress", "projectTitle", "lineItems", "subtotal", "taxRate", "taxAmount", "totalAmount"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const estimateTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Professional Estimate",
      type: "estimate",
      templateHtml: `
        <div class="document" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid \${primaryColor}; padding-bottom: 20px;">
            <div class="company-info">
              <img src="\${logoUrl}" alt="\${companyName}" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: \${primaryColor}; margin: 0; font-size: 28px;">\${companyName}</h1>
              <p style="margin: 5px 0; color: #666;">\${address}<br>\${city}, \${state} \${zipCode}<br>Phone: \${phone}<br>Email: \${email}<br>Website: \${website}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #888;">License: \${licenseNumber} | Tax ID: \${taxNumber}</p>
            </div>
            <div class="estimate-details" style="text-align: right;">
              <h2 style="color: \${primaryColor}; margin: 0 0 10px 0;">ESTIMATE</h2>
              <p style="margin: 5px 0;"><strong>Estimate #:</strong> \${estimateNumber}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> \${estimateDate}</p>
              <p style="margin: 5px 0;"><strong>Valid Until:</strong> \${validUntil}</p>
            </div>
          </div>
          <div class="client-info" style="margin-bottom: 30px;">
            <h3 style="color: \${primaryColor}; margin-bottom: 10px;">Prepared For:</h3>
            <p style="margin: 5px 0;"><strong>\${clientName}</strong><br>\${clientAddress}<br>\${clientCity}, \${clientState} \${clientZip}<br>Phone: \${clientPhone}<br>Email: \${clientEmail}</p>
          </div>
          <div class="project-info" style="margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h3 style="color: \${primaryColor}; margin-top: 0;">Project Information:</h3>
            <p style="margin: 5px 0;"><strong>Project:</strong> \${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> \${projectDescription}</p>
            <p style="margin: 5px 0;"><strong>Estimated Start:</strong> \${estimatedStart}</p>
            <p style="margin: 5px 0;"><strong>Estimated Duration:</strong> \${estimatedDuration}</p>
          </div>
          <h3 style="color: \${primaryColor};">Scope of Work:</h3>
          <div style="margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            \${scopeOfWork}
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: \${primaryColor}; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Rate</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody>
              \${lineItems}
            </tbody>
          </table>
          <div class="totals" style="float: right; width: 300px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td><td style="padding: 8px; text-align: right;">$\${subtotal}</td></tr>
              <tr><td style="padding: 8px; text-align: right;"><strong>Tax (\${taxRate}%):</strong></td><td style="padding: 8px; text-align: right;">$\${taxAmount}</td></tr>
              <tr style="border-top: 2px solid \${primaryColor}; background: #f8f9fa;"><td style="padding: 12px; text-align: right; font-size: 18px;"><strong>Total Estimate:</strong></td><td style="padding: 12px; text-align: right; font-size: 18px; color: \${primaryColor};"><strong>$\${totalAmount}</strong></td></tr>
            </table>
          </div>
          <div style="clear: both; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h4 style="color: \${primaryColor};">Terms & Conditions:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This estimate is valid for 30 days from the date above</li>
              <li>50% deposit required to begin work</li>
              <li>Final pricing may vary based on actual conditions encountered</li>
              <li>All work will be performed according to local building codes</li>
              <li>Customer is responsible for permits unless otherwise specified</li>
            </ul>
            <p style="margin-top: 20px;"><strong>Questions?</strong> Contact us at \${phone} or \${email}</p>
          </div>
        </div>
      `,
      requiredFields: ["estimateNumber", "estimateDate", "validUntil", "clientName", "clientAddress", "projectTitle", "scopeOfWork", "lineItems", "subtotal", "taxRate", "taxAmount", "totalAmount"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stopWorkTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Stop Work Order",
      type: "stop_work",
      templateHtml: `
        <div class="document" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #dc2626; padding-bottom: 20px;">
            <div class="company-info">
              <img src="\${logoUrl}" alt="\${companyName}" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: \${primaryColor}; margin: 0; font-size: 28px;">\${companyName}</h1>
              <p style="margin: 5px 0; color: #666;">\${address}<br>\${city}, \${state} \${zipCode}<br>Phone: \${phone}<br>Email: \${email}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #888;">License: \${licenseNumber}</p>
            </div>
            <div class="notice-details" style="text-align: right;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 32px;">STOP WORK ORDER</h2>
              <p style="margin: 5px 0; background: #fee2e2; padding: 8px; border-radius: 4px;"><strong>Order #:</strong> \${orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Date Issued:</strong> \${dateIssued}</p>
            </div>
          </div>
          <div class="client-info" style="margin-bottom: 30px; background: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin-bottom: 10px;">Project Information:</h3>
            <p style="margin: 5px 0;"><strong>Client:</strong> \${clientName}</p>
            <p style="margin: 5px 0;"><strong>Project:</strong> \${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> \${projectAddress}</p>
            <p style="margin: 5px 0;"><strong>Job #:</strong> \${jobNumber}</p>
          </div>
          <div class="notice-content" style="margin-bottom: 30px; padding: 20px; border: 2px solid #dc2626; border-radius: 5px; background: #fef2f2;">
            <h3 style="color: #dc2626; margin-top: 0;">NOTICE TO STOP WORK</h3>
            <p style="font-size: 16px; line-height: 1.6;"><strong>You are hereby notified to stop all work on the above-mentioned project immediately.</strong></p>
            <div style="margin: 20px 0;">
              <h4 style="color: #dc2626;">Reason for Stop Work Order:</h4>
              <p style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #fecaca;">\${reason}</p>
            </div>
            <div style="margin: 20px 0;">
              <h4 style="color: #dc2626;">Required Actions:</h4>
              <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #fecaca;">\${requiredActions}</div>
            </div>
          </div>
          <div class="signatures" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 45%;">
                <h4 style="color: \${primaryColor};">Contractor Acknowledgment:</h4>
                <p style="margin-bottom: 40px;">I acknowledge receipt of this Stop Work Order and understand that all work must cease immediately.</p>
                <div style="border-top: 1px solid #333; width: 200px; margin-top: 20px; padding-top: 5px;">
                  <p style="margin: 0; font-size: 12px;">Contractor Signature / Date</p>
                </div>
              </div>
              <div style="width: 45%;">
                <h4 style="color: \${primaryColor};">Issued By:</h4>
                <p style="margin: 5px 0;"><strong>\${issuedBy}</strong></p>
                <p style="margin: 5px 0;">\${issuedByTitle}</p>
                <div style="border-top: 1px solid #333; width: 200px; margin-top: 40px; padding-top: 5px;">
                  <p style="margin: 0; font-size: 12px;">Signature / Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      requiredFields: ["orderNumber", "dateIssued", "clientName", "projectTitle", "projectAddress", "jobNumber", "reason", "requiredActions", "issuedBy", "issuedByTitle"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const workOrderTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Work Order",
      type: "work_order",
      templateHtml: `
        <div class="document" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid \${primaryColor}; padding-bottom: 20px;">
            <div class="company-info">
              <img src="\${logoUrl}" alt="\${companyName}" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: \${primaryColor}; margin: 0; font-size: 28px;">\${companyName}</h1>
              <p style="margin: 5px 0; color: #666;">\${address}<br>\${city}, \${state} \${zipCode}<br>Phone: \${phone}<br>Email: \${email}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #888;">License: \${licenseNumber}</p>
            </div>
            <div class="work-order-details" style="text-align: right;">
              <h2 style="color: \${primaryColor}; margin: 0 0 10px 0;">WORK ORDER</h2>
              <p style="margin: 5px 0;"><strong>Work Order #:</strong> \${workOrderNumber}</p>
              <p style="margin: 5px 0;"><strong>Date Issued:</strong> \${dateIssued}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="background: \${priorityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">\${priority}</span></p>
            </div>
          </div>
          <div class="assignment-info" style="margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid \${primaryColor};">
            <h3 style="color: \${primaryColor}; margin-top: 0;">Assignment Details:</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                <p style="margin: 5px 0;"><strong>Assigned To:</strong> \${assignedContractor}</p>
                <p style="margin: 5px 0;"><strong>Supervisor:</strong> \${supervisor}</p>
                <p style="margin: 5px 0;"><strong>Job Site:</strong> \${jobSite}</p>
              </div>
              <div style="width: 48%;">
                <p style="margin: 5px 0;"><strong>Start Date:</strong> \${startDate}</p>
                <p style="margin: 5px 0;"><strong>Expected Completion:</strong> \${expectedCompletion}</p>
                <p style="margin: 5px 0;"><strong>Estimated Hours:</strong> \${estimatedHours}</p>
              </div>
            </div>
          </div>
          <div class="work-description" style="margin-bottom: 30px;">
            <h3 style="color: \${primaryColor}; margin-bottom: 10px;">Work Description:</h3>
            <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              \${workDescription}
            </div>
          </div>
          <div class="materials-tools" style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                <h4 style="color: \${primaryColor};">Materials Required:</h4>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                  \${materialsRequired}
                </div>
              </div>
              <div style="width: 48%;">
                <h4 style="color: \${primaryColor};">Tools Required:</h4>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                  \${toolsRequired}
                </div>
              </div>
            </div>
          </div>
          <div class="safety-notes" style="margin-bottom: 30px; background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Safety Requirements & Special Instructions:</h4>
            <div>\${safetyInstructions}</div>
          </div>
          <div class="sign-off" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 30%;">
                <h4 style="color: \${primaryColor};">Issued By:</h4>
                <p style="margin: 5px 0;">\${issuedBy}</p>
                <div style="border-top: 1px solid #333; width: 150px; margin-top: 30px; padding-top: 5px;">
                  <p style="margin: 0; font-size: 12px;">Supervisor Signature / Date</p>
                </div>
              </div>
              <div style="width: 30%;">
                <h4 style="color: \${primaryColor};">Accepted By:</h4>
                <p style="margin: 5px 0;">\${assignedContractor}</p>
                <div style="border-top: 1px solid #333; width: 150px; margin-top: 30px; padding-top: 5px;">
                  <p style="margin: 0; font-size: 12px;">Worker Signature / Date</p>
                </div>
              </div>
              <div style="width: 30%;">
                <h4 style="color: \${primaryColor};">Completed:</h4>
                <p style="margin: 5px 0;">____/____/____</p>
                <div style="border-top: 1px solid #333; width: 150px; margin-top: 30px; padding-top: 5px;">
                  <p style="margin: 0; font-size: 12px;">Completion Signature / Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      requiredFields: ["workOrderNumber", "dateIssued", "priority", "assignedContractor", "supervisor", "jobSite", "startDate", "expectedCompletion", "estimatedHours", "workDescription", "materialsRequired", "toolsRequired", "safetyInstructions", "issuedBy"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collectionTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Collection Notice",
      type: "collection",
      templateHtml: `
        <div class="document" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #dc2626; padding-bottom: 20px;">
            <div class="company-info">
              <img src="\${logoUrl}" alt="\${companyName}" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: \${primaryColor}; margin: 0; font-size: 28px;">\${companyName}</h1>
              <p style="margin: 5px 0; color: #666;">\${address}<br>\${city}, \${state} \${zipCode}<br>Phone: \${phone}<br>Email: \${email}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #888;">License: \${licenseNumber}</p>
            </div>
            <div class="notice-details" style="text-align: right;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 28px;">COLLECTION NOTICE</h2>
              <p style="margin: 5px 0; background: #fee2e2; padding: 8px; border-radius: 4px;"><strong>Notice #:</strong> \${noticeNumber}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> \${noticeDate}</p>
            </div>
          </div>
          <div class="client-info" style="margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin-bottom: 10px;">Account Information:</h3>
            <p style="margin: 5px 0;"><strong>Account Holder:</strong> \${clientName}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> \${clientAddress}</p>
            <p style="margin: 5px 0;"><strong>Account #:</strong> \${accountNumber}</p>
          </div>
          <div class="invoice-details" style="margin-bottom: 30px; background: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin-top: 0;">Outstanding Invoice Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Invoice #:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">\${invoiceNumber}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">\${dueDate}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Days Overdue:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #dc2626; font-weight: bold;">\${daysOverdue}</td></tr>
              <tr style="background: #fee2e2;"><td style="padding: 12px; font-size: 18px;"><strong>Amount Due:</strong></td><td style="padding: 12px; font-size: 18px; color: #dc2626; font-weight: bold;">$\${amountDue}</td></tr>
            </table>
          </div>
          <div class="notice-content" style="margin-bottom: 30px; padding: 20px; border: 2px solid #dc2626; border-radius: 5px; background: #fef2f2;">
            <h3 style="color: #dc2626; margin-top: 0;">PAYMENT DEMAND NOTICE</h3>
            <p style="font-size: 16px; line-height: 1.6;">This is a formal notice that your account is \${daysOverdue} days past due. Immediate payment is required to avoid further collection actions.</p>
            <h4 style="color: #dc2626; margin-top: 20px;">Payment Options:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Phone:</strong> Call \${phone} to pay by credit card</li>
              <li><strong>Mail:</strong> Send check to \${address}, \${city}, \${state} \${zipCode}</li>
              <li><strong>In Person:</strong> Visit our office during business hours</li>
            </ul>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h4 style="color: \${primaryColor};">Questions or Concerns?</h4>
            <p>Contact us immediately at \${phone} or \${email}.</p>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">This is an attempt to collect a debt. Any information obtained will be used for that purpose.</p>
          </div>
        </div>
      `,
      requiredFields: ["noticeNumber", "noticeDate", "clientName", "clientAddress", "accountNumber", "invoiceNumber", "dueDate", "daysOverdue", "amountDue"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const scopeTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Scope of Work",
      type: "scope",
      templateHtml: `
        <div class="document">
          <h1>SCOPE OF WORK</h1>
          <p><strong>Project:</strong> \${projectName}</p>
          <p><strong>Client:</strong> \${clientName}</p>
          <p><strong>Project Description:</strong> \${projectDescription}</p>
          <p><strong>Deliverables:</strong> \${deliverables}</p>
          <p><strong>Timeline:</strong> \${timeline}</p>
          <p><strong>Total Cost:</strong> $\${totalCost}</p>
          <p><strong>Client Signature:</strong> ______________________</p>
          <p><strong>Contractor Signature:</strong> ______________________</p>
        </div>
      `,
      requiredFields: ["projectName", "clientName", "projectDescription", "deliverables", "timeline", "totalCost"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const jobAddonTemplate: DocumentTemplate = {
      id: randomUUID(),
      name: "Job Add-on Request",
      type: "job_addon",
      templateHtml: `
        <div class="document">
          <h1>JOB ADD-ON REQUEST</h1>
          <p><strong>Original Job:</strong> \${originalJobTitle}</p>
          <p><strong>Add-on Description:</strong> \${addonDescription}</p>
          <p><strong>Additional Cost:</strong> $\${additionalCost}</p>
          <p><strong>Estimated Time:</strong> \${estimatedTime}</p>
          <p><strong>Materials Required:</strong> \${materialsRequired}</p>
          <p>Client approval required for this additional work.</p>
          <p><strong>Client Signature:</strong> ______________________</p>
          <p><strong>Date:</strong> \${date}</p>
        </div>
      `,
      requiredFields: ["originalJobTitle", "addonDescription", "additionalCost", "estimatedTime"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.documentTemplates.set(invoiceTemplate.id, invoiceTemplate);
    this.documentTemplates.set(estimateTemplate.id, estimateTemplate);

    // Initialize some job documents for clients
    const jobDoc1: JobDocument = {
      id: randomUUID(),
      jobId: job1.id,
      templateId: invoiceTemplate.id,
      documentName: `Invoice #INV-2024-001 - ${job1.title}`,
      documentType: 'invoice',
      documentUrl: '/documents/invoice-001.pdf',
      status: 'completed',
      signedBy: 'Johnson Family',
      signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isClientVisible: true,
      formData: { invoiceNumber: 'INV-2024-001', amount: 12500 },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const jobDoc2: JobDocument = {
      id: randomUUID(),
      jobId: job2.id,
      templateId: estimateTemplate.id,
      documentName: `Estimate #EST-2024-002 - ${job2.title}`,
      documentType: 'estimate',
      documentUrl: '/documents/estimate-002.pdf',
      status: 'sent',
      signedBy: null,
      signedAt: null,
      isClientVisible: true,
      formData: { estimateNumber: 'EST-2024-002', amount: 8750 },
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const jobDoc3: JobDocument = {
      id: randomUUID(),
      jobId: job3.id,
      templateId: estimateTemplate.id,
      documentName: `Estimate #EST-2024-003 - ${job3.title}`,
      documentType: 'estimate',
      documentUrl: '/documents/estimate-003.pdf',
      status: 'draft',
      signedBy: null,
      signedAt: null,
      isClientVisible: true,
      formData: { estimateNumber: 'EST-2024-003', amount: 15200 },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    const jobDoc4: JobDocument = {
      id: randomUUID(),
      jobId: job1.id,
      templateId: invoiceTemplate.id,
      documentName: `Work Order #WO-2024-001 - ${job1.title}`,
      documentType: 'work_order',
      documentUrl: '/documents/work-order-001.pdf',
      status: 'completed',
      signedBy: 'Johnson Family',
      signedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      isClientVisible: true,
      formData: { workOrderNumber: 'WO-2024-001' },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    this.jobDocuments.set(jobDoc1.id, jobDoc1);
    this.jobDocuments.set(jobDoc2.id, jobDoc2);
    this.jobDocuments.set(jobDoc3.id, jobDoc3);
    this.jobDocuments.set(jobDoc4.id, jobDoc4);
    this.documentTemplates.set(stopWorkTemplate.id, stopWorkTemplate);
    this.documentTemplates.set(workOrderTemplate.id, workOrderTemplate);
    this.documentTemplates.set(collectionTemplate.id, collectionTemplate);
    this.documentTemplates.set(scopeTemplate.id, scopeTemplate);
    this.documentTemplates.set(jobAddonTemplate.id, jobAddonTemplate);

    // Initialize some sample job documents
    const sampleDocument1: JobDocument = {
      id: randomUUID(),
      jobId: job1.id,
      templateId: scopeTemplate.id,
      documentName: "Kitchen Renovation Scope",
      documentType: "scope",
      documentUrl: "/objects/documents/scope-kitchen-renovation.pdf",
      status: "signed",
      signedBy: "The Johnson Residence",
      signedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      isClientVisible: true,
      formData: {
        projectName: "Kitchen Renovation",
        clientName: "The Johnson Residence",
        projectDescription: "Complete kitchen remodel including cabinets, countertops, and appliances",
        deliverables: "New cabinets, granite countertops, stainless steel appliances",
        timeline: "4-6 weeks",
        totalCost: "12500.00"
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    };

    const sampleDocument2: JobDocument = {
      id: randomUUID(),
      jobId: job2.id,
      templateId: workOrderTemplate.id,
      documentName: "Plumbing Work Order",
      documentType: "work_order",
      documentUrl: "/objects/documents/work-order-plumbing.pdf",
      status: "completed",
      signedBy: "Mike Johnson",
      signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isClientVisible: false,
      formData: {
        workOrderNumber: "WO-2024-001",
        jobTitle: "Bathroom Remodel",
        contractorName: "Mike Johnson",
        workDescription: "Install new plumbing fixtures and update water lines"
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };

    this.jobDocuments.set(sampleDocument1.id, sampleDocument1);
    this.jobDocuments.set(sampleDocument2.id, sampleDocument2);
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

  // Company Settings methods
  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    const settings = this.companySettings.get(companyId);
    if (!settings) {
      throw new Error(`Company settings not found for company ${companyId}`);
    }
    return settings;
  }

  async updateCompanySettings(companyId: string, updates: Partial<CompanySettings>): Promise<CompanySettings> {
    const existing = this.companySettings.get(companyId);
    if (!existing) {
      throw new Error(`Company settings not found for company ${companyId}`);
    }
    
    const updated: CompanySettings = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.companySettings.set(companyId, updated);
    return updated;
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

  // Document Management Methods
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values())
      .filter(template => template.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documentTemplates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async getJobDocuments(jobId: string): Promise<JobDocument[]> {
    return Array.from(this.jobDocuments.values())
      .filter(doc => doc.jobId === jobId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createJobDocument(document: InsertJobDocument): Promise<JobDocument> {
    const newDocument: JobDocument = {
      ...document,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobDocuments.set(newDocument.id, newDocument);
    return newDocument;
  }

  async updateJobDocument(documentId: string, updates: Partial<JobDocument>): Promise<JobDocument> {
    const existingDocument = this.jobDocuments.get(documentId);
    if (!existingDocument) {
      throw new Error("Document not found");
    }

    const updatedDocument: JobDocument = {
      ...existingDocument,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.jobDocuments.set(documentId, updatedDocument);
    return updatedDocument;
  }

  async getClientDocuments(jobId: string): Promise<Array<{
    id: string;
    documentName: string;
    documentType: string;
    status: string;
    signedAt?: Date;
    signedBy?: string;
    documentUrl: string;
  }>> {
    return Array.from(this.jobDocuments.values())
      .filter(doc => doc.jobId === jobId && doc.isClientVisible)
      .map(doc => ({
        id: doc.id,
        documentName: doc.documentName,
        documentType: doc.documentType,
        status: doc.status,
        signedAt: doc.signedAt || undefined,
        signedBy: doc.signedBy || undefined,
        documentUrl: doc.documentUrl,
      }))
      .sort((a, b) => {
        const aTime = a.signedAt?.getTime() || 0;
        const bTime = b.signedAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  async getAllClientDocuments(): Promise<any[]> {
    return Array.from(this.jobDocuments.values())
      .filter(doc => doc.isClientVisible)
      .map(doc => ({
        id: doc.id,
        templateId: doc.templateId,
        clientId: doc.clientId || "client-1",
        jobId: doc.jobId,
        documentData: doc.documentData,
        status: doc.status,
        documentUrl: doc.documentUrl,
        signedAt: doc.signedAt,
        signedBy: doc.signedBy,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createClientDocument(document: any): Promise<any> {
    const newDocument = {
      ...document,
      id: randomUUID(),
      isClientVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      documentUrl: `https://example.com/documents/${randomUUID()}.pdf`,
    };
    
    this.jobDocuments.set(newDocument.id, newDocument);
    return newDocument;
  }

  // Client Management Methods
  async getAllClients(): Promise<Array<{
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
  }>> {
    const clients = Array.from(this.clients.values());
    const jobs = Array.from(this.jobs.values());
    
    return clients.map(client => {
      const clientJobs = jobs.filter(job => job.clientName === client.name);
      const completedJobs = clientJobs.filter(job => job.status === 'completed');
      const activeJobs = clientJobs.filter(job => job.status === 'in_progress' || job.status === 'planned');
      const lastJob = clientJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      return {
        id: client.id,
        name: client.name,
        email: client.email || undefined,
        phone: client.phone || undefined,
        secondaryPhone: client.secondaryPhone || undefined,
        address: client.address || undefined,
        city: client.city || undefined,
        state: client.state || undefined,
        zipCode: client.zipCode || undefined,
        totalSpent: parseFloat(client.totalSpent),
        rating: parseFloat(client.rating),
        isActive: client.isActive,
        lastContactDate: client.lastContactDate || undefined,
        tags: client.tags as string[] || [],
        preferredContactMethod: client.preferredContactMethod,
        notes: client.notes || undefined,
        jobsCount: clientJobs.length,
        totalJobs: clientJobs.length,
        completedJobs: completedJobs.length,
        activeJobs: activeJobs.length,
        lastJobDate: lastJob?.createdAt || undefined,
        createdAt: client.createdAt,
      };
    }).sort((a, b) => b.lastContactDate?.getTime() - a.lastContactDate?.getTime() || b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClient(clientId: string): Promise<Client | null> {
    return this.clients.get(clientId) || null;
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const client: Client = {
      id: randomUUID(),
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.set(client.id, client);
    return client;
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    const existingClient = this.clients.get(clientId);
    if (!existingClient) {
      throw new Error("Client not found");
    }

    const updatedClient: Client = {
      ...existingClient,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.clients.set(clientId, updatedClient);
    return updatedClient;
  }

  async getClientJobs(clientId: string): Promise<Array<{
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
  }>> {
    const client = this.clients.get(clientId);
    if (!client) return [];

    const jobs = Array.from(this.jobs.values())
      .filter(job => job.clientName === client.name)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const contractors = Array.from(this.contractors.values());

    return jobs.map(job => {
      const contractor = contractors.find(c => c.id === job.contractorId);
      return {
        id: job.id,
        title: job.title,
        description: job.description || undefined,
        totalAmount: parseFloat(job.totalAmount),
        paidAmount: parseFloat(job.paidAmount),
        status: job.status,
        progress: job.progress,
        startDate: job.startDate || undefined,
        dueDate: job.dueDate || undefined,
        completedDate: job.completedDate || undefined,
        contractorName: contractor?.name || undefined,
        createdAt: job.createdAt,
      };
    });
  }

  async searchClients(query: string): Promise<Array<{
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
  }>> {
    const searchTerm = query.toLowerCase();
    const allClients = await this.getAllClients();
    
    // First, search by client data (name, email, phone, address, etc.)
    const clientMatches = allClients.filter(client => {
      return (
        client.name.toLowerCase().includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm) ||
        client.phone?.includes(searchTerm) ||
        client.secondaryPhone?.includes(searchTerm) ||
        client.address?.toLowerCase().includes(searchTerm) ||
        client.city?.toLowerCase().includes(searchTerm) ||
        client.state?.toLowerCase().includes(searchTerm) ||
        client.zipCode?.includes(searchTerm) ||
        client.notes?.toLowerCase().includes(searchTerm) ||
        client.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    });

    // Then search by document numbers (invoice/estimate numbers)
    const clientIds = new Set(clientMatches.map(c => c.id));
    
    // Check all job documents for matching document numbers
    const allJobDocuments = Array.from(this.jobDocuments.values());
    const documentMatches = allJobDocuments.filter(doc => 
      doc.documentNumber?.toLowerCase().includes(searchTerm)
    );
    
    // Find clients who have jobs with matching document numbers
    const jobsWithDocuments = Array.from(this.jobs.values()).filter(job => 
      documentMatches.some(doc => doc.jobId === job.id)
    );
    
    jobsWithDocuments.forEach(job => {
      const client = Array.from(this.clients.values()).find(c => c.name === job.clientName);
      if (client) {
        clientIds.add(client.id);
      }
    });

    // Return all matching clients
    return allClients.filter(client => clientIds.has(client.id));
  }

  async getClientInvoicesAndEstimates(clientId: string): Promise<Array<{
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
  }>> {
    const client = this.clients.get(clientId);
    if (!client) return [];

    const jobs = Array.from(this.jobs.values())
      .filter(job => job.clientName === client.name);
    
    const jobIds = jobs.map(job => job.id);
    const documents = Array.from(this.jobDocuments.values())
      .filter(doc => jobIds.includes(doc.jobId) && 
        ['invoice', 'estimate', 'contract', 'work_order'].includes(doc.documentType))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return documents.map(doc => {
      const job = jobs.find(j => j.id === doc.jobId);
      return {
        id: doc.id,
        jobId: doc.jobId,
        jobTitle: job?.title || 'Unknown Job',
        documentType: doc.documentType as 'invoice' | 'estimate' | 'contract' | 'work_order',
        documentName: doc.documentName,
        amount: job ? parseFloat(job.totalAmount) : undefined,
        status: doc.status,
        createdAt: doc.createdAt,
        signedAt: doc.signedAt || undefined,
        documentUrl: doc.documentUrl,
      };
    });
  }

  // Communication methods
  async getClientCommunications(clientId: string): Promise<Communication[]> {
    return Array.from(this.communications.values())
      .filter(comm => comm.clientId === clientId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async createCommunication(communication: InsertCommunication): Promise<Communication> {
    const id = randomUUID();
    const newCommunication: Communication = {
      id,
      ...communication,
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.communications.set(id, newCommunication);
    return newCommunication;
  }

  async updateCommunication(id: string, updates: Partial<InsertCommunication>): Promise<Communication> {
    const communication = this.communications.get(id);
    if (!communication) {
      throw new Error(`Communication with id ${id} not found`);
    }
    
    const updatedCommunication: Communication = {
      ...communication,
      ...updates,
      updatedAt: new Date(),
    };
    this.communications.set(id, updatedCommunication);
    return updatedCommunication;
  }

  async deleteCommunication(id: string): Promise<void> {
    this.communications.delete(id);
  }

  async getRecentCommunications(): Promise<Communication[]> {
    return Array.from(this.communications.values())
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, 20); // Return latest 20 communications
  }
}

export const storage = new MemStorage();
