import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { RecipeSubmissionSnackBarComponent } from './recipe-submission-snack-bar';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

// config for form validation
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const MIN_INGREDIENTS = 2;
const MIN_INSTRUCTIONS = 2;

@Component({
  selector: 'recipe-submission-dialog',
  templateUrl: 'recipe-submission-dialog.html',
  styleUrl: 'recipe-submission-dialog.scss',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeSubmissionDialog {
  private readonly dialogRef = inject(MatDialogRef<RecipeSubmissionDialog>);

  private readonly recipesService = inject(RecipesService);
  private readonly snackBar = inject(MatSnackBar);

  public ingredients = signal<string[]>([]);
  public instructions = signal<string[]>([]);

  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  errorMessageFile = signal<string>('');

  visitedSteps = signal<Set<number>>(new Set([0]));

  private _formBuilder = inject(FormBuilder);

  titleIngredientsFormGroup: FormGroup = this._formBuilder.group({
    titleCtrl: ['', Validators.required],
    ingredientsCtrl: [''],
    ingredientsCountCtrl: [0, [Validators.required, Validators.min(MIN_INGREDIENTS)]],
  });
  instructionsTimeFormGroup: FormGroup = this._formBuilder.group({
    instructionsCtrl: [''],
    timeCtrl: ['', [Validators.required, Validators.min(5), Validators.max(999)]],
    instructionsCountCtrl: [0, [Validators.required, Validators.min(MIN_INSTRUCTIONS)]],
  });
  userNameImageFormGroup: FormGroup = this._formBuilder.group({
    userNameCtrl: [''],
    termsAcceptedCtrl: [false, Validators.requiredTrue],
  });

  ingredientsCtrl = this.titleIngredientsFormGroup.get('ingredientsCtrl');
  instructionsCtrl = this.instructionsTimeFormGroup.get('instructionsCtrl');

  // Value Changes of the Checkbox aren't a signal initially,
  // but can be converted to one to be then used in computed formErrors
  private readonly termsAccepted = toSignal(
    this.userNameImageFormGroup.get('termsAcceptedCtrl')!.valueChanges,
    { initialValue: false },
  );

  formErrors = computed<string[]>(() => {
    const errors: string[] = [];
    const visited = this.visitedSteps();

    // Step 0 validation
    if (visited.has(0)) {
      const titleCtrl = this.titleIngredientsFormGroup.get('titleCtrl');
      if (!titleCtrl?.value?.trim()) {
        errors.push('a title');
      }
      if (this.ingredients().length < MIN_INGREDIENTS) {
        errors.push(`at least ${MIN_INGREDIENTS} ingredients`);
      }
    }

    // Step 1 validation
    if (visited.has(1)) {
      const timeCtrl = this.instructionsTimeFormGroup.get('timeCtrl');
      if (!timeCtrl?.value || timeCtrl.invalid) {
        errors.push('a valid prep time (5 to 999 min)');
      }
      if (this.instructions().length < MIN_INSTRUCTIONS) {
        errors.push(`at least ${MIN_INSTRUCTIONS} instructions`);
      }
    }

    // Step 2 validation
    if (visited.has(2)) {
      if (!this.termsAccepted()) {
        errors.push('accepted the terms of service');
      }
    }

    return errors;
  });

  formErrorMessage = computed<string>(() => {
    const errors = this.formErrors();
    const tosError = this.visitedSteps().has(2) && !this.termsAccepted();

    const recipeErrors = errors.filter((e) => e !== 'accepted the terms of service');

    let message = '';

    if (recipeErrors.length === 1) {
      message = `Your new recipe has to have ${recipeErrors[0]}.`;
    } else if (recipeErrors.length > 1) {
      const last = recipeErrors[recipeErrors.length - 1];
      const rest = recipeErrors.slice(0, -1).join(', ');
      message = `Your new recipe has to have ${rest}, and ${last}.`;
    }

    if (tosError) {
      message += (message ? ' ' : '') + 'You must accept the Terms of Service before submitting.';
    }

    return message;
  });

  canSubmit = computed<boolean>(() => {
    // All steps must have been visited and no errors remain, then submission should be possible
    return (
      this.visitedSteps().has(0) &&
      this.visitedSteps().has(1) &&
      this.visitedSteps().has(2) &&
      this.formErrors().length === 0 &&
      !this.isUploading()
    );
  });

  onStepChange(index: number) {
    this.visitedSteps.update((s) => {
      const next = new Set(s);
      next.add(index);
      return next;
    });
  }

  onClickAddItem(itemType: 'ingredient' | 'instruction') {
    const inputValue =
      itemType === 'ingredient' ? this.ingredientsCtrl?.value : this.instructionsCtrl?.value;

    if (!inputValue) {
      return;
    }

    if (itemType === 'ingredient') {
      this.ingredients.update((i) => [...i, inputValue]);
      this.ingredientsCtrl?.setValue('');
    } else {
      this.instructions.update((i) => [...i, inputValue]);
      this.instructionsCtrl?.setValue('');
    }

    this.syncCountControls();
  }

  onClickRemoveItem(itemIndex: number, itemType: 'ingredient' | 'instruction') {
    if (itemType === 'ingredient') {
      this.ingredients.update((ingredients) => ingredients.toSpliced(itemIndex, 1));
    } else {
      this.instructions.update((instructions) => instructions.toSpliced(itemIndex, 1));
    }

    this.syncCountControls();
  }

  // Stepper validates through FormControls. The Ingredients/Instructions are stored in signals.
  // This + setting up hidden form controls, that just hold the lengths allows
  // validation of them (minimum of 2 currently)
  private syncCountControls() {
    this.titleIngredientsFormGroup.get('ingredientsCountCtrl')?.setValue(this.ingredients().length);
    this.instructionsTimeFormGroup
      .get('instructionsCountCtrl')
      ?.setValue(this.instructions().length);
  }

  // File Stuff

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        this.errorMessageFile.set('Only JPEG, PNG, and WEBP images are supported.');
        this.selectedFile.set(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.errorMessageFile.set('Image must be under 2 MB.');
        this.selectedFile.set(null);
        return;
      }
    }

    this.selectedFile.set(file);
    this.errorMessageFile.set('');
  }

  onClickSubmit() {
    const title = this.titleIngredientsFormGroup.get('titleCtrl')?.value?.trim();
    const time = this.instructionsTimeFormGroup.get('timeCtrl')?.value;
    const userName = this.userNameImageFormGroup.get('userNameCtrl')?.value?.trim() || 'Anonymous';
    const file = this.selectedFile() ?? undefined;

    this.isUploading.set(true);

    this.recipesService
      .submitRecipe({
        title,
        ingredients: this.ingredients(),
        instructions: this.instructions(),
        time,
        submittedBy: userName,
        image: file,
      })
      .subscribe({
        next: () => {
          this.dialogRef.close();
          this.openSnackBar();
        },
        error: () => {
          this.errorMessageFile.set('Something went wrong. Please try again.');
          this.isUploading.set(false);
        },
      });
  }

  openSnackBar() {
    this.snackBar.openFromComponent(RecipeSubmissionSnackBarComponent, {
      duration: 5000,
      verticalPosition: 'top',
    });
  }
}
