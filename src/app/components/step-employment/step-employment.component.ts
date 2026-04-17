import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-step-employment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="parentForm" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-800">Employment & Income Streams</h3>
        <button type="button" (click)="addEmployer()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium">
          + Add Employer
        </button>
      </div>
      <div formArrayName="employmentHistory" class="space-y-3">
        <div *ngFor="let emp of employmentArray.controls; let i = index" [formGroupName]="i" class="p-4 bg-slate-50 border rounded-lg relative">
          <button *ngIf="employmentArray.length > 1" (click)="removeEmployer(i)" type="button" class="absolute top-2 right-2 text-rose-600 text-sm font-semibold">✕ Remove</button>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600">Employer Name</label>
              <input formControlName="employerName" class="w-full mt-1 border px-3 py-2 rounded text-sm" placeholder="Acme Corp" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600">Monthly Gross ($)</label>
              <input type="number" formControlName="monthlyGrossIncome" class="w-full mt-1 border px-3 py-2 rounded text-sm" placeholder="7500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StepEmploymentComponent {
  @Input() parentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  get employmentArray(): FormArray {
    return this.parentForm.get('employmentHistory') as FormArray;
  }

  addEmployer(): void {
    this.employmentArray.push(this.fb.group({
      employerName: ['', Validators.required],
      jobTitle: ['Software Engineer', Validators.required],
      yearsEmployed: [2, [Validators.required, Validators.min(0)]],
      monthlyGrossIncome: [6000, [Validators.required, Validators.min(500)]]
    }));
  }

  removeEmployer(i: number): void {
    this.employmentArray.removeAt(i);
  }
}
