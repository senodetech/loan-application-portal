import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILoanApplication, IAdminMetrics, IAdminDecision } from '../models/loan.model';

export interface IEligibilityResponse {
  eligible: boolean;
  message: string;
  reason?: 'ACTIVE_APPLICATION_PENDING' | 'COOLING_PERIOD_ACTIVE';
  activeApplicationId?: string;
  status?: string;
  daysRemaining?: number;
  eligibleDate?: string;
  previousApplicationId?: string;
}

@Injectable({ providedIn: 'root' })
export class LoanApiService {
  private readonly baseUrl = 'http://localhost:3000/api';
  private readonly STORAGE_KEY = 'NEXIS_CAPITAL_LAST_LOAN_APP_ID';

  constructor(private http: HttpClient) {}

  getRates(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.baseUrl}/rates`);
  }

  verifySsn(ssn: string): Observable<{ valid: boolean; riskScore?: string }> {
    return this.http.post<{ valid: boolean; riskScore?: string }>(`${this.baseUrl}/verify-ssn`, { ssn });
  }

  checkEligibility(ssn: string): Observable<IEligibilityResponse> {
    return this.http.get<IEligibilityResponse>(`${this.baseUrl}/eligibility-check/${encodeURIComponent(ssn)}`);
  }

  submitApplication(data: Partial<ILoanApplication>): Observable<ILoanApplication> {
    return this.http.post<ILoanApplication>(`${this.baseUrl}/applications`, data);
  }

  getApplications(status?: string, loanType?: string, search?: string): Observable<ILoanApplication[]> {
    let params = new HttpParams();
    if (status && status !== 'ALL') params = params.set('status', status);
    if (loanType && loanType !== 'ALL') params = params.set('loanType', loanType);
    if (search) params = params.set('search', search);

    return this.http.get<ILoanApplication[]>(`${this.baseUrl}/applications`, { params });
  }

  getApplicationById(id: string): Observable<ILoanApplication> {
    return this.http.get<ILoanApplication>(`${this.baseUrl}/applications/${encodeURIComponent(id)}`);
  }

  getAdminMetrics(): Observable<IAdminMetrics> {
    return this.http.get<IAdminMetrics>(`${this.baseUrl}/admin/metrics`);
  }

  updateApplicationStatus(id: string, decision: Partial<IAdminDecision>): Observable<ILoanApplication> {
    return this.http.patch<ILoanApplication>(`${this.baseUrl}/applications/${encodeURIComponent(id)}/status`, decision);
  }

  saveLastApplicationId(id: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, id);
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  }

  getLastApplicationId(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  clearLastApplicationId(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
  }
}
