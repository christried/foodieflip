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
  selector: 'recipe-submission-snack-bar',
  templateUrl: 'recipe-submission-snack-bar.html',
  styles: `
    :host {
      display: flex;
    }
    .remove-icon {
      color: black;
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
export class RecipeSubmissionSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
