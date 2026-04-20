import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { RecipeSubmissionDialogStore } from '../recipe-submission-dialog.store';

@Component({
  selector: 'recipe-submission-step-recipe-data',
  templateUrl: 'recipe-submission-step-recipe-data.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
  ],
})
export class RecipeSubmissionStepRecipeData {
  readonly store = inject(RecipeSubmissionDialogStore);

  readonly subscriptSizingValue = input.required<'fixed' | 'dynamic'>();
}
