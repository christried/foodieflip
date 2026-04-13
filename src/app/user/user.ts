import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,24}$/;

@Component({
  selector: 'app-user',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user.html',
  styleUrls: ['./user.scss', '../pages/pages.scss'],
})
export class User {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly needsUsername = this.authService.needsUsername;
  readonly isSavingUsername = signal(false);
  readonly usernameError = signal('');

  readonly usernameForm = this.fb.group({
    usernameCtrl: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(USERNAME_PATTERN),
    ]),
  });

  readonly usernameCtrl = this.usernameForm.controls.usernameCtrl;
  readonly usernameFormStatus = toSignal(this.usernameForm.statusChanges, {
    initialValue: this.usernameForm.status,
  });
  readonly canSaveUsername = computed(
    () => this.usernameFormStatus() === 'VALID' && !this.isSavingUsername(),
  );

  showUsernameRequiredError(): boolean {
    const show = this.usernameCtrl.touched || this.usernameCtrl.dirty;
    return show && this.usernameCtrl.hasError('required');
  }

  showUsernamePatternError(): boolean {
    const show = this.usernameCtrl.touched || this.usernameCtrl.dirty;
    return show && this.usernameCtrl.hasError('pattern');
  }

  onUsernameInput(): void {
    if (this.usernameError()) {
      this.usernameError.set('');
    }
  }

  onClickSaveUsername(): void {
    this.usernameError.set('');

    if (!this.usernameForm.valid) {
      this.usernameCtrl.markAsTouched();
      return;
    }

    const username = this.usernameCtrl.value.trim();

    if (!username) {
      this.usernameCtrl.markAsTouched();
      return;
    }

    this.isSavingUsername.set(true);

    this.authService.updateUsername(username).subscribe({
      next: (response) => {
        this.isSavingUsername.set(false);
        this.usernameCtrl.setValue(response.user.username ?? username);
        this.snackBar.open('Benutzername gespeichert. Profil ist jetzt voll nutzbar.', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        this.isSavingUsername.set(false);
        this.usernameError.set(
          error instanceof Error ? error.message : 'Benutzername konnte nicht gespeichert werden.',
        );
      },
    });
  }
}
