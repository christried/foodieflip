import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
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
import { RecipeSubmissionSnackBarComponent } from './recipe-submission-snack-bar';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { fromEvent } from 'rxjs';

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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeSubmissionDialog {
  private readonly dialogRef = inject(MatDialogRef<RecipeSubmissionDialog>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly recipesService = inject(RecipesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly selectedFile = signal<File | null>(null);
  readonly isUploading = signal(false);
  readonly errorMessageFile = signal<string>('');

  readonly viewportWidth = signal(this.isBrowser ? window.innerWidth : 1024);
  readonly stepperOrientation = computed<'horizontal' | 'vertical'>(() =>
    this.viewportWidth() < 768 ? 'vertical' : 'horizontal',
  );

  readonly editingItemType = signal<'ingredient' | 'instruction' | null>(null);
  readonly editingIndex = signal<number | null>(null);
  readonly editValue = signal('');

  readonly titleIngredientsFormGroup = this.fb.group({
    titleCtrl: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(24)]),
    ingredientInputCtrl: this.fb.nonNullable.control(''),
    ingredientsCtrl: this.fb.nonNullable.array<string>([], Validators.minLength(MIN_INGREDIENTS)),
  });

  readonly instructionsTimeFormGroup = this.fb.group({
    instructionInputCtrl: this.fb.nonNullable.control(''),
    timeCtrl: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(5),
      Validators.max(999),
    ]),
    instructionsCtrl: this.fb.nonNullable.array<string>([], Validators.minLength(MIN_INSTRUCTIONS)),
  });

  readonly userNameImageFormGroup = this.fb.group({
    userNameCtrl: this.fb.nonNullable.control(''),
    termsAcceptedCtrl: this.fb.nonNullable.control(false, Validators.requiredTrue),
  });

  readonly titleCtrl = this.titleIngredientsFormGroup.controls.titleCtrl;
  readonly ingredientInputCtrl = this.titleIngredientsFormGroup.controls.ingredientInputCtrl;
  readonly timeCtrl = this.instructionsTimeFormGroup.controls.timeCtrl;
  readonly instructionInputCtrl = this.instructionsTimeFormGroup.controls.instructionInputCtrl;
  readonly termsAcceptedCtrl = this.userNameImageFormGroup.controls.termsAcceptedCtrl;

  readonly ingredientsArray = this.titleIngredientsFormGroup.controls.ingredientsCtrl;
  readonly instructionsArray = this.instructionsTimeFormGroup.controls.instructionsCtrl;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.viewportWidth.set(window.innerWidth));
  }

  isStep1Valid(): boolean {
    return this.titleIngredientsFormGroup.valid;
  }

  isStep2Valid(): boolean {
    return this.instructionsTimeFormGroup.valid;
  }

  isStep3Valid(): boolean {
    return this.userNameImageFormGroup.valid;
  }

  canSubmit(): boolean {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid() && !this.isUploading();
  }

  showTitleRequiredError(): boolean {
    const show = this.titleCtrl.touched || this.titleCtrl.dirty;
    return show && this.titleCtrl.hasError('required');
  }

  showTitleMaxLengthError(): boolean {
    const show = this.titleCtrl.touched || this.titleCtrl.dirty;
    return show && this.titleCtrl.hasError('maxlength');
  }

  showIngredientsCountError(): boolean {
    const interacted =
      this.ingredientInputCtrl.touched ||
      this.ingredientInputCtrl.dirty ||
      this.ingredientsArray.dirty ||
      this.ingredientsArray.touched;
    return interacted && this.ingredientsArray.length < MIN_INGREDIENTS;
  }

  showTimeRequiredError(): boolean {
    const show = this.timeCtrl.touched || this.timeCtrl.dirty;
    return show && this.timeCtrl.hasError('required');
  }

  showTimeRangeError(): boolean {
    const show = this.timeCtrl.touched || this.timeCtrl.dirty;
    return show && (this.timeCtrl.hasError('min') || this.timeCtrl.hasError('max'));
  }

  showInstructionsCountError(): boolean {
    const interacted =
      this.instructionInputCtrl.touched ||
      this.instructionInputCtrl.dirty ||
      this.instructionsArray.dirty ||
      this.instructionsArray.touched;
    return interacted && this.instructionsArray.length < MIN_INSTRUCTIONS;
  }

  showTermsRequiredError(): boolean {
    const show = this.termsAcceptedCtrl.touched || this.termsAcceptedCtrl.dirty;
    return show && this.termsAcceptedCtrl.hasError('required');
  }

  onClickAddItem(itemType: 'ingredient' | 'instruction', event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const inputCtrl =
      itemType === 'ingredient'
        ? this.titleIngredientsFormGroup.controls.ingredientInputCtrl
        : this.instructionsTimeFormGroup.controls.instructionInputCtrl;

    const inputValue = inputCtrl.value.trim();

    if (!inputValue) {
      return;
    }

    if (itemType === 'ingredient') {
      this.ingredientsArray.push(this.fb.nonNullable.control(inputValue));
      this.titleIngredientsFormGroup.controls.ingredientInputCtrl.setValue('');
      this.ingredientsArray.markAsDirty();
    } else {
      this.instructionsArray.push(this.fb.nonNullable.control(inputValue));
      this.instructionsTimeFormGroup.controls.instructionInputCtrl.setValue('');
      this.instructionsArray.markAsDirty();
    }
  }

  onClickRemoveItem(itemIndex: number, itemType: 'ingredient' | 'instruction'): void {
    if (itemType === 'ingredient') {
      this.ingredientsArray.removeAt(itemIndex);
      this.ingredientsArray.markAsDirty();
    } else {
      this.instructionsArray.removeAt(itemIndex);
      this.instructionsArray.markAsDirty();
    }

    if (this.editingItemType() === itemType && this.editingIndex() === itemIndex) {
      this.onClickCancelItemEdit();
    }
  }

  onClickEditItem(itemIndex: number, itemType: 'ingredient' | 'instruction'): void {
    const array = itemType === 'ingredient' ? this.ingredientsArray : this.instructionsArray;
    const currentValue = array.at(itemIndex)?.value ?? '';

    this.editingItemType.set(itemType);
    this.editingIndex.set(itemIndex);
    this.editValue.set(currentValue);
  }

  onEditValueInput(event: Event): void {
    this.editValue.set((event.target as HTMLInputElement).value);
  }

  onClickSaveItemEdit(itemType: 'ingredient' | 'instruction'): void {
    if (this.editingItemType() !== itemType || this.editingIndex() === null) {
      return;
    }

    const nextValue = this.editValue().trim();

    if (!nextValue) {
      return;
    }

    const array = itemType === 'ingredient' ? this.ingredientsArray : this.instructionsArray;
    const editIndex = this.editingIndex()!;
    const control = array.at(editIndex);

    if (!control) {
      return;
    }

    control.setValue(nextValue);
    this.onClickCancelItemEdit();
  }

  onClickCancelItemEdit(): void {
    this.editingItemType.set(null);
    this.editingIndex.set(null);
    this.editValue.set('');
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        this.errorMessageFile.set('Nur JPEG-, PNG- und WEBP-Bilder werden unterstützt.');
        this.selectedFile.set(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.errorMessageFile.set('Das Bild muss kleiner als 2 MB sein.');
        this.selectedFile.set(null);
        return;
      }
    }

    this.selectedFile.set(file);
    this.errorMessageFile.set('');
  }

  onClickSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const title = this.titleIngredientsFormGroup.controls.titleCtrl.value.trim();
    const time = this.instructionsTimeFormGroup.controls.timeCtrl.value;
    const userName = this.userNameImageFormGroup.controls.userNameCtrl.value.trim() || 'Anonym';
    const file = this.selectedFile() ?? undefined;

    if (!title || !time) {
      return;
    }

    this.isUploading.set(true);

    this.recipesService
      .submitRecipe({
        title,
        ingredients: this.ingredientsArray.controls.map((c) => c.value),
        instructions: this.instructionsArray.controls.map((c) => c.value),
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
          this.errorMessageFile.set('Etwas ist schiefgelaufen. Bitte versuche es erneut.');
          this.isUploading.set(false);
        },
      });
  }

  openSnackBar(): void {
    this.snackBar.openFromComponent(RecipeSubmissionSnackBarComponent, {
      duration: 5000,
      verticalPosition: 'top',
    });
  }
}
