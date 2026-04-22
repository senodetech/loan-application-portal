import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface IStaffUser {
  email: string;
  name: string;
  role: 'SENIOR_UNDERWRITER' | 'CREDIT_RISK_ANALYST' | 'BRANCH_MANAGER';
  badgeId: string;
  department: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class StaffAuthService {
  private readonly AUTH_STORAGE_KEY = 'NEXIS_CAPITAL_STAFF_SESSION';
  private currentUserSubject = new BehaviorSubject<IStaffUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Authorized Nexis Capital staff credentials
  private readonly authorizedStaff: Array<IStaffUser & { password: string }> = [
    {
      email: 'underwriter@nexiscapital.com',
      password: 'Staff@2026',
      name: 'Sarah Jenkins',
      role: 'SENIOR_UNDERWRITER',
      badgeId: 'NXS-9842',
      department: 'Mortgage & Consumer Credit Risk'
    },
    {
      email: 'manager@nexiscapital.com',
      password: 'Staff@2026',
      name: 'Mark Robinson',
      role: 'BRANCH_MANAGER',
      badgeId: 'NXS-1002',
      department: 'Executive Underwriting Desk'
    },
    {
      email: 'analyst@nexiscapital.com',
      password: 'Staff@2026',
      name: 'Michael Chang',
      role: 'CREDIT_RISK_ANALYST',
      badgeId: 'NXS-4421',
      department: 'Commercial Debt Underwriting'
    }
  ];

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(this.AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUserSubject.next(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not restore staff session', e);
    }
  }

  login(email: string, pass: string): Observable<IStaffUser> {
    const trimmedEmail = email.trim().toLowerCase();
    const staff = this.authorizedStaff.find(
      s => s.email.toLowerCase() === trimmedEmail && s.password === pass
    );

    if (!staff) {
      return throwError(() => new Error('Invalid Nexis Capital staff credentials or unauthorized access.'));
    }

    const { password, ...userProfile } = staff;

    return of(userProfile).pipe(
      delay(400),
      tap(user => {
        this.currentUserSubject.next(user);
        try {
          localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(user));
        } catch {}
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.AUTH_STORAGE_KEY);
    } catch {}
    this.currentUserSubject.next(null);
  }

  get currentUser(): IStaffUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
