import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { RecipeSubmissionDialogStore } from '../recipe-submission-dialog.store';

@Component({
  selector: 'recipe-submission-step-ingredients',
  templateUrl: 'recipe-submission-step-ingredients.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatStepperModule,
  ],
})
export class RecipeSubmissionStepIngredients {
  readonly store = inject(RecipeSubmissionDialogStore);
}
