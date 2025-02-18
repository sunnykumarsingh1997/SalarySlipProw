import { salarySlips, type SalarySlip, type InsertSalarySlip } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSalarySlip(id: number): Promise<SalarySlip | undefined>;
  createSalarySlip(salarySlip: InsertSalarySlip): Promise<SalarySlip>;
  listSalarySlips(): Promise<SalarySlip[]>;
}

export class DatabaseStorage implements IStorage {
  async getSalarySlip(id: number): Promise<SalarySlip | undefined> {
    const [slip] = await db.select().from(salarySlips).where(eq(salarySlips.id, id));
    return slip || undefined;
  }

  async createSalarySlip(salarySlip: InsertSalarySlip): Promise<SalarySlip> {
    const [slip] = await db
      .insert(salarySlips)
      .values(salarySlip)
      .returning();
    return slip;
  }

  async listSalarySlips(): Promise<SalarySlip[]> {
    return await db.select().from(salarySlips).orderBy(salarySlips.createdAt);
  }
}

export const storage = new DatabaseStorage();