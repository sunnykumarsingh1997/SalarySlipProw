import { z } from "zod";
import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Employee Details Schema
export const employeeDetailsSchema = z.object({
  employeeId: z.string(),
  tan: z.string(),
  pan: z.string(),
  pfNumber: z.string(),
  esiNumber: z.string(),
  designation: z.string(),
  department: z.string(),
  bankName: z.string(),
  accountNumber: z.string(),
  ifscCode: z.string(),
  location: z.string(),
  email: z.string().email(),
});

// Salary Components Schema
export const salaryComponentsSchema = z.object({
  grossSalary: z.number().min(1, "Gross salary is required"),
  basic: z.number().min(0),
  hra: z.number().min(0),
  da: z.number().min(0),
  conveyanceAllowance: z.number().min(0),
  medicalAllowance: z.number().min(0),
  lta: z.number().min(0),
  otherAllowances: z.number().min(0),
  performanceBonus: z.number().min(0),
});

export const deductionsSchema = z.object({
  pf: z.number().min(0),
  professionalTax: z.number().min(0),
  tds: z.number().min(0),
  esi: z.number().min(0),
  loanRepayments: z.number().min(0),
});

export const salarySlipSchema = z.object({
  employeeDetails: employeeDetailsSchema,
  earnings: salaryComponentsSchema,
  deductions: deductionsSchema,
  netSalary: z.number()
});

// Database Tables
export const salarySlips = pgTable('salary_slips', {
  id: serial('id').primaryKey(),
  employeeDetails: jsonb('employee_details').notNull().$type<z.infer<typeof employeeDetailsSchema>>(),
  earnings: jsonb('earnings').notNull().$type<z.infer<typeof salaryComponentsSchema>>(),
  deductions: jsonb('deductions').notNull().$type<z.infer<typeof deductionsSchema>>(),
  netSalary: integer('net_salary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Types
export type EmployeeDetails = z.infer<typeof employeeDetailsSchema>;
export type SalaryComponents = z.infer<typeof salaryComponentsSchema>;
export type Deductions = z.infer<typeof deductionsSchema>;
export type SalarySlip = z.infer<typeof salarySlipSchema>;

// Insert Types
export const insertSalarySlipSchema = createInsertSchema(salarySlips).omit({ 
  id: true,
  createdAt: true 
});
export type InsertSalarySlip = z.infer<typeof insertSalarySlipSchema>;