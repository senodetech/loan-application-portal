import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StepperComponent } from '../stepper/stepper.component';
import { StepEmploymentComponent } from '../step-employment/step-employment.component';
import { StepReviewComponent } from '../step-review/step-review.component';
import { QuickCalculatorComponent } from '../quick-calculator/quick-calculator.component';
import { StatusTrackerComponent } from '../status-tracker/status-tracker.component';
import { LoanApiService, IEligibilityResponse } from '../../services/loan-api.service';
import { minimumAgeValidator } from '../../validators/age.validator';
import { loanToValueValidator } from '../../validators/loan.validators';
import { debtToIncomeValidator } from '../../validators/dti.validator';
import { createAsyncSsnValidator } from '../../validators/async-ssn.validator';
import { ILoanApplication } from '../../models/loan.model';

@Component({
  selector: 'app-applicant-portal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepperComponent,
    StepEmploymentComponent,
    StepReviewComponent,
    QuickCalculatorComponent,
    StatusTrackerComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Portal Sub-Header Navigation (Apply vs Track) -->
      <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div class="flex gap-2">
          <button 
            (click)="activeTab = 'APPLY'"
            [ngClass]="activeTab === 'APPLY' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            class="px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2"
          >
            <span>📝</span> Apply for New Loan
          </button>
          <button 
            (click)="activeTab = 'TRACK'"
            [ngClass]="activeTab === 'TRACK' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            class="px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2"
          >
            <span>🔍</span> Track Application & Eligibility
          </button>
        </div>

        <!-- Stored Application Alert Badge -->
        <div *ngIf="lastSubmittedId && activeTab === 'APPLY'" class="flex items-center gap-2 text-xs bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200">
          <span class="font-medium">Recent Application:</span>
          <span class="font-mono font-bold text-slate-900">{{ lastSubmittedId }}</span>
          <span *ngIf="existingPendingApp" class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {{ existingPendingApp.status }}
          </span>
          <button (click)="trackSavedApp(lastSubmittedId)" class="underline text-emerald-700 font-bold ml-1 hover:text-emerald-900">Track Status →</button>
        </div>
      </div>

      <!-- VIEW 1: APPLY FOR LOAN (WIZARD OR PENDING LOCK) -->
      <div *ngIf="activeTab === 'APPLY'" class="space-y-6">
        
        <!-- CASE A: APPLICANT ALREADY HAS A PENDING / ON-HOLD APPLICATION IN PROGRESS (STRICT LOCK) -->
        <div *ngIf="existingPendingApp && (existingPendingApp.status === 'PENDING' || existingPendingApp.status === 'ON_HOLD')" 
             class="bg-white p-8 rounded-3xl border border-amber-200 shadow-lg text-center space-y-5 animate-fadeIn">
          <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
            ⏳
          </div>
          <div class="space-y-2 max-w-lg mx-auto">
            <span class="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full border border-amber-200">
              Active Application In Review
            </span>
            <h3 class="text-2xl font-black text-slate-900">New Submissions Currently Locked</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              You currently have an active application (<strong class="font-mono text-slate-900">{{ existingPendingApp.id }}</strong>) undergoing credit risk assessment.
            </p>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-900 text-left space-y-1">
              <span class="font-bold block text-amber-950">Bank Underwriting Policy:</span>
              <p>Applicants are strictly restricted from submitting a new loan until their pending application has been formally <strong>Approved</strong> or <strong>Rejected</strong> by the underwriting desk.</p>
            </div>
          </div>

          <div class="pt-2 flex justify-center gap-3">
            <button (click)="trackSavedApp(existingPendingApp.id)" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md">
              View & Track Pending Application ({{ existingPendingApp.id }}) →
            </button>
          </div>
        </div>

        <!-- CASE B: 3-MONTH COOLING PERIOD WARNING (REJECTED STATUS) -->
        <div *ngIf="eligibilityResult && eligibilityResult.reason === 'COOLING_PERIOD_ACTIVE'" 
             class="p-5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 flex gap-4 items-start shadow-sm animate-fadeIn">
          <span class="text-2xl">🚫</span>
          <div class="space-y-1">
            <h4 class="font-bold text-sm text-rose-950">Application Blocked: 3-Month Waiting Period Active</h4>
            <p class="text-xs text-rose-800">{{ eligibilityResult.message }}</p>
            <div class="pt-1 flex items-center gap-2">
              <span class="bg-rose-200 text-rose-900 px-2.5 py-1 rounded text-xs font-mono font-bold">
                Lock expires in {{ eligibilityResult.daysRemaining }} days
              </span>
              <button (click)="trackSavedApp(eligibilityResult.previousApplicationId!)" class="text-xs font-bold underline text-rose-950">
                View Rejected Application Dossier
              </button>
            </div>
          </div>
        </div>

        <!-- CASE C: ACTIVE APPLICATION PENDING ALERT FOUND ON SSN TYPING -->
        <div *ngIf="eligibilityResult && eligibilityResult.reason === 'ACTIVE_APPLICATION_PENDING'" 
             class="p-5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex gap-4 items-start shadow-sm animate-fadeIn">
          <span class="text-2xl">⚠️</span>
          <div class="space-y-1">
            <h4 class="font-bold text-sm text-amber-950">Active Pending Application Detected</h4>
            <p class="text-xs text-amber-800">{{ eligibilityResult.message }}</p>
            <div class="pt-1">
              <button (click)="trackSavedApp(eligibilityResult.activeApplicationId!)" class="text-xs font-bold underline text-amber-950">
                Open Pending Application ({{ eligibilityResult.activeApplicationId }}) →
              </button>
            </div>
          </div>
        </div>

        <!-- SUCCESS SCREEN AFTER SUBMISSION -->
        <div *ngIf="submittedApp" class="bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-4 animate-fadeIn">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">✓</div>
          <h3 class="text-2xl font-black text-slate-900">Application Submitted Successfully!</h3>
          <p class="text-xs text-slate-500 max-w-md mx-auto">
            Your application reference number is saved in your local session. Further new applications are paused until staff review completes.
          </p>
          <div class="inline-block bg-slate-900 text-emerald-400 font-mono text-2xl font-black px-6 py-3 rounded-2xl shadow-inner tracking-wider">
            {{ submittedApp.id }}
          </div>
          <div class="pt-2 flex justify-center gap-3">
            <button (click)="trackSavedApp(submittedApp.id)" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition">
              Track Real-Time Status →
            </button>
          </div>
        </div>

        <!-- REGULAR APPLICATION WIZARD (SHOWN ONLY IF NO PENDING LOCK) -->
        <div *ngIf="!submittedApp && (!existingPendingApp || (existingPendingApp.status !== 'PENDING' && existingPendingApp.status !== 'ON_HOLD'))" 
             class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <app-stepper [currentStep]="currentStep" (stepSelected)="goToStep($event)"></app-stepper>

            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <form [formGroup]="loanForm">
                <!-- Step 1: Personal Info -->
                <div *ngIf="currentStep === 1" formGroupName="applicant" class="space-y-4">
                  <div class="flex justify-between items-center border-b pb-3">
                    <h2 class="text-lg font-bold text-slate-800">1. Applicant Personal Details</h2>
                    <span class="text-xs text-slate-400 font-medium">Step 1 of 5</span>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-slate-600">First Name</label>
                      <input formControlName="firstName" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="John" />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Last Name</label>
                      <input formControlName="lastName" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="Doe" />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Email Address</label>
                      <input type="email" formControlName="email" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="john.doe@example.com" />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Phone Number</label>
                      <input formControlName="phone" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="(555) 000-0000" />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600 flex justify-between">
                        <span>SSN / National Tax ID</span>
                        <span class="text-[10px] text-emerald-600">Live Status Check</span>
                      </label>
                      <input 
                        formControlName="ssn" 
                        (blur)="verifyEligibility()"
                        class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm font-mono" 
                        placeholder="123-45-6789" 
                      />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Date of Birth (18+)</label>
                      <input type="date" formControlName="dateOfBirth" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                <!-- Step 2: Loan Specifications -->
                <div *ngIf="currentStep === 2" class="space-y-4">
                  <div class="flex justify-between items-center border-b pb-3">
                    <h2 class="text-lg font-bold text-slate-800">2. Loan Type & Collateral Terms</h2>
                    <span class="text-xs text-slate-400 font-medium">Step 2 of 5</span>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Loan Type</label>
                      <select formControlName="loanType" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm bg-white">
                        <option value="MORTGAGE">Residential Real Estate Mortgage (6.85%)</option>
                        <option value="AUTO">Automobile Vehicle Loan (5.45%)</option>
                        <option value="PERSONAL">Personal Unsecured Loan (9.20%)</option>
                        <option value="COMMERCIAL">Commercial Business Loan (7.75%)</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Property / Asset Value ($)</label>
                      <input type="number" formControlName="propertyValue" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Requested Loan Amount ($)</label>
                      <input type="number" formControlName="loanAmount" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-600">Down Payment ($ - Min 10%)</label>
                      <input type="number" formControlName="downPayment" class="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                <!-- Step 3: Dynamic Employment FormArray -->
                <app-step-employment *ngIf="currentStep === 3" [parentForm]="loanForm"></app-step-employment>

                <!-- Step 4: Liabilities -->
                <div *ngIf="currentStep === 4" class="space-y-4">
                  <div class="flex justify-between items-center border-b pb-3">
                    <h2 class="text-lg font-bold text-slate-800">4. Monthly Liabilities & Debt Profile</h2>
                    <span class="text-xs text-slate-400 font-medium">Step 4 of 5</span>
                  </div>
                  <p class="text-xs text-slate-500">Underwriting calculates your Debt-to-Income (DTI) ratio. Maximum allowed threshold is 50%.</p>
                </div>

                <!-- Step 5: Review & Submit -->
                <app-step-review *ngIf="currentStep === 5" [parentForm]="loanForm"></app-step-review>

                <!-- Navigation Controls -->
                <div class="mt-8 pt-4 border-t flex justify-between items-center">
                  <button 
                    *ngIf="currentStep > 1" 
                    (click)="currentStep = currentStep - 1" 
                    type="button" 
                    class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition"
                  >
                    ← Back
                  </button>
                  <div class="ml-auto">
                    <button 
                      *ngIf="currentStep < 5" 
                      (click)="nextStep()" 
                      [disabled]="eligibilityResult && !eligibilityResult.eligible"
                      type="button" 
                      class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition shadow-sm"
                    >
                      Next Step →
                    </button>
                    <button 
                      *ngIf="currentStep === 5" 
                      (click)="submitApplication()" 
                      [disabled]="eligibilityResult && !eligibilityResult.eligible"
                      type="button" 
                      class="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-xs transition shadow-md"
                    >
                      Submit Application ✓
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Sidebar Estimator -->
          <div class="lg:col-span-1 space-y-6">
            <app-quick-calculator></app-quick-calculator>
          </div>
        </div>
      </div>

      <!-- VIEW 2: TRACK APPLICATION STATUS -->
      <div *ngIf="activeTab === 'TRACK'">
        <app-status-tracker [initialAppId]="trackingTargetId"></app-status-tracker>
      </div>
    </div>
  `
})
export class ApplicantPortalComponent implements OnInit {
  activeTab: 'APPLY' | 'TRACK' = 'APPLY';
  currentStep = 1;
  loanForm!: FormGroup;

  lastSubmittedId: string | null = null;
  existingPendingApp: ILoanApplication | null = null;
  submittedApp: ILoanApplication | null = null;
  trackingTargetId: string | null = null;
  eligibilityResult: IEligibilityResponse | null = null;

  constructor(private fb: FormBuilder, private api: LoanApiService) {}

  ngOnInit(): void {
    this.lastSubmittedId = this.api.getLastApplicationId();
    if (this.lastSubmittedId) {
      this.checkSavedApplicationStatus(this.lastSubmittedId);
    }
    this.initForm();
  }

  checkSavedApplicationStatus(appId: string): void {
    this.api.getApplicationById(appId).subscribe({
      next: (app) => {
        this.existingPendingApp = app;
      },
      error: () => {
        this.existingPendingApp = null;
      }
    });
  }

  initForm(): void {
    this.loanForm = this.fb.group({
      applicant: this.fb.group({
        firstName: ['Alex', Validators.required],
        lastName: ['Mercer', Validators.required],
        email: ['alex.mercer@example.com', [Validators.required, Validators.email]],
        phone: ['(555) 234-5678', Validators.required],
        ssn: ['123-45-6789', [Validators.required], [createAsyncSsnValidator(this.api)]],
        dateOfBirth: ['1992-05-15', [Validators.required, minimumAgeValidator(18)]]
      }),
      loanType: ['MORTGAGE', Validators.required],
      propertyValue: [500000, [Validators.required, Validators.min(10000)]],
      loanAmount: [400000, [Validators.required, Validators.min(5000)]],
      downPayment: [100000, [Validators.required, Validators.min(0)]],
      loanTermYears: [30, Validators.required],
      employmentHistory: this.fb.array([
        this.fb.group({
          employerName: ['Tech Solutions LLC', Validators.required],
          jobTitle: ['Lead Architect', Validators.required],
          yearsEmployed: [4, Validators.required],
          monthlyGrossIncome: [9500, Validators.required]
        })
      ]),
      liabilities: this.fb.array([])
    }, { validators: [loanToValueValidator, debtToIncomeValidator] });
  }

  verifyEligibility(): void {
    const ssn = this.loanForm.get('applicant.ssn')?.value;
    if (ssn) {
      this.api.checkEligibility(ssn).subscribe(res => {
        this.eligibilityResult = res;
      });
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.currentStep === 1) this.verifyEligibility();
    if (this.eligibilityResult && !this.eligibilityResult.eligible) {
      return;
    }
    if (this.currentStep < 5) this.currentStep++;
  }

  submitApplication(): void {
    this.verifyEligibility();
    if (this.eligibilityResult && !this.eligibilityResult.eligible) {
      alert(this.eligibilityResult.message);
      return;
    }

    const payload = {
      ...this.loanForm.value,
      calculatedEMI: Math.round((this.loanForm.value.loanAmount * 0.0065) + 120)
    };

    this.api.submitApplication(payload).subscribe({
      next: (created) => {
        this.submittedApp = created;
        this.lastSubmittedId = created.id;
        this.existingPendingApp = created;
        this.api.saveLastApplicationId(created.id);
      },
      error: (err) => {
        alert(err.error?.message || 'Application submission blocked.');
      }
    });
  }

  trackSavedApp(id: string): void {
    this.trackingTargetId = id;
    this.activeTab = 'TRACK';
  }

  resetForm(): void {
    this.submittedApp = null;
    this.currentStep = 1;
    this.initForm();
  }
}
