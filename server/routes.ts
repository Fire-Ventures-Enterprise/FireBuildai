import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

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

  // Create job endpoint
  app.post("/api/jobs", async (req, res) => {
    try {
      const job = await storage.createJob({
        companyId: "company-1",
        title: "New Construction Project",
        description: "Residential construction project",
        clientName: "New Client",
        clientAddress: "123 New St",
        totalAmount: "15000.00",
        status: "planned",
        progress: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
      res.json({ success: true, jobId: job.id });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
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
