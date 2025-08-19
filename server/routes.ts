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
