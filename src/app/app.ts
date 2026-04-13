import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RecipeSubmissionDialog } from './dialogs/recipe-submission-dialog/recipe-submission-dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Foodie Flip');
  protected readonly version = signal('0.2');
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly dialog = inject(MatDialog);

  private readonly queryParams = toSignal(this.route.queryParamMap);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser) {
      this.authService.bootstrapSession().subscribe({
        error: (error) => {
          console.error(error);
        },
      });
    }

    effect(() => {
      if (this.queryParams()?.get('dialog') === 'submit') {
        this.openSubmitDialog();
      }
    });
  }

  openSubmitDialog(): void {
    const dialogRef = this.dialog.open(RecipeSubmissionDialog, {
      width: '95vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      height: 'auto',
      autoFocus: 'first-heading',
      restoreFocus: true,
      ariaLabel: 'Neues Rezept einreichen',
    });

    dialogRef.afterClosed().subscribe(() => this.router.navigate(['/']));
  }
}
