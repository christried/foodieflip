// necessary to enforce name@provider.domain pattern for contact form because ng default also allows local emails and i dont want that

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    // require handles empty values
    if (!value) {
      return null;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(value);

    return isValid ? null : { strictEmail: true };
  };
}
