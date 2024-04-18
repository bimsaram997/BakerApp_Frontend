import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export class CustomValidators {
    static nonNegative(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const value = control.value;
            if (value < 0) {
                return { 'nonNegative': true };
            }
            return null;
        };
    }
}
