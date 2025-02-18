import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, RefreshCcw, Printer, User, Building2, BriefcaseBusiness, ExternalLink } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { salaryComponentsSchema, type SalaryComponents, type SalarySlip, type EmployeeDetails } from "@shared/schema";
import { calculateComponents, calculateDeductions, calculateSalarySlip, formatCurrency } from "@/lib/calculations";
import { generateRandomSalary } from "@/lib/random-generator";
import { apiRequest } from "@/lib/api";
import {
  generateEmployeeId,
  generateTAN,
  generatePAN,
  generatePFNumber,
  generateESINumber,
  generateDesignationAndDepartment,
  generateBankName,
  generateBankDetails,
  generateLocation,
  generateEmailAndPassword
} from "@/lib/generators";

export default function SalaryCalculator() {
  const { toast } = useToast();
  const componentRef = useRef<HTMLDivElement>(null);
  const [salarySlip, setSalarySlip] = useState<SalarySlip | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);

  const form = useForm<SalaryComponents>({
    resolver: zodResolver(salaryComponentsSchema),
    defaultValues: {
      grossSalary: 0,
      basic: 0,
      hra: 0,
      da: 0,
      conveyanceAllowance: 0,
      medicalAllowance: 0,
      lta: 0,
      otherAllowances: 0,
      performanceBonus: 0,
    },
  });

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Salary Slip',
    onBeforeGetContent: async () => {
      if (!componentRef.current) {
        throw new Error("Print content not ready");
      }
    },
  });

  const generateEmployeeDetails = () => {
    const employeeId = generateEmployeeId();
    const { designation, department } = generateDesignationAndDepartment();
    const bankName = generateBankName();
    const { accountNumber, ifscCode } = generateBankDetails();
    const { email } = generateEmailAndPassword(employeeId);

    const details: EmployeeDetails = {
      employeeId,
      tan: generateTAN(),
      pan: generatePAN(),
      pfNumber: generatePFNumber(),
      esiNumber: generateESINumber(),
      designation,
      department,
      bankName,
      accountNumber,
      ifscCode,
      location: generateLocation(),
      email,
    };

    setEmployeeDetails(details);
    return details;
  };

  const onSubmit = async (data: SalaryComponents) => {
    try {
      const components = calculateComponents(data.grossSalary);
      const deductions = calculateDeductions(components);
      const details = employeeDetails || generateEmployeeDetails();
      const calculatedSlip = calculateSalarySlip(components, deductions);

      const slip: SalarySlip = {
        employeeDetails: details,
        earnings: components,
        deductions: deductions,
        netSalary: calculatedSlip.netSalary
      };

      setSalarySlip(slip);

      // Save to database
      await apiRequest('POST', '/api/salary-slips', {
        employeeDetails: details,
        earnings: components,
        deductions: deductions,
        netSalary: calculatedSlip.netSalary
      });

      toast({
        title: "Salary slip generated and saved successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error generating salary slip",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const generateRandomValues = () => {
    const grossSalary = generateRandomSalary(300000, 2000000);
    form.setValue("grossSalary", grossSalary);
    generateEmployeeDetails();
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-[#2C5282]">
              <Calculator className="h-6 w-6" />
              Indian Salary Slip Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grossSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Salary (₹)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateRandomValues}
                            className="whitespace-nowrap"
                          >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Generate Random
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-[#2C5282] hover:bg-[#2A4365]">
                    Calculate Salary Slip
                  </Button>
                  {salarySlip && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handlePrint()}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Salary Slip
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Salary Slip */}
        {salarySlip && (
          <div ref={componentRef} className="bg-white">
            <Card className="print:shadow-none">
              <CardHeader className="border-b border-gray-200 print:border-gray-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <BriefcaseBusiness className="h-12 w-12 text-[#2C5282]" />
                  <div>
                    <h1 className="text-2xl font-bold text-[#2C5282]">Company Name</h1>
                    <p className="text-sm text-gray-600">Salary Slip for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Employee Details */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#2C5282] border-b pb-2">
                    <User className="h-5 w-5" />
                    Employee Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Employee ID:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.employeeId}</span>
                        <span className="text-gray-600">PAN:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.pan}</span>
                        <span className="text-gray-600">TAN:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.tan}</span>
                        <span className="text-gray-600">PF Number:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.pfNumber}</span>
                        <span className="text-gray-600">ESI Number:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.esiNumber}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Designation:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.designation}</span>
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.department}</span>
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.location}</span>
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{salarySlip.employeeDetails.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#2C5282] border-b pb-2">
                    <Building2 className="h-5 w-5" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium">{salarySlip.employeeDetails.bankName}</span>
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium">{salarySlip.employeeDetails.accountNumber}</span>
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-medium">{salarySlip.employeeDetails.ifscCode}</span>
                    </div>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Earnings */}
                  <div>
                    <h3 className="font-semibold mb-4 text-[#2C5282] border-b pb-2">Earnings</h3>
                    <div className="space-y-3">
                      {Object.entries(salarySlip.earnings).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium text-[#48BB78]">{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="font-semibold mb-4 text-[#2C5282] border-b pb-2">Deductions</h3>
                    <div className="space-y-3">
                      {Object.entries(salarySlip.deductions).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium text-[#E53E3E]">{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#2C5282]">Net Salary</span>
                    <span className="text-lg font-bold">{formatCurrency(salarySlip.netSalary)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 pt-8 border-t">
                  <p>This is a computer-generated salary slip and does not require a signature.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* HRMware Reference Section */}
        <Card className="bg-gradient-to-r from-[#2C5282]/5 to-[#2C5282]/10">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-xl font-semibold text-[#2C5282]">Looking for More Options?</h2>
              <p className="text-gray-600 max-w-2xl">
                Check out HRMware's Payslip Generator for additional features and functionalities. 
                Visit their website to explore more HR management tools and services.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.open('https://www.hrmware.com/payslip-generator', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit HRMware Payslip Generator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}