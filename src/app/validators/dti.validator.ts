import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const debtToIncomeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const employmentHistory = control.get('employmentHistory')?.value || [];
  const liabilities = control.get('liabilities')?.value || [];

  const totalIncome = employmentHistory.reduce((sum: number, e: any) => sum + (Number(e.monthlyGrossIncome) || 0), 0);
  const totalDebt = liabilities.reduce((sum: number, l: any) => sum + (Number(l.monthlyPayment) || 0), 0);

  if (totalIncome > 0) {
    const dtiRatio = (totalDebt / totalIncome) * 100;
    if (dtiRatio > 50) {
      return { highDtiRatio: { ratio: Math.round(dtiRatio), maxAllowed: 50 } };
    }
  }
  return null;
};
