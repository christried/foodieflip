import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../../contact.service';
import { strictEmailValidator } from '../../validators/email-strict.validator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss', '../pages.scss'],
})
export class Contact {
  private contactService = inject(ContactService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly submitError = signal('');

  readonly contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, strictEmailValidator()]],
    subject: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  onSubmit() {
    this.submitError.set('');

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const value = this.contactForm.getRawValue();

    if (!value.name || !value.email || !value.subject || !value.message) {
      this.submitError.set('Please fill in all required fields.');
      this.isSubmitting.set(false);
      return;
    }

    this.isSubmitting.set(true);

    this.contactService
      .sendMessage({
        name: value.name,
        email: value.email,
        subject: value.subject,
        message: value.message,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.contactForm.reset();
          this.router.navigate(['/']);

          this.snackBar.open('Message sent! Thank you for contacting us.', 'OK', {
            duration: 5000,
          });
        },
        error: (err) => {
          console.error('Contact send error', err);
          this.isSubmitting.set(false);
          this.submitError.set('Could not send message. Try again later.');
        },
      });
  }
}
