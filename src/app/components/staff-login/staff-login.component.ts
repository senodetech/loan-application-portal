import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaffAuthService, IStaffUser } from '../../services/staff-auth.service';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto my-8 animate-fadeIn">
      <!-- Security Badge Card -->
      <div class="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner font-black">
            N
          </div>
          <h2 class="text-xl font-black tracking-tight text-white">Nexis Capital Staff Portal</h2>
          <p class="text-xs text-slate-400">Restricted Underwriting & Credit Risk Gateway</p>
        </div>

        <!-- Security Notice -->
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-2">
          <span class="text-emerald-400 text-sm">🛡️</span>
          <span>Encrypted 256-Bit Financial Session • Access Logged</span>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="p-3 bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs font-semibold rounded-xl animate-shake">
          {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4 text-left text-xs">
          <div>
            <label class="block text-slate-300 font-semibold mb-1">Corporate Email</label>
            <input 
              type="email" 
              formControlName="email"
              placeholder="e.g. underwriter@nexiscapital.com"
              class="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Security Password</label>
            <input 
              type="password" 
              formControlName="password"
              placeholder="••••••••••••"
              class="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <button 
            type="submit" 
            [disabled]="loading || loginForm.invalid"
            class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
          >
            <span *ngIf="loading" class="animate-spin text-sm">⟳</span>
            <span>{{ loading ? 'Verifying Nexis Credentials...' : 'Authenticate & Open Dashboard →' }}</span>
          </button>
        </form>

        <!-- Quick 1-Click Demo Credentials Pill -->
        <div class="pt-4 border-t border-slate-800 text-center space-y-2">
          <span class="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Quick Demo Testing Credentials</span>
          <div class="flex justify-center gap-2">
            <button 
              type="button"
              (click)="fillDemo('underwriter@nexiscapital.com', 'Staff@2026')"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-mono transition"
            >
              👤 Senior Underwriter
            </button>
            <button 
              type="button"
              (click)="fillDemo('manager@nexiscapital.com', 'Staff@2026')"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-mono transition"
            >
              👔 Managing Director
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class StaffLoginComponent {
  @Output() authenticated = new EventEmitter<IStaffUser>();

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: StaffAuthService) {
    this.loginForm = this.fb.group({
      email: ['underwriter@nexiscapital.com', [Validators.required, Validators.email]],
      password: ['Staff@2026', Validators.required]
    });
  }

  fillDemo(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
    this.errorMessage = '';
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.loading = false;
        this.authenticated.emit(user);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Authentication failed.';
      }
    });
  }
}
