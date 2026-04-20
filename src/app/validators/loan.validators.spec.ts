import { FormControl, FormGroup } from '@angular/forms';
import { loanToValueValidator } from './loan.validators';

describe('loanToValueValidator', () => {
  it('should return error when down payment is less than 10%', () => {
    const form = new FormGroup({
      propertyValue: new FormControl(500000),
      downPayment: new FormControl(20000),
      loanAmount: new FormControl(480000)
    }, { validators: loanToValueValidator });

    expect(form.errors).toEqual({
      insufficientDownPayment: { required: 50000, actual: 20000 }
    });
  });
});
