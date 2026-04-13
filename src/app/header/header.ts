import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevFeedbackDialog } from '../dialogs/dev-feedback-dialog/dev-feedback-dialog';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RecipesService } from '../recipes.service';
import { AuthService } from '../auth.service';
import { GoogleIdentityService } from '../google-identity.service';
import { firstValueFrom } from 'rxjs';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly recipesService = inject(RecipesService);
  private readonly authService = inject(AuthService);
  private readonly googleIdentityService = inject(GoogleIdentityService);
  private readonly snackBar = inject(MatSnackBar);

  themeMode = signal<ThemeMode>('dark');
  themeIcon = signal<string>('dark_mode');
  logoSrc = signal('header-logo.webp');
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.user;
  readonly isBootstrappingAuth = this.authService.isBootstrapping;
  readonly isLoginPending = signal(false);
  readonly authMessage = signal('');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly accountLabel = computed(
    () => this.currentUser()?.username ?? this.currentUser()?.email ?? 'Nutzerkonto',
  );
  readonly headerUserName = computed(() => this.currentUser()?.username ?? '');

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('foodieflip-theme') as ThemeMode | null;

    if (saved) {
      this.themeMode.set(saved);
      this.applyTheme(saved);
    } else {
      this.applyTheme('dark');
    }

    void this.googleIdentityService.preload().catch(() => {
      // The user can still retry from the login button; avoid noisy startup errors.
    });
  }

  toggleTheme() {
    const next: ThemeMode = this.themeMode() === 'dark' ? 'light' : 'dark';
    this.themeMode.set(next);
    this.applyTheme(next);
    if (this.isBrowser) {
      localStorage.setItem('foodieflip-theme', next);
    }
  }

  private applyTheme(mode: ThemeMode) {
    const body = this.document.body;
    body.classList.remove('dark-mode', 'light-mode');

    if (mode === 'dark') {
      body.classList.add('dark-mode');
      this.themeIcon.set('dark_mode');
    } else {
      body.classList.add('light-mode');
      this.themeIcon.set('light_mode');
    }
  }

  openDevFeedbackDialog() {
    this.dialog.open(DevFeedbackDialog, {
      height: '46rem',
      width: '34.5rem',
    });
  }

  onClickHero() {
    this.recipesService.clearCurrentRecipe();
  }

  async onClickLoginWithGoogle(): Promise<void> {
    if (!this.isBrowser || this.isLoginPending() || this.isBootstrappingAuth()) {
      return;
    }

    this.authMessage.set('');
    this.isLoginPending.set(true);

    try {
      const credential = await this.googleIdentityService.requestCredential();
      const authResponse = await firstValueFrom(
        this.authService.loginWithGoogleCredential(credential),
      );

      if (authResponse.needsUsername) {
        this.snackBar.open('Login erfolgreich. Bitte Benutzernamen festlegen.', 'OK', {
          duration: 3200,
          verticalPosition: 'top',
        });
        this.authMessage.set('Bitte zuerst einen Benutzernamen festlegen.');
        await this.router.navigate(['/user']);
        return;
      }

      this.authMessage.set('');
      this.snackBar.open('Erfolgreich mit Google angemeldet.', 'OK', {
        duration: 3000,
        verticalPosition: 'top',
      });
      await this.router.navigate(['/user']);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google-Anmeldung konnte nicht gestartet werden.';
      this.authMessage.set(message);
      this.snackBar.open(`Login fehlgeschlagen: ${message}`, 'OK', {
        duration: 3000,
        verticalPosition: 'top',
      });
      console.error(error);
    } finally {
      this.isLoginPending.set(false);
    }
  }

  async onClickLogout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
      this.authMessage.set('');
      this.snackBar.open('Erfolgreich ausgeloggt.', 'OK', {
        duration: 3000,
        verticalPosition: 'top',
      });
      await this.router.navigate(['/']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Abmeldung fehlgeschlagen.';
      this.authMessage.set(message);
      this.snackBar.open(`Logout fehlgeschlagen: ${message}`, 'OK', {
        duration: 3000,
        verticalPosition: 'top',
      });
      console.error(error);
    }
  }
}
