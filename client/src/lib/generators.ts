// Indian Employee Data Generators
import { faker } from '@faker-js/faker';

// Constants for generators
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
];

const INDIAN_BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Punjab National Bank', 'Bank of Baroda', 'Canara Bank',
  'Union Bank of India', 'Bank of India', 'Indian Bank'
];

const DEPARTMENTS = [
  'Information Technology', 'Human Resources', 'Finance', 'Operations',
  'Sales', 'Marketing', 'Research & Development', 'Administration',
  'Customer Support', 'Legal'
];

const DESIGNATIONS = [
  'Software Engineer', 'Senior Manager', 'Project Lead',
  'Business Analyst', 'Product Manager', 'Technical Architect',
  'System Administrator', 'Quality Analyst', 'Team Lead',
  'Associate Consultant'
];

// Helper function to generate random string of given length
function generateRandomString(length: number, type: 'numeric' | 'alpha' | 'alphanumeric' = 'alphanumeric'): string {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeric = '0123456789';
  const chars = type === 'alpha' ? alpha : 
                type === 'numeric' ? numeric : 
                alpha + numeric;
  
  return Array.from(
    { length }, 
    () => chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

// 1. Employee ID Generator
export function generateEmployeeId(): string {
  return `EMP${generateRandomString(6, 'numeric')}`;
}

// 2. TAN Number Generator
export function generateTAN(): string {
  return `${generateRandomString(4, 'alpha')}${generateRandomString(5, 'numeric')}${generateRandomString(1, 'alpha')}`;
}

// 3. PAN Number Generator
export function generatePAN(): string {
  return `${generateRandomString(5, 'alpha')}${generateRandomString(4, 'numeric')}${generateRandomString(1, 'alpha')}`;
}

// 4. Credit Card Generator with Luhn Algorithm
export function generateCreditCard(bin: string): string {
  if (bin.length !== 6 || !/^\d+$/.test(bin)) {
    throw new Error('BIN must be 6 digits');
  }

  let number = bin;
  while (number.length < 15) {
    number += Math.floor(Math.random() * 10);
  }

  // Luhn Algorithm for check digit
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = ((Math.floor(sum / 10) + 1) * 10 - sum) % 10;
  return number + checkDigit;
}

// 5. PF Account Number Generator
export function generatePFNumber(): string {
  const region = generateRandomString(2, 'alpha');
  const establishment = generateRandomString(3, 'numeric');
  const account = generateRandomString(7, 'numeric');
  const extension = '000';
  const control = generateRandomString(4, 'numeric');
  
  return `${region}/${establishment}/${account}/${extension}/${control}`;
}

// 6. ESI ID Generator
export function generateESINumber(): string {
  return generateRandomString(17, 'numeric');
}

// 7. Employee Designation and Department Generator
export function generateDesignationAndDepartment(): { designation: string; department: string } {
  return {
    designation: DESIGNATIONS[Math.floor(Math.random() * DESIGNATIONS.length)],
    department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]
  };
}

// 8. Bank Name Generator
export function generateBankName(): string {
  return INDIAN_BANKS[Math.floor(Math.random() * INDIAN_BANKS.length)];
}

// 9. Bank Account and IFSC Generator
export function generateBankDetails(): { accountNumber: string; ifscCode: string } {
  const bankCode = INDIAN_BANKS[Math.floor(Math.random() * INDIAN_BANKS.length)]
    .split(' ')[0]
    .toUpperCase();
  
  return {
    accountNumber: generateRandomString(11, 'numeric'),
    ifscCode: `${bankCode}0${generateRandomString(6, 'numeric')}`
  };
}

// 10. Employee Location Generator
export function generateLocation(): string {
  return INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
}

// 11. Email and Password Generator
export function generateEmailAndPassword(employeeId: string): { email: string; password: string } {
  const emailId = employeeId.toLowerCase();
  return {
    email: `${emailId}@company.com`,
    password: `${generateRandomString(8, 'alphanumeric')}#${generateRandomString(2, 'numeric')}`
  };
}
