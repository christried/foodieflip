import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, RouterLink } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RecipeSubmissionDialog } from './dialogs/recipe-submission-dialog/recipe-submission-dialog';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Foodie Flip');
  protected readonly version = signal('0.2');
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);

  private readonly queryParams = toSignal(this.route.queryParamMap);

  constructor() {
    effect(() => {
      this.queryParams()?.get('dialog') === 'submit' && this.openSubmitDialog();
    });
  }

  openSubmitDialog() {
    const dialogRef = this.dialog.open(RecipeSubmissionDialog, {
      width: '900px',
      maxWidth: '90vw',
      height: '80vh',
    });

    dialogRef.afterClosed().subscribe(() => this.router.navigate(['/']));
  }
}
