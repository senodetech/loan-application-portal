import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApiService } from '../../services/loan-api.service';
import { StaffAuthService, IStaffUser } from '../../services/staff-auth.service';
import { ILoanApplication, IAdminMetrics, ApplicationStatus } from '../../models/loan.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Admin Header & Authenticated Staff Bar -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated Staff Session</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Bank Staff Underwriting Control Center</h2>
        </div>

        <!-- Authenticated Staff Identity & Logout -->
        <div *ngIf="currentStaff" class="flex items-center gap-4 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800">
          <div class="text-left">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-emerald-400">{{ currentStaff.name }}</span>
              <span class="text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">{{ currentStaff.badgeId }}</span>
            </div>
            <span class="text-[10px] text-slate-400 block">{{ currentStaff.role.replace('_', ' ') }}</span>
          </div>
          <button 
            (click)="logout()"
            class="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </div>

      <!-- KPI Metrics Cards -->
      <div *ngIf="metrics" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-400 block uppercase">Total Applications</span>
          <span class="text-2xl font-black text-slate-900">{{ metrics.totalApplications }}</span>
          <span class="text-[11px] text-slate-500 block mt-1">Pipeline: \${{ metrics.totalVolume | number }}</span>
        </div>

        <div class="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span class="text-xs font-semibold text-amber-700 block uppercase">Pending Review</span>
          <span class="text-2xl font-black text-amber-900">{{ metrics.pendingCount }}</span>
          <span class="text-[11px] text-amber-700 block mt-1">Awaiting Underwriter Action</span>
        </div>

        <div class="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span class="text-xs font-semibold text-emerald-700 block uppercase">Approved Volume</span>
          <span class="text-2xl font-black text-emerald-900">\${{ metrics.approvedVolume | number }}</span>
          <span class="text-[11px] text-emerald-700 block mt-1">{{ metrics.approvedCount }} Approved Loans</span>
        </div>

        <div class="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-sm">
          <span class="text-xs font-semibold text-rose-700 block uppercase">Rejected (3-Mo Lock)</span>
          <span class="text-2xl font-black text-rose-900">{{ metrics.rejectedCount }}</span>
          <span class="text-[11px] text-rose-700 block mt-1">{{ metrics.onHoldCount }} On Hold / Docs Requested</span>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div class="flex-1 min-w-[240px]">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            placeholder="Search by Applicant Name, Email, SSN, or ID..."
            class="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-slate-800 focus:outline-none"
          />
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Status:</span>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 font-medium">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div class="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Type:</span>
            <select [(ngModel)]="selectedType" (change)="applyFilters()" class="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 font-medium">
              <option value="ALL">All Loans</option>
              <option value="MORTGAGE">Mortgage</option>
              <option value="AUTO">Auto</option>
              <option value="PERSONAL">Personal</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Application Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th class="px-5 py-3">App ID / Date</th>
                <th class="px-5 py-3">Applicant Profile</th>
                <th class="px-5 py-3">Loan Type & Amount</th>
                <th class="px-5 py-3">Collateral & Term</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3 text-right">Underwrite Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of applications" class="hover:bg-slate-50/80 transition">
                <td class="px-5 py-4 font-mono">
                  <span class="font-bold text-slate-900 block">{{ item.id }}</span>
                  <span class="text-[10px] text-slate-400">{{ item.createdAt | date:'shortDate' }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="font-bold text-slate-800 block">{{ item.applicant.firstName }} {{ item.applicant.lastName }}</span>
                  <span class="text-slate-400 block">{{ item.applicant.email }}</span>
                  <span class="text-[10px] text-slate-400">SSN: ***-**-{{ item.applicant.ssn.slice(-4) }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="font-bold text-slate-900 block">\${{ item.loanAmount | number }}</span>
                  <span class="text-slate-500 uppercase font-semibold text-[10px]">{{ item.loanType }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="text-slate-700 block">Val: \${{ item.propertyValue | number }}</span>
                  <span class="text-slate-400">{{ item.loanTermYears }} yrs term</span>
                </td>
                <td class="px-5 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase" [ngClass]="{
                    'bg-emerald-100 text-emerald-800 border border-emerald-200': item.status === 'APPROVED',
                    'bg-amber-100 text-amber-800 border border-amber-200': item.status === 'PENDING',
                    'bg-rose-100 text-rose-800 border border-rose-200': item.status === 'REJECTED',
                    'bg-sky-100 text-sky-800 border border-sky-200': item.status === 'ON_HOLD'
                  }">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <button 
                    (click)="openReviewModal(item)"
                    class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                  >
                    Review & Decide →
                  </button>
                </td>
              </tr>
              <tr *ngIf="applications.length === 0">
                <td colspan="6" class="text-center py-8 text-slate-400 font-medium">
                  No loan applications found matching the selected criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Review & Decision Modal -->
      <div *ngIf="selectedApp" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="p-6 border-b bg-slate-900 text-white flex justify-between items-center">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">{{ selectedApp.id }}</span>
                <span class="text-xs font-bold uppercase text-emerald-400">{{ selectedApp.loanType }} LOAN</span>
              </div>
              <h3 class="text-lg font-black mt-1">{{ selectedApp.applicant.firstName }} {{ selectedApp.applicant.lastName }}</h3>
            </div>
            <button (click)="selectedApp = null" class="text-slate-400 hover:text-white text-xl font-bold">✕</button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-6 overflow-y-auto space-y-6 text-xs">
            <!-- Key Financial Health Ratios -->
            <div class="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Loan-to-Value (LTV)</span>
                <span class="text-base font-black text-slate-800">{{ calculateLtv(selectedApp) }}%</span>
                <span class="text-[10px] text-emerald-600 block">Down: \${{ selectedApp.downPayment | number }}</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Debt-to-Income (DTI)</span>
                <span class="text-base font-black" [ngClass]="calculateDti(selectedApp) > 45 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ calculateDti(selectedApp) }}%
                </span>
                <span class="text-[10px] text-slate-500 block">Max 50%</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Credit Score Tier</span>
                <span class="text-base font-black text-slate-800">{{ selectedApp.creditScoreTier || 'GOOD' }}</span>
                <span class="text-[10px] text-slate-500 block">Verified Tier A</span>
              </div>
            </div>

            <!-- Employment Details -->
            <div>
              <h4 class="font-bold uppercase text-slate-500 text-[10px] mb-2">Applicant Employment History</h4>
              <div class="space-y-1.5">
                <div *ngFor="let emp of selectedApp.employmentHistory" class="p-3 border rounded-xl flex justify-between items-center">
                  <div>
                    <span class="font-bold text-slate-800">{{ emp.employerName }}</span>
                    <span class="text-slate-500 block">{{ emp.jobTitle }} • {{ emp.yearsEmployed }} years</span>
                  </div>
                  <span class="font-bold text-slate-900">\${{ emp.monthlyGrossIncome | number }}/mo</span>
                </div>
              </div>
            </div>

            <!-- Liabilities Details -->
            <div *ngIf="selectedApp.liabilities.length > 0">
              <h4 class="font-bold uppercase text-slate-500 text-[10px] mb-2">Declared Monthly Liabilities</h4>
              <div class="space-y-1.5">
                <div *ngFor="let lib of selectedApp.liabilities" class="p-3 border rounded-xl flex justify-between items-center bg-rose-50/40">
                  <span class="font-semibold text-slate-700">{{ lib.liabilityType }}</span>
                  <span class="font-bold text-rose-700">\${{ lib.monthlyPayment | number }}/mo</span>
                </div>
              </div>
            </div>

            <!-- Underwriter Decision Form -->
            <div class="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
              <h4 class="font-black text-sm text-emerald-400 uppercase tracking-wider">Staff Underwriting Action</h4>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] text-slate-300 font-semibold mb-1">Approved Amount ($)</label>
                  <input type="number" [(ngModel)]="decisionForm.approvedAmount" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-300 font-semibold mb-1">Assigned Interest Rate (%)</label>
                  <input type="number" step="0.05" [(ngModel)]="decisionForm.approvedRate" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
                </div>
              </div>

              <div>
                <label class="block text-[10px] text-slate-300 font-semibold mb-1">Staff Notes / Reason (Sent to Applicant)</label>
                <textarea 
                  [(ngModel)]="decisionForm.notes" 
                  rows="2" 
                  placeholder="e.g. Approved at prime rate / Missing 2025 W2 / Rejected due to high DTI"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                ></textarea>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-2">
                <button 
                  (click)="submitDecision('APPROVED')"
                  class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                >
                  ✓ Approve Loan
                </button>
                <button 
                  (click)="submitDecision('ON_HOLD')"
                  class="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition"
                >
                  ⏳ Request Docs / Hold
                </button>
                <button 
                  (click)="submitDecision('REJECTED')"
                  class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
                >
                  ✕ Reject (3-Mo Lock)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  applications: ILoanApplication[] = [];
  metrics: IAdminMetrics | null = null;

  selectedStatus: string = 'ALL';
  selectedType: string = 'ALL';
  searchQuery: string = '';

  selectedApp: ILoanApplication | null = null;
  decisionForm = {
    approvedAmount: 0,
    approvedRate: 6.85,
    notes: ''
  };

  currentStaff: IStaffUser | null = null;

  constructor(private api: LoanApiService, private auth: StaffAuthService) {}

  ngOnInit(): void {
    this.currentStaff = this.auth.currentUser;
    this.loadData();
  }

  loadData(): void {
    this.api.getAdminMetrics().subscribe(m => this.metrics = m);
    this.applyFilters();
  }

  applyFilters(): void {
    this.api.getApplications(this.selectedStatus, this.selectedType, this.searchQuery).subscribe(apps => {
      this.applications = apps;
    });
  }

  logout(): void {
    this.auth.logout();
  }

  openReviewModal(app: ILoanApplication): void {
    this.selectedApp = app;
    this.decisionForm = {
      approvedAmount: app.loanAmount,
      approvedRate: 6.85,
      notes: app.decision?.notes || ''
    };
  }

  calculateLtv(app: ILoanApplication): number {
    if (!app.propertyValue) return 0;
    return Math.round((app.loanAmount / app.propertyValue) * 100);
  }

  calculateDti(app: ILoanApplication): number {
    const totalIncome = app.employmentHistory.reduce((s, e) => s + (Number(e.monthlyGrossIncome) || 0), 0);
    const totalDebt = app.liabilities.reduce((s, l) => s + (Number(l.monthlyPayment) || 0), 0);
    if (!totalIncome) return 0;
    return Math.round((totalDebt / totalIncome) * 100);
  }

  submitDecision(status: ApplicationStatus): void {
    if (!this.selectedApp) return;

    const reviewerInfo = this.currentStaff 
      ? `Staff Officer: ${this.currentStaff.name} (${this.currentStaff.role}, Badge: ${this.currentStaff.badgeId})`
      : 'Bank Staff Underwriter';

    this.api.updateApplicationStatus(this.selectedApp.id, {
      status,
      reviewedBy: reviewerInfo,
      notes: this.decisionForm.notes || `Application moved to ${status}`,
      approvedAmount: this.decisionForm.approvedAmount,
      approvedRate: this.decisionForm.approvedRate
    }).subscribe({
      next: (updated) => {
        alert(`Application ${updated.id} successfully marked as ${status}!`);
        this.selectedApp = null;
        this.loadData();
      },
      error: () => alert('Failed to update application decision.')
    });
  }
}
