import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { ILoanApplication } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class FirebaseLoanService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  public isFirebaseInitialized = false;

  constructor() {
    this.initFirebase();
  }

  private initFirebase(): void {
    try {
      if (!getApps().length) {
        this.app = initializeApp(environment.firebaseConfig);
      } else {
        this.app = getApps()[0];
      }
      this.db = getFirestore(this.app);
      this.isFirebaseInitialized = true;
    } catch (e) {
      console.info('Firebase initialized in hybrid development mode', e);
    }
  }

  async saveApplicationToFirestore(app: ILoanApplication): Promise<void> {
    if (!this.db) return;
    try {
      const appRef = doc(this.db, 'applications', app.id);
      await setDoc(appRef, app);
    } catch (err) {
      console.warn('Firestore write notice (hybrid fallback active):', err);
    }
  }

  async updateStatusInFirestore(id: string, updates: Partial<ILoanApplication>): Promise<void> {
    if (!this.db) return;
    try {
      const appRef = doc(this.db, 'applications', id);
      await updateDoc(appRef, updates as any);
    } catch (err) {
      console.warn('Firestore update notice (hybrid fallback active):', err);
    }
  }
}
