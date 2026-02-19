import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DevFeedbackDialog } from '../dialogs/dev-feedback-dialog/dev-feedback-dialog';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly dialog = inject(MatDialog);

  openDevFeedbackDialog() {
    this.dialog.open(DevFeedbackDialog, {
      height: '46rem',
      width: '34.5rem',
    });
  }
}
