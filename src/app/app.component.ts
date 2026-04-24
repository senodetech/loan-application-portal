import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantPortalComponent } from './components/applicant-portal/applicant-portal.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { StaffLoginComponent } from './components/staff-login/staff-login.component';
import { LoanApiService } from './services/loan-api.service';
import { StaffAuthService, IStaffUser } from './services/staff-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ApplicantPortalComponent,
    AdminDashboardComponent,
    StaffLoginComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
      <!-- Global Navigation Header -->
      <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div class="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-lg shadow-md">
              N
            </div>
            <div>
              <h1 class="text-base font-black tracking-tight flex items-center gap-2">
                NEXIS CAPITAL <span class="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase">Enterprise LOS</span>
              </h1>
              <p class="text-[11px] text-slate-400">Intelligent Mortgage & Loan Origination Gateway</p>
            </div>
          </div>

          <!-- Dual Portal Switcher -->
          <div class="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button 
              (click)="currentPortal = 'APPLICANT'"
              [ngClass]="currentPortal === 'APPLICANT' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white font-medium'"
              class="px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-2"
            >
              <span>👤</span> Applicant Portal
            </button>
            <button 
              (click)="currentPortal = 'ADMIN'"
              [ngClass]="currentPortal === 'ADMIN' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white font-medium'"
              class="px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-2"
            >
              <span>🏦</span> Bank Staff Portal
              <span *ngIf="pendingReviews > 0" class="w-4 h-4 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
                {{ pendingReviews }}
              </span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Container Area -->
      <main class="max-w-7xl mx-auto w-full p-6 flex-1">
        <!-- VIEW 1: Applicant Portal -->
        <app-applicant-portal *ngIf="currentPortal === 'APPLICANT'"></app-applicant-portal>

        <!-- VIEW 2: Bank Staff Portal (Protected by Authentication) -->
        <div *ngIf="currentPortal === 'ADMIN'">
          <!-- If not logged in -> Show Staff Login Screen -->
          <app-staff-login *ngIf="!currentUser" (authenticated)="onStaffLoggedIn($event)"></app-staff-login>

          <!-- If authenticated -> Show Bank Staff Underwriting Dashboard -->
          <app-admin-dashboard *ngIf="currentUser"></app-admin-dashboard>
        </div>
      </main>

      <!-- Global Footer -->
      <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Nexis Capital LOS • Angular 17 Standalone + Firebase Firestore & Auth SDK + Node.js Mock API
      </footer>
    </div>
  `
})
export class AppComponent implements OnInit {
  currentPortal: 'APPLICANT' | 'ADMIN' = 'APPLICANT';
  pendingReviews = 0;
  currentUser: IStaffUser | null = null;

  constructor(private api: LoanApiService, private auth: StaffAuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.fetchMetrics();
  }

  fetchMetrics(): void {
    this.api.getAdminMetrics().subscribe(m => {
      this.pendingReviews = m.pendingCount;
    });
  }

  onStaffLoggedIn(user: IStaffUser): void {
    this.currentUser = user;
  }
}
