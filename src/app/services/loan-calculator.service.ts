import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoanCalculatorService {
  calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
    if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const totalPayments = termYears * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return Math.round(emi * 100) / 100;
  }
}
