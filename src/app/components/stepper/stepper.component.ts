import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  index: number;
  label: string;
  description: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html'
})
export class StepperComponent {
  @Input() currentStep = 1;
  @Input() steps: StepItem[] = [
    { index: 1, label: 'Applicant', description: 'Personal info' },
    { index: 2, label: 'Loan Details', description: 'Amount & terms' },
    { index: 3, label: 'Employment', description: 'Income streams' },
    { index: 4, label: 'Liabilities', description: 'Debts & expenses' },
    { index: 5, label: 'Review', description: 'Final summary' }
  ];
  @Output() stepSelected = new EventEmitter<number>();
}
