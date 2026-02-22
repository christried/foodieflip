import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { combineLatest, merge } from 'rxjs';
import { FeedbackService } from '../../feedback.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dev-feedback.dialog',
  templateUrl: 'dev-feedback-dialog.html',
  styleUrl: 'dev-feedback-dialog.scss',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    TextFieldModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevFeedbackDialog {
  private readonly dialogRef = inject(MatDialogRef<DevFeedbackDialog>);
  private readonly feedbackService = inject(FeedbackService);
  private devFeedbackSnackBar = inject(MatSnackBar);

  readonly feedback = new FormControl('', [Validators.required, Validators.maxLength(1000)]);
  readonly name = new FormControl('', []);
  errorMessage = signal<string>('');

  constructor() {
    merge(this.feedback.statusChanges, this.feedback.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
    // effect(() => {
    //   const changes = [this.feedback.statusChanges, this.feedback.valueChanges];
    //   this.updateErrorMessage();
    // });
  }

  updateErrorMessage() {
    if (this.feedback.hasError('required')) {
      this.errorMessage.set('You must enter feedback to submit');
    } else if (this.feedback.hasError('maxlength')) {
      this.errorMessage.set('Please keep your feedback below 1000 characters before sending');
    } else {
      this.errorMessage.set('');
    }
  }

  openSnackBar() {
    this.devFeedbackSnackBar.openFromComponent(DevFeedbackSnackBarComponent, {
      duration: 5000,
      verticalPosition: 'top',
    });
  }

  onClickSend() {
    if (this.feedback.invalid) {
      this.feedback.markAsTouched();
      return;
    }

    const nameValue = this.name.value ?? 'anonymous';
    const feedbackValue = this.feedback.value ?? '';

    this.dialogRef.close();
    this.openSnackBar();
    // shoot and forget for now, no backend response needed
    this.feedbackService.sendFeedback(nameValue, feedbackValue).subscribe();
  }
}

@Component({
  selector: 'dev-feedback-snack-bar',
  templateUrl: 'dev-feedback-snack-bar.html',
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
export class DevFeedbackSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
