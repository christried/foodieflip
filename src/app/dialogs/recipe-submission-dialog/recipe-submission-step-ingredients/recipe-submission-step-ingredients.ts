import { Component, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { RecipeSubmissionDialogStore } from '../recipe-submission-dialog.store';

import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

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
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
  ],
})
export class RecipeSubmissionStepIngredients {
  readonly store = inject(RecipeSubmissionDialogStore);
  readonly showReorderIcon = input.required<boolean>();

  onItemDropped(event: CdkDragDrop<FormControl<string>[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.store.ingredientsFormGroup.updateValueAndValidity();
  }
}
