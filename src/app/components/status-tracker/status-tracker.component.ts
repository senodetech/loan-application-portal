import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApiService } from '../../services/loan-api.service';
import { ILoanApplication } from '../../models/loan.model';

@Component({
  selector: 'app-status-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Search Bar -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 class="text-xl font-bold text-slate-800 mb-1">Check Loan Eligibility & Status</h2>
        <p class="text-xs text-slate-500 mb-4">Enter your Nexis Capital Application Reference Number (e.g., APP-2026-8492) or use your stored session.</p>
        
        <div class="flex gap-3">
          <input 
            type="text" 
            [(ngModel)]="searchAppId" 
            (keyup.enter)="searchApplication()"
            placeholder="Enter Application ID (e.g. APP-2026-8492)" 
            class="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
          />
          <button 
            (click)="searchApplication()" 
            [disabled]="loading || !searchAppId.trim()"
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            <span *ngIf="!loading">Track Application</span>
            <span *ngIf="loading">Searching...</span>
          </button>
        </div>

        <!-- Stored Application Quick Badge -->
        <div *ngIf="lastSavedId" class="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span class="font-medium">Recent Application in Browser:</span>
          <button (click)="searchAppId = lastSavedId; searchApplication()" class="text-emerald-700 font-bold hover:underline">
            {{ lastSavedId }}
          </button>
          <button (click)="clearStored()" class="text-slate-400 hover:text-rose-500 text-xs ml-auto">Clear</button>
        </div>

        <div *ngIf="errorMessage" class="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Application Details Card -->
      <div *ngIf="application" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        <!-- Header Banner by Status -->
        <div class="p-6 border-b" [ngClass]="{
          'bg-emerald-50 border-emerald-100': application.status === 'APPROVED',
          'bg-amber-50 border-amber-100': application.status === 'PENDING',
          'bg-rose-50 border-rose-100': application.status === 'REJECTED',
          'bg-sky-50 border-sky-100': application.status === 'ON_HOLD'
        }">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold px-3 py-1 rounded-full uppercase" [ngClass]="{
                  'bg-emerald-600 text-white': application.status === 'APPROVED',
                  'bg-amber-500 text-white': application.status === 'PENDING',
                  'bg-rose-600 text-white': application.status === 'REJECTED',
                  'bg-sky-600 text-white': application.status === 'ON_HOLD'
                }">
                  {{ application.status === 'ON_HOLD' ? 'ACTION REQUIRED / ON HOLD' : application.status }}
                </span>
                <h3 class="text-lg font-black text-slate-900">{{ application.id }}</h3>
              </div>
              <p class="text-xs text-slate-600 mt-1">Submitted on {{ application.createdAt | date:'mediumDate' }} • {{ application.loanType }} LOAN</p>
            </div>

            <div class="text-right">
              <span class="text-xs text-slate-500 block">Requested Loan</span>
              <span class="text-2xl font-black text-slate-900">\${{ application.loanAmount | number }}</span>
            </div>
          </div>

          <!-- 3-Month Cooling Period Warning for Rejected Loans -->
          <div *ngIf="application.status === 'REJECTED'" class="mt-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
            <div class="font-bold flex items-center gap-1.5 text-rose-700">
              <span>⚠️ 3-Month Cooling Period Enforced</span>
            </div>
            <p>Under Nexis Capital underwriting policy, rejected applications are subject to a mandatory <strong>90-day waiting period</strong> before a new submission can be processed.</p>
            <p *ngIf="coolingDaysRemaining !== null" class="font-semibold text-rose-800">
              Re-application window opens in: <span class="bg-rose-100 px-2 py-0.5 rounded font-mono">{{ coolingDaysRemaining }} Days</span>
            </p>
          </div>

          <!-- Underwriter Decision Notes -->
          <div *ngIf="application.decision" class="mt-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span class="font-bold text-slate-900 block">Nexis Underwriting Remarks:</span>
            <p class="italic text-slate-600">"{{ application.decision.notes }}"</p>
            <span class="text-[10px] text-slate-400 block pt-1">Reviewed by: {{ application.decision.reviewedBy }} • {{ application.decision.reviewedAt | date:'medium' }}</span>
          </div>
        </div>

        <!-- Application Body Details -->
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-400">Applicant</span>
              <p class="text-sm font-bold text-slate-800">{{ application.applicant.firstName }} {{ application.applicant.lastName }}</p>
              <p class="text-xs text-slate-500">{{ application.applicant.email }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-400">Collateral Value</span>
              <p class="text-sm font-bold text-slate-800">\${{ application.propertyValue | number }}</p>
              <p class="text-xs text-slate-500">Down Payment: \${{ application.downPayment | number }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-400">Loan Term</span>
              <p class="text-sm font-bold text-slate-800">{{ application.loanTermYears }} Years</p>
              <p class="text-xs text-slate-500">Tier: {{ application.creditScoreTier || 'GOOD' }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-400">Estimated EMI</span>
              <p class="text-sm font-black text-emerald-700">\${{ application.calculatedEMI | number }}/mo</p>
              <p class="text-xs text-slate-500">Benchmark Rate: 6.85%</p>
            </div>
          </div>

          <!-- Employment Summary -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Verified Employment</h4>
            <div class="space-y-2">
              <div *ngFor="let emp of application.employmentHistory" class="flex justify-between items-center p-3 border rounded-lg text-xs">
                <div>
                  <span class="font-bold text-slate-800">{{ emp.employerName }}</span>
                  <span class="text-slate-500 block">{{ emp.jobTitle }} • {{ emp.yearsEmployed }} yrs</span>
                </div>
                <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">\${{ emp.monthlyGrossIncome | number }}/mo Gross</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatusTrackerComponent implements OnInit {
  @Input() initialAppId: string | null = null;
  @Output() applyNewRequested = new EventEmitter<void>();

  searchAppId = '';
  lastSavedId: string | null = null;
  application: ILoanApplication | null = null;
  loading = false;
  errorMessage = '';
  coolingDaysRemaining: number | null = null;

  constructor(private api: LoanApiService) {}

  ngOnInit(): void {
    this.lastSavedId = this.api.getLastApplicationId();
    if (this.initialAppId) {
      this.searchAppId = this.initialAppId;
      this.searchApplication();
    } else if (this.lastSavedId) {
      this.searchAppId = this.lastSavedId;
      this.searchApplication();
    }
  }

  searchApplication(): void {
    if (!this.searchAppId.trim()) return;
    this.loading = true;
    this.errorMessage = '';
    this.application = null;
    this.coolingDaysRemaining = null;

    this.api.getApplicationById(this.searchAppId.trim()).subscribe({
      next: (app) => {
        this.application = app;
        this.loading = false;
        this.api.saveLastApplicationId(app.id);
        this.lastSavedId = app.id;

        if (app.status === 'REJECTED' && app.rejectionDate) {
          const rejTime = new Date(app.rejectionDate).getTime();
          const coolOff = 90 * 24 * 60 * 60 * 1000;
          const remaining = (rejTime + coolOff) - Date.now();
          if (remaining > 0) {
            this.coolingDaysRemaining = Math.ceil(remaining / (24 * 60 * 60 * 1000));
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || `No application found for reference "${this.searchAppId}".`;
      }
    });
  }

  clearStored(): void {
    this.api.clearLastApplicationId();
    this.lastSavedId = null;
  }
}
