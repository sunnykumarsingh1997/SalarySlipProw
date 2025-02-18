export function generateRandomSalary(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

export function generateRandomPercentage(value: number, minPercent: number, maxPercent: number): number {
  const percentage = Math.random() * (maxPercent - minPercent) + minPercent;
  return Math.round(value * (percentage / 100));
}

export function generateRandomAllowance(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min) * 100;
}
