import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const loanToValueValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const propertyValue = control.get('propertyValue')?.value || 0;
  const downPayment = control.get('downPayment')?.value || 0;

  if (propertyValue > 0 && downPayment > 0) {
    const minDown = propertyValue * 0.10;
    if (downPayment < minDown) {
      return { insufficientDownPayment: { required: minDown, actual: downPayment } };
    }
  }
  return null;
};
