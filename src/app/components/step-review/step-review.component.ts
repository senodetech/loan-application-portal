import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h3 class="text-xl font-bold text-slate-800">Application Summary & Verification</h3>
      <div class="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-slate-500">Applicant:</span> <strong>{{ parentForm.value.applicant?.firstName }} {{ parentForm.value.applicant?.lastName }}</strong></div>
          <div><span class="text-slate-500">Loan Type:</span> <strong class="uppercase text-emerald-700">{{ parentForm.value.loanType }}</strong></div>
          <div><span class="text-slate-500">Requested Amount:</span> <strong>\${{ parentForm.value.loanAmount | number }}</strong></div>
          <div><span class="text-slate-500">Down Payment:</span> <strong>\${{ parentForm.value.downPayment | number }}</strong></div>
        </div>
      </div>
    </div>
  `
})
export class StepReviewComponent {
  @Input() parentForm!: FormGroup;
}
