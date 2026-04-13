import { IApplicant, ILoanApplication } from './loan.model';

export type ApplicantContact = Pick<IApplicant, 'email' | 'phone'>;
export type LoanDraft = Partial<ILoanApplication>;
export type LoanSummary = Omit<ILoanApplication, 'employmentHistory' | 'liabilities'>;

export function isMortgageApplication(loan: ILoanApplication): boolean {
  return loan.loanType === 'MORTGAGE';
}
