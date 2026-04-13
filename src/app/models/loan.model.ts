import type { IApplicant } from './applicant.model';
export type { IApplicant } from './applicant.model';

export type LoanType = 'MORTGAGE' | 'AUTO' | 'PERSONAL' | 'COMMERCIAL';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';

export interface IEmployment {
  employerName: string;
  jobTitle: string;
  yearsEmployed: number;
  monthlyGrossIncome: number;
}

export interface ILiability {
  liabilityType: string;
  monthlyPayment: number;
  remainingBalance: number;
}

export interface IAdminDecision {
  status: ApplicationStatus;
  reviewedBy: string;
  reviewedAt: string;
  notes: string;
  approvedAmount?: number;
  approvedRate?: number;
}

export interface ILoanApplication {
  id: string;
  applicant: IApplicant;
  loanType: LoanType;
  propertyValue: number;
  loanAmount: number;
  downPayment: number;
  loanTermYears: number;
  employmentHistory: IEmployment[];
  liabilities: ILiability[];
  creditScoreTier?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  calculatedEMI?: number;
  status: ApplicationStatus;
  createdAt: string;
  rejectionDate?: string;
  decision?: IAdminDecision;
}

export interface IAdminMetrics {
  totalApplications: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  onHoldCount: number;
  totalVolume: number;
  approvedVolume: number;
}
