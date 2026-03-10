import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'clipboard-snack-bar',
  templateUrl: 'clipboard-snack-bar.html',
  styles: `
    :host {
      display: flex;
    }
    .remove-icon {
      color: var(--brand-navy);
    }
  `,
  imports: [
    MatButtonModule,
    MatSnackBarLabel,
    MatSnackBarActions,
    MatSnackBarAction,
    MatIconModule,
  ],
})
export class ClipboardSnackBar {
  snackBarRef = inject(MatSnackBarRef);
}
