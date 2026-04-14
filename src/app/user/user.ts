import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FavoritesService } from '../favorites.service';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,24}$/;

@Component({
  selector: 'app-user',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user.html',
  styleUrls: ['./user.scss', '../pages/pages.scss'],
})
export class User {
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly favorites = this.favoritesService.favorites;
  readonly isLoadingFavorites = this.favoritesService.isLoading;
  readonly isMutatingFavorites = this.favoritesService.isMutating;
  readonly needsUsername = this.authService.needsUsername;
  readonly isSavingUsername = signal(false);
  readonly isEditingUsername = signal(false);
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

  onClickStartUsernameEdit(): void {
    const currentUserName = this.user()?.username ?? '';

    this.usernameError.set('');
    this.usernameCtrl.setValue(currentUserName);
    this.usernameCtrl.markAsPristine();
    this.usernameCtrl.markAsUntouched();
    this.isEditingUsername.set(true);
  }

  onClickCancelUsernameEdit(): void {
    const currentUserName = this.user()?.username ?? '';

    this.usernameError.set('');
    this.usernameCtrl.setValue(currentUserName);
    this.usernameCtrl.markAsPristine();
    this.usernameCtrl.markAsUntouched();
    this.isEditingUsername.set(false);
  }

  onClickSaveUsername(): void {
    const isOnboardingFlow = this.needsUsername();

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
        this.usernameCtrl.markAsPristine();
        this.usernameCtrl.markAsUntouched();

        if (!isOnboardingFlow) {
          this.isEditingUsername.set(false);
        }

        this.snackBar.open(
          isOnboardingFlow
            ? 'Benutzername gespeichert. Profil ist jetzt voll nutzbar.'
            : 'Benutzername aktualisiert.',
          'OK',
          {
            duration: 3000,
            verticalPosition: 'top',
          },
        );
      },
      error: (error) => {
        this.isSavingUsername.set(false);
        this.usernameError.set(
          error instanceof Error ? error.message : 'Benutzername konnte nicht gespeichert werden.',
        );
      },
    });
  }

  onClickRemoveFavorite(recipeId: string): void {
    if (this.isMutatingFavorites()) {
      return;
    }

    this.favoritesService.removeFavorite(recipeId).subscribe({
      next: () => {
        this.snackBar.open('Favorit entfernt.', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
        });
      },
    });
  }

  onClickOpenFavorite(shortTitle: string): void {
    void this.router.navigate(['/recipe', shortTitle]);
  }
}
