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
  type InsertCommunication,
  type ClientPhoto,
  type InsertClientPhoto,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type Quote,
  type InsertQuote,
  type PoLineItem,
  type InsertPoLineItem,
  type VerificationCode,
  type InsertVerificationCode,
  type User,
  type InsertUser,
  type UserSession,
  type InsertUserSession,
  type ContractorInvoice,
  type InsertContractorInvoice,
  type ApPaymentCalendar,
  type InsertApPaymentCalendar,
  contractors,
  jobs,
  payments,
  expenses,
  reviews,
  vehicles,
  clientMessages,
  documentTemplates,
  jobDocuments,
  companySettings,
  clients,
  communications,
  clientPhotos,
  purchaseOrders,
  quotes,
  poLineItems,
  verificationCodes,
  users,
  userSessions,
  companies,
  contractorInvoices,
  apPaymentCalendar,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count, sum, like, or, and } from "drizzle-orm";
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
  getAllJobs(): Promise<Job[]>;
  getJob(jobId: string): Promise<Job | null>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(jobId: string, updates: Partial<Job>): Promise<Job>;
  deleteJob(jobId: string): Promise<void>;

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

  // Client Photos
  getClientPhotos(clientId: string): Promise<ClientPhoto[]>;
  createClientPhoto(photo: InsertClientPhoto): Promise<ClientPhoto>;
  deleteClientPhoto(photoId: string): Promise<void>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrderStatus(poId: string, status: string): Promise<PurchaseOrder>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuoteStatus(quoteId: string, status: string): Promise<Quote>;

  // Verification Methods
  createVerificationCode(verificationCode: InsertVerificationCode): Promise<VerificationCode>;
  getValidVerificationCode(email: string | null, phone: string | null, code: string, type: 'email' | 'sms', purpose: 'registration' | 'password_reset'): Promise<VerificationCode | null>;
  markVerificationCodeAsUsed(id: string): Promise<void>;
  markEmailAsVerified(email: string): Promise<void>;
  markPhoneAsVerified(phone: string): Promise<void>;
  activateUser(userId: string): Promise<void>;

  // User Authentication & Management
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;

  // User Session Management
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | null>;
  deleteUserSession(sessionToken: string): Promise<void>;
  deleteAllUserSessions(userId: string): Promise<void>;

  // User Management
  createUser(user: InsertUser): Promise<User>;
  getUserById(userId: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  updateUserVerificationStatus(userId: string, emailVerified?: boolean, phoneVerified?: boolean): Promise<void>;
  updateUserLastLogin(userId: string): Promise<void>;

  // Session Management
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | null>;
  deleteUserSession(sessionToken: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  deleteAllUserSessions(userId: string): Promise<void>;

  // Contractor Invoices (AP)
  createContractorInvoice(invoice: InsertContractorInvoice): Promise<ContractorInvoice>;
  getContractorInvoices(): Promise<ContractorInvoice[]>;
  getContractorInvoice(id: string): Promise<ContractorInvoice | undefined>;
  updateContractorInvoice(id: string, updates: Partial<InsertContractorInvoice>): Promise<ContractorInvoice>;
  deleteContractorInvoice(id: string): Promise<void>;

  // AP Payment Calendar
  createApPaymentEntry(entry: InsertApPaymentCalendar): Promise<ApPaymentCalendar>;
  getApPaymentCalendar(): Promise<ApPaymentCalendar[]>;
  getUpcomingPayments(days?: number): Promise<ApPaymentCalendar[]>;
  getOverduePayments(): Promise<ApPaymentCalendar[]>;
  updateApPaymentEntry(id: string, updates: Partial<InsertApPaymentCalendar>): Promise<ApPaymentCalendar>;
  markPaymentPaid(id: string, paymentDate: Date): Promise<ApPaymentCalendar>;

  // Invoice methods for Stripe/PayPal payments
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  getInvoices(): Promise<Invoice[]>;
  deleteInvoice(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private defaultCompanyId = "company-1"; // For demo purposes

  constructor() {
    this.ensureDefaultCompany();
  }

  private async ensureDefaultCompany() {
    try {
      const [existingCompany] = await db.select().from(companies).where(eq(companies.id, this.defaultCompanyId));
      
      if (!existingCompany) {
        await db.insert(companies).values({
          id: this.defaultCompanyId,
          name: "FireBuild Construction",
          plan: "Professional"
        });

        // Create default company settings
        await db.insert(companySettings).values({
          companyId: this.defaultCompanyId,
          companyName: "FireBuild Construction",
          address: "123 Construction Ave",
          city: "Builder City",
          state: "TX",
          zipCode: "75001",
          phone: "(555) 123-4567",
          email: "info@firebuild.ai",
          website: "https://firebuild.ai",
          taxNumber: "TX-123456789",
          licenseNumber: "TXLIC-987654",
          primaryColor: "#2563eb",
          secondaryColor: "#1e40af"
        });
      }
    } catch (error) {
      console.log("Company initialization:", error);
    }
  }

  // Metrics
  async getMetrics() {
    try {
      const [activeJobsResult] = await db
        .select({ count: count() })
        .from(jobs)
        .where(and(eq(jobs.companyId, this.defaultCompanyId), eq(jobs.status, 'in_progress')));

      const [revenueResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .innerJoin(jobs, eq(payments.jobId, jobs.id))
        .where(and(eq(jobs.companyId, this.defaultCompanyId), eq(payments.status, 'completed')));

      const [contractorsResult] = await db
        .select({ count: count() })
        .from(contractors)
        .where(and(eq(contractors.companyId, this.defaultCompanyId), eq(contractors.status, 'active')));

      const [reviewsResult] = await db
        .select({ avgRating: sql<number>`AVG(${reviews.rating})` })
        .from(reviews)
        .innerJoin(jobs, eq(reviews.jobId, jobs.id))
        .where(eq(jobs.companyId, this.defaultCompanyId));

      return {
        activeJobs: activeJobsResult?.count || 0,
        revenue: parseFloat(revenueResult?.total || '0'),
        contractorsOnline: contractorsResult?.count || 0,
        reviewScore: parseFloat(String(reviewsResult?.avgRating || 0))
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        activeJobs: 0,
        revenue: 0,
        contractorsOnline: 0,
        reviewScore: 0
      };
    }
  }

  // Active Contractors
  async getActiveContractors() {
    try {
      const activeContractors = await db
        .select({
          id: contractors.id,
          name: contractors.name,
          profileImageUrl: contractors.profileImageUrl,
          status: contractors.status,
          currentLatitude: contractors.currentLatitude,
          currentLongitude: contractors.currentLongitude
        })
        .from(contractors)
        .where(and(
          eq(contractors.companyId, this.defaultCompanyId),
          eq(contractors.status, 'active')
        ));

      // Get current job for each contractor
      const contractorsWithJobs = await Promise.all(
        activeContractors.map(async (contractor) => {
          const [currentJob] = await db
            .select({ title: jobs.title })
            .from(jobs)
            .where(and(
              eq(jobs.contractorId, contractor.id),
              eq(jobs.status, 'in_progress')
            ))
            .limit(1);

          return {
            id: contractor.id,
            name: contractor.name,
            profileImageUrl: contractor.profileImageUrl,
            currentJob: currentJob?.title || "No active job",
            eta: "15 mins", // Calculate based on location
            distance: "2.3 miles", // Calculate based on location
            status: contractor.status
          };
        })
      );

      return contractorsWithJobs;
    } catch (error) {
      console.error('Error getting active contractors:', error);
      return [];
    }
  }

  // Recent Payment
  async getRecentPayment() {
    try {
      const [recentPayment] = await db
        .select({
          id: payments.id,
          amount: payments.amount,
          invoiceNumber: payments.invoiceNumber,
          reviewRequestSent: payments.reviewRequestSent,
          jobTitle: jobs.title,
          paidAt: payments.paidAt
        })
        .from(payments)
        .innerJoin(jobs, eq(payments.jobId, jobs.id))
        .where(and(
          eq(jobs.companyId, this.defaultCompanyId),
          eq(payments.status, 'completed')
        ))
        .orderBy(desc(payments.paidAt))
        .limit(1);

      if (!recentPayment) return null;

      // Get client info from job
      const [client] = await db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, jobs.clientId))
        .limit(1);

      return {
        id: recentPayment.id,
        amount: parseFloat(recentPayment.amount),
        invoiceNumber: recentPayment.invoiceNumber,
        project: recentPayment.jobTitle,
        client: client?.name || "Unknown Client",
        reviewRequestSent: recentPayment.reviewRequestSent
      };
    } catch (error) {
      console.error('Error getting recent payment:', error);
      return null;
    }
  }

  // Recent Reviews
  async getRecentReviews() {
    try {
      const recentReviews = await db
        .select({
          id: reviews.id,
          platform: reviews.platform,
          clientName: reviews.clientName,
          jobTitle: jobs.title,
          createdAt: reviews.createdAt
        })
        .from(reviews)
        .innerJoin(jobs, eq(reviews.jobId, jobs.id))
        .where(eq(jobs.companyId, this.defaultCompanyId))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      return recentReviews.map(review => {
        const timeDiff = Date.now() - new Date(review.createdAt).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        return {
          id: review.id,
          platform: review.platform,
          client: review.clientName,
          project: review.jobTitle,
          timeAgo: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`
        };
      });
    } catch (error) {
      console.error('Error getting recent reviews:', error);
      return [];
    }
  }

  // Recent Expenses
  async getRecentExpenses() {
    try {
      const recentExpenses = await db
        .select({
          id: expenses.id,
          vendor: expenses.vendor,
          amount: expenses.amount,
          category: expenses.category,
          jobId: expenses.jobId,
          processedAt: expenses.processedAt
        })
        .from(expenses)
        .innerJoin(contractors, eq(expenses.contractorId, contractors.id))
        .where(eq(contractors.companyId, this.defaultCompanyId))
        .orderBy(desc(expenses.createdAt))
        .limit(10);

      return recentExpenses.map(expense => ({
        id: expense.id,
        vendor: expense.vendor,
        amount: parseFloat(expense.amount),
        category: expense.category,
        jobId: expense.jobId,
        status: expense.processedAt ? 'processed' as const : 'processing' as const
      }));
    } catch (error) {
      console.error('Error getting recent expenses:', error);
      return [];
    }
  }

  // Create Expense
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  // Active Jobs
  async getActiveJobs() {
    try {
      const activeJobs = await db
        .select({
          id: jobs.id,
          title: jobs.title,
          status: jobs.status,
          progress: jobs.progress,
          totalAmount: jobs.totalAmount,
          dueDate: jobs.dueDate,
          contractorId: jobs.contractorId,
          clientId: jobs.clientId
        })
        .from(jobs)
        .where(and(
          eq(jobs.companyId, this.defaultCompanyId),
          or(eq(jobs.status, 'active'), eq(jobs.status, 'in_progress'))
        ))
        .orderBy(desc(jobs.createdAt));

      // Get contractor and client names
      const jobsWithDetails = await Promise.all(
        activeJobs.map(async (job) => {
          const [contractor] = await db
            .select({ name: contractors.name })
            .from(contractors)
            .where(eq(contractors.id, job.contractorId))
            .limit(1);

          const [client] = await db
            .select({ name: clients.name })
            .from(clients)
            .where(eq(clients.id, job.clientId))
            .limit(1);

          return {
            id: job.id,
            title: job.title,
            clientName: client?.name || "Unknown Client",
            status: job.status,
            progress: job.progress || 0,
            contractorName: contractor?.name || "Unassigned",
            dueDate: job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "No due date",
            totalAmount: parseFloat(job.totalAmount)
          };
        })
      );

      return jobsWithDetails;
    } catch (error) {
      console.error('Error getting active jobs:', error);
      return [];
    }
  }

  // All Jobs
  async getAllJobs(): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.companyId, this.defaultCompanyId))
      .orderBy(desc(jobs.createdAt));
  }

  // Get Job
  async getJob(jobId: string): Promise<Job | null> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);
    
    return job || null;
  }

  // Create Job
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values({
      ...job,
      companyId: this.defaultCompanyId
    }).returning();
    return newJob;
  }

  // Update Job
  async updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, jobId))
      .returning();
    return updatedJob;
  }

  // Delete Job
  async deleteJob(jobId: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, jobId));
  }

  // Revenue Analytics
  async getRevenueAnalytics() {
    try {
      const monthlyRevenue = await db
        .select({
          month: sql<string>`TO_CHAR(${payments.paidAt}, 'MM/YY')`,
          revenue: sum(payments.amount)
        })
        .from(payments)
        .innerJoin(jobs, eq(payments.jobId, jobs.id))
        .where(and(
          eq(jobs.companyId, this.defaultCompanyId),
          eq(payments.status, 'completed'),
          sql`${payments.paidAt} >= NOW() - INTERVAL '12 months'`
        ))
        .groupBy(sql`TO_CHAR(${payments.paidAt}, 'MM/YY')`)
        .orderBy(sql`TO_CHAR(${payments.paidAt}, 'MM/YY')`);

      const [totals] = await db
        .select({
          totalRevenue: sum(payments.amount),
          completedJobs: count(jobs.id)
        })
        .from(payments)
        .innerJoin(jobs, eq(payments.jobId, jobs.id))
        .where(and(
          eq(jobs.companyId, this.defaultCompanyId),
          eq(payments.status, 'completed')
        ));

      return {
        months: monthlyRevenue.map(m => m.month),
        revenue: monthlyRevenue.map(m => parseFloat(m.revenue || '0')),
        growth: 15.2, // Calculate actual growth
        totalRevenue: parseFloat(totals?.totalRevenue || '0'),
        completedJobs: totals?.completedJobs || 0
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return {
        months: [],
        revenue: [],
        growth: 0,
        totalRevenue: 0,
        completedJobs: 0
      };
    }
  }

  // Team Performance
  async getTeamPerformance() {
    try {
      const teamMembers = await db
        .select({
          id: contractors.id,
          name: contractors.name,
          profileImageUrl: contractors.profileImageUrl,
          rating: contractors.rating,
          totalReviews: contractors.totalReviews
        })
        .from(contractors)
        .where(eq(contractors.companyId, this.defaultCompanyId));

      // Get monthly revenue for each contractor
      const performanceData = await Promise.all(
        teamMembers.map(async (member) => {
          const [monthlyStats] = await db
            .select({
              monthlyRevenue: sum(payments.amount),
              jobCount: count(jobs.id)
            })
            .from(payments)
            .innerJoin(jobs, eq(payments.jobId, jobs.id))
            .where(and(
              eq(jobs.contractorId, member.id),
              eq(payments.status, 'completed'),
              sql`${payments.paidAt} >= NOW() - INTERVAL '1 month'`
            ));

          return {
            id: member.id,
            name: member.name,
            profileImageUrl: member.profileImageUrl,
            role: "Contractor",
            rating: parseFloat(member.rating || '0'),
            reviews: member.totalReviews || 0,
            monthlyRevenue: parseFloat(monthlyStats?.monthlyRevenue || '0'),
            growthPercentage: Math.floor(Math.random() * 30), // Calculate actual growth
            isTopPerformer: parseFloat(member.rating || '0') >= 4.8
          };
        })
      );

      return performanceData;
    } catch (error) {
      console.error('Error getting team performance:', error);
      return [];
    }
  }

  // Contractors
  async getAllContractors(): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .where(eq(contractors.companyId, this.defaultCompanyId))
      .orderBy(desc(contractors.createdAt));
  }

  async getContractor(contractorId: string): Promise<Contractor | null> {
    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, contractorId))
      .limit(1);
    
    return contractor || null;
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db.insert(contractors).values({
      ...contractor,
      companyId: this.defaultCompanyId
    }).returning();
    return newContractor;
  }

  async updateContractor(contractorId: string, updates: Partial<Contractor>): Promise<Contractor> {
    const [updatedContractor] = await db
      .update(contractors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contractors.id, contractorId))
      .returning();
    return updatedContractor;
  }

  async deleteContractor(contractorId: string): Promise<void> {
    await db.delete(contractors).where(eq(contractors.id, contractorId));
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .innerJoin(jobs, eq(payments.jobId, jobs.id))
      .where(eq(jobs.companyId, this.defaultCompanyId))
      .orderBy(desc(payments.createdAt));
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);
    
    return payment || null;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, paymentId))
      .returning();
    return updatedPayment;
  }

  async sendReviewRequest(paymentId: string): Promise<void> {
    await db
      .update(payments)
      .set({ reviewRequestSent: true, updatedAt: new Date() })
      .where(eq(payments.id, paymentId));
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .innerJoin(jobs, eq(reviews.jobId, jobs.id))
      .where(eq(jobs.companyId, this.defaultCompanyId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .innerJoin(contractors, eq(expenses.contractorId, contractors.id))
      .where(eq(contractors.companyId, this.defaultCompanyId))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpense(expenseId: string): Promise<Expense | null> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1);
    
    return expense || null;
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(expenses.id, expenseId))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, expenseId));
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.companyId, this.defaultCompanyId))
      .orderBy(desc(vehicles.createdAt));
  }

  async getVehicle(vehicleId: string): Promise<Vehicle | null> {
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1);
    
    return vehicle || null;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values({
      ...vehicle,
      companyId: this.defaultCompanyId
    }).returning();
    return newVehicle;
  }

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicles.id, vehicleId))
      .returning();
    return updatedVehicle;
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, vehicleId));
  }

  // Client Messages
  async getClientMessages(): Promise<ClientMessage[]> {
    return await db
      .select()
      .from(clientMessages)
      .innerJoin(jobs, eq(clientMessages.jobId, jobs.id))
      .where(eq(jobs.companyId, this.defaultCompanyId))
      .orderBy(desc(clientMessages.createdAt));
  }

  async createClientMessage(message: InsertClientMessage): Promise<ClientMessage> {
    const [newMessage] = await db.insert(clientMessages).values(message).returning();
    return newMessage;
  }

  async replyToClientMessage(messageId: string, replyText: string): Promise<ClientMessage> {
    const [updatedMessage] = await db
      .update(clientMessages)
      .set({
        replied: true,
        replyText,
        repliedAt: new Date()
      })
      .where(eq(clientMessages.id, messageId))
      .returning();
    return updatedMessage;
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | null> {
    const [settings] = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.companyId, this.defaultCompanyId))
      .limit(1);
    
    return settings || null;
  }

  async updateCompanySettings(updates: Partial<CompanySettings>): Promise<CompanySettings> {
    const [updatedSettings] = await db
      .update(companySettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companySettings.companyId, this.defaultCompanyId))
      .returning();
    return updatedSettings;
  }

  // Document Templates
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.companyId, this.defaultCompanyId))
      .orderBy(desc(documentTemplates.createdAt));
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [newTemplate] = await db.insert(documentTemplates).values({
      ...template,
      companyId: this.defaultCompanyId
    }).returning();
    return newTemplate;
  }

  async updateDocumentTemplate(templateId: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const [updatedTemplate] = await db
      .update(documentTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentTemplates.id, templateId))
      .returning();
    return updatedTemplate;
  }

  async deleteDocumentTemplate(templateId: string): Promise<void> {
    await db.delete(documentTemplates).where(eq(documentTemplates.id, templateId));
  }

  // Job Documents
  async getJobDocuments(jobId?: string): Promise<JobDocument[]> {
    let query = db
      .select()
      .from(jobDocuments)
      .innerJoin(jobs, eq(jobDocuments.jobId, jobs.id))
      .where(eq(jobs.companyId, this.defaultCompanyId));

    if (jobId) {
      query = query.where(eq(jobDocuments.jobId, jobId));
    }

    return await query.orderBy(desc(jobDocuments.createdAt));
  }

  async createJobDocument(document: InsertJobDocument): Promise<JobDocument> {
    const [newDocument] = await db.insert(jobDocuments).values(document).returning();
    return newDocument;
  }

  async updateJobDocument(documentId: string, updates: Partial<JobDocument>): Promise<JobDocument> {
    const [updatedDocument] = await db
      .update(jobDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobDocuments.id, documentId))
      .returning();
    return updatedDocument;
  }

  async deleteJobDocument(documentId: string): Promise<void> {
    await db.delete(jobDocuments).where(eq(jobDocuments.id, documentId));
  }

  // Search Documents
  async searchDocuments(query: string): Promise<Array<{
    id: string;
    documentNumber: string;
    documentType: string;
    documentName: string;
    jobTitle: string;
    clientName: string;
    status: string;
    createdAt: Date;
  }>> {
    const searchResults = await db
      .select({
        id: jobDocuments.id,
        documentNumber: jobDocuments.documentNumber,
        documentType: jobDocuments.documentType,
        documentName: jobDocuments.documentName,
        jobTitle: jobs.title,
        clientName: jobs.clientName,
        status: jobDocuments.status,
        createdAt: jobDocuments.createdAt
      })
      .from(jobDocuments)
      .innerJoin(jobs, eq(jobDocuments.jobId, jobs.id))
      .where(and(
        eq(jobs.companyId, this.defaultCompanyId),
        or(
          like(jobDocuments.documentNumber, `%${query}%`),
          like(jobDocuments.documentName, `%${query}%`),
          like(jobs.title, `%${query}%`),
          like(jobs.clientName, `%${query}%`)
        )
      ))
      .orderBy(desc(jobDocuments.createdAt));

    return searchResults;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.companyId, this.defaultCompanyId))
      .orderBy(desc(clients.createdAt));
  }

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
    // Get all clients with aggregated data
    const clientsWithStats = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        secondaryPhone: clients.secondaryPhone,
        address: clients.address,
        city: clients.city,
        state: clients.state,
        zipCode: clients.zipCode,
        rating: clients.rating,
        isActive: clients.isActive,
        lastContactDate: clients.lastContactDate,
        tags: clients.tags,
        preferredContactMethod: clients.preferredContactMethod,
        notes: clients.notes,
        createdAt: clients.createdAt,
        totalJobs: count(jobs.id),
        totalSpent: sum(jobs.totalAmount),
      })
      .from(clients)
      .leftJoin(jobs, eq(clients.id, jobs.clientId))
      .where(eq(clients.companyId, this.defaultCompanyId))
      .groupBy(clients.id, clients.name, clients.email, clients.phone, clients.secondaryPhone, 
               clients.address, clients.city, clients.state, clients.zipCode, clients.rating, 
               clients.isActive, clients.lastContactDate, clients.tags, clients.preferredContactMethod, 
               clients.notes, clients.createdAt)
      .orderBy(desc(clients.createdAt));

    // Transform the results to match the expected interface
    return clientsWithStats.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email || undefined,
      phone: client.phone || undefined,
      secondaryPhone: client.secondaryPhone || undefined,
      address: client.address || undefined,
      city: client.city || undefined,
      state: client.state || undefined,
      zipCode: client.zipCode || undefined,
      totalSpent: Number(client.totalSpent) || 0,
      rating: client.rating || 0,
      isActive: client.isActive || true,
      lastContactDate: client.lastContactDate || undefined,
      tags: client.tags || [],
      preferredContactMethod: client.preferredContactMethod || 'email',
      notes: client.notes || undefined,
      jobsCount: Number(client.totalJobs) || 0,
      totalJobs: Number(client.totalJobs) || 0,
      completedJobs: 0, // Will calculate separately if needed
      activeJobs: 0, // Will calculate separately if needed
      lastJobDate: undefined, // Will calculate separately if needed
      createdAt: client.createdAt
    }));
  }

  async getClient(clientId: string): Promise<Client | null> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);
    
    return client || null;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values({
      ...client,
      companyId: this.defaultCompanyId
    }).returning();
    return newClient;
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, clientId))
      .returning();
    return updatedClient;
  }

  async deleteClient(clientId: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, clientId));
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
    // Search clients with aggregated data
    const clientsWithStats = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        secondaryPhone: clients.secondaryPhone,
        address: clients.address,
        city: clients.city,
        state: clients.state,
        zipCode: clients.zipCode,
        rating: clients.rating,
        isActive: clients.isActive,
        lastContactDate: clients.lastContactDate,
        tags: clients.tags,
        preferredContactMethod: clients.preferredContactMethod,
        notes: clients.notes,
        createdAt: clients.createdAt,
        totalJobs: count(jobs.id),
        totalSpent: sum(jobs.totalAmount),
      })
      .from(clients)
      .leftJoin(jobs, eq(clients.id, jobs.clientId))
      .where(and(
        eq(clients.companyId, this.defaultCompanyId),
        or(
          like(clients.name, `%${query}%`),
          like(clients.email, `%${query}%`),
          like(clients.phone, `%${query}%`),
          like(clients.city, `%${query}%`)
        )
      ))
      .groupBy(clients.id, clients.name, clients.email, clients.phone, clients.secondaryPhone, 
               clients.address, clients.city, clients.state, clients.zipCode, clients.rating, 
               clients.isActive, clients.lastContactDate, clients.tags, clients.preferredContactMethod, 
               clients.notes, clients.createdAt)
      .orderBy(desc(clients.createdAt));

    // Transform the results to match the expected interface
    return clientsWithStats.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email || undefined,
      phone: client.phone || undefined,
      secondaryPhone: client.secondaryPhone || undefined,
      address: client.address || undefined,
      city: client.city || undefined,
      state: client.state || undefined,
      zipCode: client.zipCode || undefined,
      totalSpent: Number(client.totalSpent) || 0,
      rating: client.rating || 0,
      isActive: client.isActive || true,
      lastContactDate: client.lastContactDate || undefined,
      tags: client.tags || [],
      preferredContactMethod: client.preferredContactMethod || 'email',
      notes: client.notes || undefined,
      jobsCount: Number(client.totalJobs) || 0,
      totalJobs: Number(client.totalJobs) || 0,
      completedJobs: 0, // Will calculate separately if needed
      activeJobs: 0, // Will calculate separately if needed
      lastJobDate: undefined, // Will calculate separately if needed
      createdAt: client.createdAt
    }));
  }

  // Client Projects/Jobs
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
    const projects = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        status: jobs.status,
        progress: jobs.progress,
        totalAmount: jobs.totalAmount,
        paidAmount: jobs.paidAmount,
        startDate: jobs.startDate,
        dueDate: jobs.dueDate,
        completedDate: jobs.completedDate,
        contractorId: jobs.contractorId,
        createdAt: jobs.createdAt
      })
      .from(jobs)
      .where(and(
        eq(jobs.clientId, clientId),
        eq(jobs.companyId, this.defaultCompanyId)
      ))
      .orderBy(desc(jobs.createdAt));

    // Get contractor names
    const projectsWithContractors = await Promise.all(
      projects.map(async (project) => {
        const [contractor] = await db
          .select({ name: contractors.name })
          .from(contractors)
          .where(eq(contractors.id, project.contractorId))
          .limit(1);

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          totalAmount: parseFloat(project.totalAmount || '0'),
          paidAmount: parseFloat(project.paidAmount || '0'),
          status: project.status,
          progress: project.progress || 0,
          startDate: project.startDate,
          dueDate: project.dueDate,
          completedDate: project.completedDate,
          contractorName: contractor?.name,
          createdAt: project.createdAt
        };
      })
    );

    return projectsWithContractors;
  }

  async getClientProjects(clientId: string): Promise<Array<{
    id: string;
    title: string;
    status: string;
    progress?: number;
    totalAmount: string;
    startDate?: Date;
    dueDate?: Date;
    completedDate?: Date;
    contractorName?: string;
    createdAt: Date;
  }>> {
    const projects = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        status: jobs.status,
        progress: jobs.progress,
        totalAmount: jobs.totalAmount,
        startDate: jobs.startDate,
        dueDate: jobs.dueDate,
        completedDate: jobs.completedDate,
        contractorId: jobs.contractorId,
        createdAt: jobs.createdAt
      })
      .from(jobs)
      .where(and(
        eq(jobs.clientId, clientId),
        eq(jobs.companyId, this.defaultCompanyId)
      ))
      .orderBy(desc(jobs.createdAt));

    // Get contractor names
    const projectsWithContractors = await Promise.all(
      projects.map(async (project) => {
        const [contractor] = await db
          .select({ name: contractors.name })
          .from(contractors)
          .where(eq(contractors.id, project.contractorId))
          .limit(1);

        return {
          id: project.id,
          title: project.title,
          status: project.status,
          progress: project.progress,
          totalAmount: project.totalAmount,
          startDate: project.startDate,
          dueDate: project.dueDate,
          completedDate: project.completedDate,
          contractorName: contractor?.name,
          createdAt: project.createdAt
        };
      })
    );

    return projectsWithContractors;
  }

  // Client Invoices & Estimates
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
    const documents = await db
      .select({
        id: jobDocuments.id,
        jobId: jobDocuments.jobId,
        jobTitle: jobs.title,
        documentType: jobDocuments.documentType,
        documentName: jobDocuments.documentName,
        status: jobDocuments.status,
        createdAt: jobDocuments.createdAt,
        signedAt: jobDocuments.signedAt,
        documentUrl: jobDocuments.documentUrl,
        totalAmount: jobs.totalAmount
      })
      .from(jobDocuments)
      .innerJoin(jobs, eq(jobDocuments.jobId, jobs.id))
      .where(and(
        eq(jobs.clientId, clientId),
        eq(jobs.companyId, this.defaultCompanyId),
        or(
          eq(jobDocuments.documentType, 'invoice'),
          eq(jobDocuments.documentType, 'estimate'),
          eq(jobDocuments.documentType, 'contract'),
          eq(jobDocuments.documentType, 'work_order')
        )
      ))
      .orderBy(desc(jobDocuments.createdAt));

    return documents.map(doc => ({
      id: doc.id,
      jobId: doc.jobId,
      jobTitle: doc.jobTitle,
      documentType: doc.documentType as 'invoice' | 'estimate' | 'contract' | 'work_order',
      documentName: doc.documentName,
      amount: doc.totalAmount ? parseFloat(doc.totalAmount) : undefined,
      status: doc.status,
      createdAt: doc.createdAt,
      signedAt: doc.signedAt,
      documentUrl: doc.documentUrl
    }));
  }

  // Communications
  async getClientCommunications(clientId: string): Promise<Communication[]> {
    return await db
      .select()
      .from(communications)
      .where(eq(communications.clientId, clientId))
      .orderBy(desc(communications.createdAt));
  }

  async createCommunication(communication: InsertCommunication): Promise<Communication> {
    const [newCommunication] = await db.insert(communications).values(communication).returning();
    return newCommunication;
  }

  async updateCommunication(id: string, updates: Partial<InsertCommunication>): Promise<Communication> {
    const [updatedCommunication] = await db
      .update(communications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communications.id, id))
      .returning();
    return updatedCommunication;
  }

  async deleteCommunication(id: string): Promise<void> {
    await db.delete(communications).where(eq(communications.id, id));
  }

  async getRecentCommunications(): Promise<Communication[]> {
    return await db
      .select()
      .from(communications)
      .innerJoin(clients, eq(communications.clientId, clients.id))
      .where(eq(clients.companyId, this.defaultCompanyId))
      .orderBy(desc(communications.createdAt))
      .limit(10);
  }

  // Client Photos
  async getClientPhotos(clientId: string): Promise<ClientPhoto[]> {
    return await db
      .select()
      .from(clientPhotos)
      .where(eq(clientPhotos.clientId, clientId))
      .orderBy(desc(clientPhotos.createdAt));
  }

  async createClientPhoto(photo: InsertClientPhoto): Promise<ClientPhoto> {
    const [newPhoto] = await db.insert(clientPhotos).values(photo).returning();
    return newPhoto;
  }

  async deleteClientPhoto(photoId: string): Promise<void> {
    await db.delete(clientPhotos).where(eq(clientPhotos.id, photoId));
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.companyId, this.defaultCompanyId))
      .orderBy(desc(purchaseOrders.createdAt));
  }

  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newPO] = await db.insert(purchaseOrders).values({
      ...po,
      companyId: this.defaultCompanyId
    }).returning();
    return newPO;
  }

  async updatePurchaseOrderStatus(poId: string, status: string): Promise<PurchaseOrder> {
    const [updatedPO] = await db
      .update(purchaseOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, poId))
      .returning();
    return updatedPO;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.companyId, this.defaultCompanyId))
      .orderBy(desc(quotes.createdAt));
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values({
      ...quote,
      companyId: this.defaultCompanyId
    }).returning();
    return newQuote;
  }

  async updateQuoteStatus(quoteId: string, status: string): Promise<Quote> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, quoteId))
      .returning();
    return updatedQuote;
  }

  // Verification Methods
  async createVerificationCode(verificationCode: InsertVerificationCode): Promise<VerificationCode> {
    const [newCode] = await db.insert(verificationCodes).values(verificationCode).returning();
    return newCode;
  }

  async getValidVerificationCode(
    email: string | null, 
    phone: string | null, 
    code: string, 
    type: 'email' | 'sms', 
    purpose: 'registration' | 'password_reset'
  ): Promise<VerificationCode | null> {
    const conditions = [
      eq(verificationCodes.code, code),
      eq(verificationCodes.type, type),
      eq(verificationCodes.purpose, purpose),
      sql`${verificationCodes.expiresAt} > NOW()`,
      sql`${verificationCodes.usedAt} IS NULL`
    ];

    if (email) {
      conditions.push(eq(verificationCodes.email, email));
    }
    if (phone) {
      conditions.push(eq(verificationCodes.phone, phone));
    }

    const [result] = await db
      .select()
      .from(verificationCodes)
      .where(and(...conditions))
      .limit(1);

    return result || null;
  }

  async markVerificationCodeAsUsed(id: string): Promise<void> {
    await db
      .update(verificationCodes)
      .set({ usedAt: new Date() })
      .where(eq(verificationCodes.id, id));
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async markEmailAsVerified(email: string): Promise<void> {
    await db.update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.email, email));
  }

  async markPhoneAsVerified(phone: string): Promise<void> {
    await db.update(users)
      .set({ phoneVerified: true, updatedAt: new Date() })
      .where(eq(users.phone, phone));
  }

  async activateUser(userId: string): Promise<void> {
    await db.update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // User Management Methods
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserVerificationStatus(userId: string, emailVerified?: boolean, phoneVerified?: boolean): Promise<void> {
    const updateData: any = { updatedAt: new Date() };
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (phoneVerified !== undefined) updateData.phoneVerified = phoneVerified;
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Session Management Methods
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values({
      ...session,
      createdAt: new Date()
    }).returning();
    return newSession;
  }

  async getUserSession(sessionToken: string): Promise<UserSession | null> {
    const [session] = await db.select().from(userSessions)
      .where(and(
        eq(userSessions.sessionToken, sessionToken),
        sql`${userSessions.expiresAt} > NOW()`
      ));
    return session || null;
  }

  async deleteUserSession(sessionToken: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(sql`${userSessions.expiresAt} <= NOW()`);
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  // Contractor Invoices (AP) Implementation
  async createContractorInvoice(invoice: InsertContractorInvoice): Promise<ContractorInvoice> {
    const [newInvoice] = await db.insert(contractorInvoices).values(invoice).returning();
    
    // Automatically create payment calendar entry based on payment terms
    if (newInvoice.paymentTerms && newInvoice.totalAmount) {
      const daysToAdd = parseInt(newInvoice.paymentTerms.replace('net', '')) || 30;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      await this.createApPaymentEntry({
        invoiceId: newInvoice.id,
        contractorId: newInvoice.contractorId!,
        dueDate,
        amount: newInvoice.totalAmount,
        paymentTerms: newInvoice.paymentTerms,
        status: 'upcoming'
      });
    }
    
    return newInvoice;
  }

  async getContractorInvoices(): Promise<ContractorInvoice[]> {
    return await db.select().from(contractorInvoices).orderBy(desc(contractorInvoices.createdAt));
  }

  async getContractorInvoice(id: string): Promise<ContractorInvoice | undefined> {
    const [invoice] = await db.select().from(contractorInvoices).where(eq(contractorInvoices.id, id));
    return invoice;
  }

  async updateContractorInvoice(id: string, updates: Partial<InsertContractorInvoice>): Promise<ContractorInvoice> {
    const [updated] = await db.update(contractorInvoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contractorInvoices.id, id))
      .returning();
    return updated;
  }

  async deleteContractorInvoice(id: string): Promise<void> {
    await db.delete(contractorInvoices).where(eq(contractorInvoices.id, id));
    // Also delete related payment calendar entries
    await db.delete(apPaymentCalendar).where(eq(apPaymentCalendar.invoiceId, id));
  }

  // AP Payment Calendar Implementation
  async createApPaymentEntry(entry: InsertApPaymentCalendar): Promise<ApPaymentCalendar> {
    const [newEntry] = await db.insert(apPaymentCalendar).values(entry).returning();
    return newEntry;
  }

  async getApPaymentCalendar(): Promise<ApPaymentCalendar[]> {
    return await db.select().from(apPaymentCalendar).orderBy(apPaymentCalendar.dueDate);
  }

  async getUpcomingPayments(days: number = 30): Promise<ApPaymentCalendar[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db.select()
      .from(apPaymentCalendar)
      .where(
        and(
          eq(apPaymentCalendar.status, 'upcoming'),
          sql`${apPaymentCalendar.dueDate} <= ${futureDate.toISOString()}`
        )
      )
      .orderBy(apPaymentCalendar.dueDate);
  }

  async getOverduePayments(): Promise<ApPaymentCalendar[]> {
    const today = new Date();
    
    return await db.select()
      .from(apPaymentCalendar)
      .where(
        and(
          or(eq(apPaymentCalendar.status, 'due'), eq(apPaymentCalendar.status, 'overdue')),
          sql`${apPaymentCalendar.dueDate} < ${today.toISOString()}`
        )
      )
      .orderBy(apPaymentCalendar.dueDate);
  }

  async updateApPaymentEntry(id: string, updates: Partial<InsertApPaymentCalendar>): Promise<ApPaymentCalendar> {
    const [updated] = await db.update(apPaymentCalendar)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apPaymentCalendar.id, id))
      .returning();
    return updated;
  }

  async markPaymentPaid(id: string, paymentDate: Date): Promise<ApPaymentCalendar> {
    const [updated] = await db.update(apPaymentCalendar)
      .set({ 
        status: 'paid',
        actualPayDate: paymentDate,
        updatedAt: new Date()
      })
      .where(eq(apPaymentCalendar.id, id))
      .returning();
    return updated;
  }

  // Invoice methods for Stripe/PayPal payments
  async createInvoice(invoice: any): Promise<any> {
    const [newInvoice] = await db.insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async getInvoice(id: string): Promise<any | undefined> {
    const [invoice] = await db.select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(jobs, eq(invoices.jobId, jobs.id))
      .where(eq(invoices.id, id));
    
    if (!invoice) return undefined;
    
    return {
      ...invoice.invoices,
      client: invoice.clients,
      job: invoice.jobs,
    };
  }

  async updateInvoice(id: string, invoice: any): Promise<any> {
    const [updated] = await db.update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async getInvoices(): Promise<any[]> {
    return await db.select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(jobs, eq(invoices.jobId, jobs.id))
      .orderBy(desc(invoices.createdAt));
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }
}

export const storage = new DatabaseStorage();
