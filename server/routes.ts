import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSalarySlipSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all salary slips
  app.get("/api/salary-slips", async (_req, res) => {
    const slips = await storage.listSalarySlips();
    res.json(slips);
  });

  // Get a specific salary slip
  app.get("/api/salary-slips/:id", async (req, res) => {
    const slip = await storage.getSalarySlip(Number(req.params.id));
    if (!slip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }
    res.json(slip);
  });

  // Create a new salary slip
  app.post("/api/salary-slips", async (req, res) => {
    try {
      const data = insertSalarySlipSchema.parse(req.body);
      const slip = await storage.createSalarySlip(data);
      res.status(201).json(slip);
    } catch (error) {
      res.status(400).json({ message: "Invalid salary slip data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}