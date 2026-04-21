import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { RecipeSubmissionDialogStore } from '../recipe-submission-dialog.store';

@Component({
  selector: 'recipe-submission-step-confirmation',
  templateUrl: 'recipe-submission-step-confirmation.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatStepperModule],
})
export class RecipeSubmissionStepConfirmation {
  readonly store = inject(RecipeSubmissionDialogStore);
}
