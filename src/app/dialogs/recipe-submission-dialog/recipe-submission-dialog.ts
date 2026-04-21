import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { RecipesService } from '../../recipes.service';
import { fromEvent } from 'rxjs';
import { RecipeSubmissionDialogStore } from './recipe-submission-dialog.store';
import { RecipeSubmissionStepConfirmation } from './recipe-submission-step-confirmation/recipe-submission-step-confirmation';
import { RecipeSubmissionStepIngredients } from './recipe-submission-step-ingredients/recipe-submission-step-ingredients';
import { RecipeSubmissionStepInstructions } from './recipe-submission-step-instructions/recipe-submission-step-instructions';
import { RecipeSubmissionStepRecipeData } from './recipe-submission-step-recipe-data/recipe-submission-step-recipe-data';

@Component({
  selector: 'recipe-submission-dialog',
  templateUrl: 'recipe-submission-dialog.html',
  styleUrl: 'recipe-submission-dialog.scss',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatStepperModule,
    RecipeSubmissionStepRecipeData,
    RecipeSubmissionStepIngredients,
    RecipeSubmissionStepInstructions,
    RecipeSubmissionStepConfirmation,
  ],
  providers: [RecipeSubmissionDialogStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RecipeSubmissionDialog {
  private readonly dialogRef = inject(MatDialogRef<RecipeSubmissionDialog>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly recipesService = inject(RecipesService);
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(RecipeSubmissionDialogStore);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly viewportWidth = signal(this.isBrowser ? window.innerWidth : 1024);
  readonly stepperOrientation = computed<'horizontal' | 'vertical'>(() =>
    this.viewportWidth() < 768 ? 'vertical' : 'horizontal',
  );
  readonly subscriptSizingValue = computed<'fixed' | 'dynamic'>(() =>
    this.viewportWidth() < 768 ? 'dynamic' : 'fixed',
  );

  readonly showReorderIcon = computed<boolean>(() => this.viewportWidth() >= 768);

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.viewportWidth.set(window.innerWidth));
  }

  onClickSubmit(): void {
    const submission = this.store.createSubmission();

    if (!submission) {
      return;
    }

    this.store.setUploading(true);

    this.recipesService.submitRecipe(submission).subscribe({
      next: () => {
        this.dialogRef.close();
        this.openSnackBar('Danke für deine Einreichung!');
      },
      error: () => {
        this.store.errorMessageFile.set('Etwas ist schiefgelaufen. Bitte versuche es erneut.');
        this.store.setUploading(false);
      },
    });
  }

  private openSnackBar(notificationText: string): void {
    this.snackBar.open(notificationText, 'OK', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}
