import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h4 class="font-bold text-slate-800">Quick EMI Estimator</h4>
      <div>
        <label class="text-xs text-slate-500">Amount: \${{ amount | number }}</label>
        <input type="range" min="50000" max="1000000" step="10000" [(ngModel)]="amount" class="w-full" />
      </div>
      <div>
        <label class="text-xs text-slate-500">Term: {{ years }} Years</label>
        <input type="range" min="5" max="30" step="5" [(ngModel)]="years" class="w-full" />
      </div>
      <div class="p-3 bg-slate-50 rounded text-center">
        <span class="text-xs text-slate-400 block">Estimated Monthly Payment</span>
        <span class="text-xl font-bold text-emerald-600">\${{ calculateEmi() | number }}</span>
      </div>
    </div>
  `
})
export class QuickCalculatorComponent {
  amount = 350000;
  years = 30;
  rate = 6.85;

  calculateEmi(): number {
    const r = (this.rate / 100) / 12;
    const n = this.years * 12;
    return Math.round((this.amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }
}
