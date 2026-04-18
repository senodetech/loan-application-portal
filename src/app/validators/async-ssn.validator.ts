import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { LoanApiService } from '../services/loan-api.service';

export function createAsyncSsnValidator(api: LoanApiService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.length < 9) return of(null);
    return timer(400).pipe(
      switchMap(() => api.verifySsn(control.value)),
      map(res => (res.valid ? null : { ssnBlacklisted: true })),
      catchError(() => of({ ssnLookupFailed: true }))
    );
  };
}
