import type { SalaryComponents, Deductions, SalarySlip, EmployeeDetails } from "@shared/schema";

export function calculateComponents(grossSalary: number): SalaryComponents {
  return {
    grossSalary,
    basic: Math.round(grossSalary * 0.4),
    hra: Math.round(grossSalary * 0.2),
    da: Math.round(grossSalary * 0.1),
    conveyanceAllowance: Math.round(grossSalary * 0.05),
    medicalAllowance: Math.round(grossSalary * 0.05),
    lta: Math.round(grossSalary * 0.05),
    otherAllowances: Math.round(grossSalary * 0.1),
    performanceBonus: Math.round(grossSalary * 0.05),
  };
}

export function calculateDeductions(components: SalaryComponents): Deductions {
  const { basic, grossSalary } = components;

  return {
    pf: Math.round(basic * 0.12),
    professionalTax: 200,
    tds: Math.round(grossSalary * 0.1),
    esi: Math.round(grossSalary * 0.0075),
    loanRepayments: 0,
  };
}

export function calculateSalarySlip(
  components: SalaryComponents,
  deductions: Deductions,
): Omit<SalarySlip, 'employeeDetails'> {
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

  return {
    earnings: components,
    deductions,
    netSalary: components.grossSalary - totalDeductions,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}