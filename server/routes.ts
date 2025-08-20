import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { verificationService } from "./verificationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Metrics endpoint
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Active contractors endpoint
  app.get("/api/contractors/active", async (req, res) => {
    try {
      const contractors = await storage.getActiveContractors();
      res.json(contractors);
    } catch (error) {
      console.error("Error fetching active contractors:", error);
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  // Recent payment endpoint
  app.get("/api/payments/recent", async (req, res) => {
    try {
      const payment = await storage.getRecentPayment();
      res.json(payment);
    } catch (error) {
      console.error("Error fetching recent payment:", error);
      res.status(500).json({ message: "Failed to fetch recent payment" });
    }
  });

  // Recent reviews endpoint
  app.get("/api/reviews/recent", async (req, res) => {
    try {
      const reviews = await storage.getRecentReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
      res.status(500).json({ message: "Failed to fetch recent reviews" });
    }
  });

  // Recent expenses endpoint
  app.get("/api/expenses/recent", async (req, res) => {
    try {
      const expenses = await storage.getRecentExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
      res.status(500).json({ message: "Failed to fetch recent expenses" });
    }
  });

  // Capture receipt endpoint
  app.post("/api/expenses/capture-receipt", async (req, res) => {
    try {
      // In a real implementation, this would handle file upload and OCR processing
      const expense = await storage.createExpense({
        contractorId: "contractor-1",
        vendor: "Example Vendor",
        amount: "125.99",
        category: "Materials",
        description: "Receipt captured via OCR",
        taxDeductible: true,
        processedAt: new Date(),
      });
      res.json({ success: true, expenseId: expense.id });
    } catch (error) {
      console.error("Error capturing receipt:", error);
      res.status(500).json({ message: "Failed to capture receipt" });
    }
  });

  // Active jobs endpoint
  app.get("/api/jobs/active", async (req, res) => {
    try {
      const jobs = await storage.getActiveJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      res.status(500).json({ message: "Failed to fetch active jobs" });
    }
  });

  // Jobs endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const job = await storage.createJob({
        companyId: "company-1",
        ...req.body,
      });
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      await storage.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Revenue analytics endpoint
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const revenueData = await storage.getRevenueAnalytics();
      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  // Team performance endpoint
  app.get("/api/team/performance", async (req, res) => {
    try {
      const teamMembers = await storage.getTeamPerformance();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team performance:", error);
      res.status(500).json({ message: "Failed to fetch team performance" });
    }
  });

  // Client messages endpoint
  app.get("/api/client-messages", async (req, res) => {
    try {
      const messages = await storage.getClientMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching client messages:", error);
      res.status(500).json({ message: "Failed to fetch client messages" });
    }
  });

  // Reply to client message endpoint
  app.post("/api/client-messages/:messageId/reply", async (req, res) => {
    try {
      const { messageId } = req.params;
      const { reply } = req.body;
      await storage.replyToClientMessage(messageId, reply);
      res.json({ success: true });
    } catch (error) {
      console.error("Error replying to client message:", error);
      res.status(500).json({ message: "Failed to reply to client message" });
    }
  });

  // Client stats endpoint
  app.get("/api/client-stats", async (req, res) => {
    try {
      const stats = await storage.getClientStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching client stats:", error);
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  // Vehicles endpoint
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Fleet stats endpoint
  app.get("/api/fleet-stats", async (req, res) => {
    try {
      const stats = await storage.getFleetStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching fleet stats:", error);
      res.status(500).json({ message: "Failed to fetch fleet stats" });
    }
  });

  // Document Management endpoints
  app.get("/api/document-templates", async (req, res) => {
    try {
      const templates = await storage.getDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching document templates:", error);
      res.status(500).json({ message: "Failed to fetch document templates" });
    }
  });

  app.post("/api/document-templates", async (req, res) => {
    try {
      const template = await storage.createDocumentTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error("Error creating document template:", error);
      res.status(500).json({ message: "Failed to create document template" });
    }
  });

  app.get("/api/jobs/:jobId/documents", async (req, res) => {
    try {
      const documents = await storage.getJobDocuments(req.params.jobId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching job documents:", error);
      res.status(500).json({ message: "Failed to fetch job documents" });
    }
  });

  app.post("/api/jobs/:jobId/documents", async (req, res) => {
    try {
      const document = await storage.createJobDocument({
        ...req.body,
        jobId: req.params.jobId,
      });
      res.json(document);
    } catch (error) {
      console.error("Error creating job document:", error);
      res.status(500).json({ message: "Failed to create job document" });
    }
  });

  app.put("/api/documents/:documentId", async (req, res) => {
    try {
      const document = await storage.updateJobDocument(req.params.documentId, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.get("/api/jobs/:jobId/client-documents", async (req, res) => {
    try {
      const documents = await storage.getClientDocuments(req.params.jobId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ message: "Failed to fetch client documents" });
    }
  });

  // General client documents endpoint (for Documents page)
  app.get("/api/client-documents", async (req, res) => {
    try {
      const documents = await storage.getAllClientDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching all client documents:", error);
      res.status(500).json({ message: "Failed to fetch client documents" });
    }
  });

  // Create client document endpoint
  app.post("/api/client-documents", async (req, res) => {
    try {
      const document = await storage.createClientDocument(req.body);
      res.json(document);
    } catch (error) {
      console.error("Error creating client document:", error);
      res.status(500).json({ message: "Failed to create client document" });
    }
  });

  // Company settings routes
  app.get("/api/company-settings/:companyId", async (req, res) => {
    try {
      const { companyId } = req.params;
      const settings = await storage.getCompanySettings(companyId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.put("/api/company-settings/:companyId", async (req, res) => {
    try {
      const { companyId } = req.params;
      const updates = req.body;
      const updatedSettings = await storage.updateCompanySettings(companyId, updates);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });

  // Client Management Routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.get("/api/clients/:id/jobs", async (req, res) => {
    try {
      const jobs = await storage.getClientJobs(req.params.id);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching client jobs:", error);
      res.status(500).json({ message: "Failed to fetch client jobs" });
    }
  });

  app.get("/api/clients/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getClientInvoicesAndEstimates(req.params.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ message: "Failed to fetch client documents" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const client = await storage.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Search clients with document numbers support
  app.get("/api/clients/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      const clients = await storage.searchClients(q);
      res.json(clients);
    } catch (error) {
      console.error("Error searching clients:", error);
      res.status(500).json({ message: "Failed to search clients" });
    }
  });

  // Communication endpoints
  app.get("/api/clients/:id/communications", async (req, res) => {
    try {
      const communications = await storage.getClientCommunications(req.params.id);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching client communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.post("/api/communications", async (req, res) => {
    try {
      const communication = await storage.createCommunication(req.body);
      res.status(201).json(communication);
    } catch (error) {
      console.error("Error creating communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  app.put("/api/communications/:id", async (req, res) => {
    try {
      const communication = await storage.updateCommunication(req.params.id, req.body);
      res.json(communication);
    } catch (error) {
      console.error("Error updating communication:", error);
      res.status(500).json({ message: "Failed to update communication" });
    }
  });

  app.delete("/api/communications/:id", async (req, res) => {
    try {
      await storage.deleteCommunication(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting communication:", error);
      res.status(500).json({ message: "Failed to delete communication" });
    }
  });

  // Recent communications endpoint
  app.get("/api/communications/recent", async (req, res) => {
    try {
      const communications = await storage.getRecentCommunications();
      res.json(communications);
    } catch (error) {
      console.error("Error fetching recent communications:", error);
      res.status(500).json({ message: "Failed to fetch recent communications" });
    }
  });

  // Client photos endpoints
  app.get("/api/clients/:id/photos", async (req, res) => {
    try {
      const photos = await storage.getClientPhotos(req.params.id);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching client photos:", error);
      res.status(500).json({ message: "Failed to fetch client photos" });
    }
  });

  app.post("/api/clients/:id/photos", async (req, res) => {
    try {
      const photoData = {
        ...req.body,
        clientId: req.params.id,
      };
      const photo = await storage.createClientPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error creating client photo:", error);
      res.status(500).json({ message: "Failed to create client photo" });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    try {
      await storage.deleteClientPhoto(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Photo upload URL endpoint
  app.post("/api/photos/upload-url", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getClientPhotoUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Serve uploaded photos
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error serving photo:", error);
      if (error.name === "ObjectNotFoundError") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Purchase Orders endpoints
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const purchaseOrders = await storage.getPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const purchaseOrder = await storage.createPurchaseOrder(req.body);
      res.json(purchaseOrder);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  app.put("/api/purchase-orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const purchaseOrder = await storage.updatePurchaseOrderStatus(id, status);
      res.json(purchaseOrder);
    } catch (error) {
      console.error("Error updating purchase order status:", error);
      res.status(500).json({ message: "Failed to update purchase order status" });
    }
  });

  // Quotes endpoints
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const quote = await storage.createQuote(req.body);
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.put("/api/quotes/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const quote = await storage.updateQuoteStatus(id, status);
      res.json(quote);
    } catch (error) {
      console.error("Error updating quote status:", error);
      res.status(500).json({ message: "Failed to update quote status" });
    }
  });

  app.post("/api/quotes/upload", async (req, res) => {
    try {
      // Mock upload response for now - in real implementation would handle file upload
      res.json({ success: true, message: "Quote document uploaded successfully" });
    } catch (error) {
      console.error("Error uploading quote document:", error);
      res.status(500).json({ message: "Failed to upload quote document" });
    }
  });

  // Authentication & Verification Routes
  app.post("/api/auth/send-email-verification", async (req, res) => {
    try {
      const { email, purpose = 'registration' } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const success = await verificationService.sendEmailVerification(email, purpose);
      
      if (success) {
        res.json({ message: "Verification code sent to email" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error("Error sending email verification:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.post("/api/auth/send-sms-verification", async (req, res) => {
    try {
      const { phone, purpose = 'registration' } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const success = await verificationService.sendSMSVerification(phone, purpose);
      
      if (success) {
        res.json({ message: "Verification code sent to phone" });
      } else {
        res.status(500).json({ message: "Failed to send verification SMS" });
      }
    } catch (error) {
      console.error("Error sending SMS verification:", error);
      res.status(500).json({ message: "Failed to send verification SMS" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { email, code, purpose = 'registration' } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and verification code are required" });
      }

      const isValid = await verificationService.verifyEmailCode(email, code, purpose);
      
      if (isValid) {
        res.json({ message: "Email verified successfully", verified: true });
      } else {
        res.status(400).json({ message: "Invalid or expired verification code", verified: false });
      }
    } catch (error) {
      console.error("Error verifying email code:", error);
      res.status(500).json({ message: "Failed to verify email code" });
    }
  });

  app.post("/api/auth/verify-sms", async (req, res) => {
    try {
      const { phone, code, purpose = 'registration' } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ message: "Phone number and verification code are required" });
      }

      const isValid = await verificationService.verifySMSCode(phone, code, purpose);
      
      if (isValid) {
        res.json({ message: "Phone verified successfully", verified: true });
      } else {
        res.status(400).json({ message: "Invalid or expired verification code", verified: false });
      }
    } catch (error) {
      console.error("Error verifying SMS code:", error);
      res.status(500).json({ message: "Failed to verify SMS code" });
    }
  });

  app.post("/api/auth/check-verification-status", async (req, res) => {
    try {
      const { email, phone } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const isFullyVerified = await verificationService.isUserFullyVerified(email, phone);
      
      res.json({ 
        fullyVerified: isFullyVerified,
        emailRequired: true,
        phoneRequired: !!phone
      });
    } catch (error) {
      console.error("Error checking verification status:", error);
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  app.post("/api/auth/activate-account", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const success = await verificationService.activateUserAccount(email);
      
      if (success) {
        res.json({ message: "Account activated successfully", activated: true });
      } else {
        res.status(400).json({ message: "Account cannot be activated. Ensure all verification steps are completed.", activated: false });
      }
    } catch (error) {
      console.error("Error activating account:", error);
      res.status(500).json({ message: "Failed to activate account" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send periodic updates
    const sendUpdate = () => {
      if (ws.readyState === WebSocket.OPEN) {
        // Simulate different types of real-time updates
        const updateTypes = [
          'contractor_update',
          'payment_received',
          'expense_processed',
          'job_update',
          'vehicle_update',
          'client_message'
        ];
        
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        ws.send(JSON.stringify({
          type: randomType,
          timestamp: new Date().toISOString(),
          data: { message: `Real-time ${randomType} update` }
        }));
      }
    };

    // Send updates every 30 seconds
    const interval = setInterval(sendUpdate, 30000);

    ws.on('close', () => {
      clearInterval(interval);
    });
  });

  return httpServer;
}
