import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("Basic"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id).notNull().unique(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  taxNumber: text("tax_number"),
  licenseNumber: text("license_number"),
  primaryColor: text("primary_color").default("#2563eb"),
  secondaryColor: text("secondary_color").default("#1e40af"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractors = pgTable("contractors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  status: text("status").notNull().default("offline"), // offline, online, active, break
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  contractorId: varchar("contractor_id").references(() => contractors.id),
  title: text("title").notNull(),
  description: text("description"),
  clientName: text("client_name").notNull(),
  clientAddress: text("client_address").notNull(),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, cancelled
  progress: integer("progress").default(0), // 0-100
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  invoiceNumber: text("invoice_number").notNull(),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  reviewRequestSent: boolean("review_request_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  contractorId: varchar("contractor_id").references(() => contractors.id).notNull(),
  vendor: text("vendor").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  receiptUrl: text("receipt_url"),
  ocrData: jsonb("ocr_data"),
  taxDeductible: boolean("tax_deductible").default(false),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  platform: text("platform").notNull(), // google, facebook, angie_list
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  reviewUrl: text("review_url"),
  clientName: text("client_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  contractorId: varchar("contractor_id").references(() => contractors.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // truck, equipment, van
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  plateNumber: text("plate_number"),
  status: text("status").notNull().default("parked"), // active, en_route, parked, maintenance
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  mileageToday: decimal("mileage_today", { precision: 8, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientMessages = pgTable("client_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  clientName: text("client_name").notNull(),
  message: text("message").notNull(),
  replied: boolean("replied").default(false),
  replyText: text("reply_text"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentTemplates = pgTable("document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // legal, work_order, stop_work, job_addon, scope, collection
  templateHtml: text("template_html").notNull(),
  requiredFields: jsonb("required_fields"), // JSON array of field names
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  secondaryPhone: text("secondary_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  preferredContactMethod: text("preferred_contact_method").default("phone"), // phone, email, text
  notes: text("notes"),
  tags: jsonb("tags"), // Array of tags like ["VIP", "Commercial", "Residential"]
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  lastContactDate: timestamp("last_contact_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobDocuments = pgTable("job_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  templateId: varchar("template_id").references(() => documentTemplates.id),
  documentName: text("document_name").notNull(),
  documentType: text("document_type").notNull(),
  documentUrl: text("document_url").notNull(), // URL to signed document
  status: text("status").notNull().default("draft"), // draft, sent, signed, completed
  signedBy: text("signed_by"),
  signedAt: timestamp("signed_at"),
  isClientVisible: boolean("is_client_visible").default(true),
  formData: jsonb("form_data"), // filled template data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communications = pgTable("communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  type: text("type").notNull(), // 'sms', 'email', 'call'
  direction: text("direction").notNull(), // 'incoming', 'outgoing'
  subject: text("subject"), // For emails
  content: text("content"),
  phoneNumber: text("phone_number"), // For SMS/calls
  emailAddress: text("email_address"), // For emails
  duration: integer("duration"), // Call duration in seconds
  status: text("status").notNull().default("sent"), // 'sent', 'delivered', 'failed', 'read'
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientPhotos = pgTable("client_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  objectPath: text("object_path").notNull(), // path to object storage
  description: text("description"),
  takenBy: text("taken_by"), // who took the photo
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractorSchema = createInsertSchema(contractors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientMessageSchema = createInsertSchema(clientMessages).omit({ id: true, createdAt: true });
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobDocumentSchema = createInsertSchema(jobDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunicationSchema = createInsertSchema(communications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientPhotoSchema = createInsertSchema(clientPhotos).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type ClientMessage = typeof clientMessages.$inferSelect;
export type InsertClientMessage = z.infer<typeof insertClientMessageSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type JobDocument = typeof jobDocuments.$inferSelect;
export type InsertJobDocument = z.infer<typeof insertJobDocumentSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type ClientPhoto = typeof clientPhotos.$inferSelect;
export type InsertClientPhoto = z.infer<typeof insertClientPhotoSchema>;
