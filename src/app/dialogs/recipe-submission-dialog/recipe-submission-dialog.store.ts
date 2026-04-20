import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../auth.service';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MIN_INGREDIENTS,
  MIN_INSTRUCTIONS,
  createConfirmationForm,
  createIngredientSection,
  createIngredientsForm,
  createInstructionsForm,
  createRecipeDataForm,
} from './recipe-submission-dialog.forms';
import { mapDraftToRecipeSubmission } from './recipe-submission-dialog.mapper';
import { RecipeSubmission } from '../../recipe.model';

@Injectable()
export class RecipeSubmissionDialogStore {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;

  readonly recipeDataFormGroup = createRecipeDataForm(this.fb);
  readonly ingredientsFormGroup = createIngredientsForm(this.fb);
  readonly instructionsFormGroup = createInstructionsForm(this.fb);
  readonly confirmationFormGroup = createConfirmationForm(this.fb);

  readonly titleCtrl = this.recipeDataFormGroup.controls.titleCtrl;
  readonly timeCtrl = this.recipeDataFormGroup.controls.timeCtrl;
  readonly sectionsArray = this.ingredientsFormGroup.controls.sectionsCtrl;
  readonly instructionInputCtrl = this.instructionsFormGroup.controls.instructionInputCtrl;
  readonly instructionsArray = this.instructionsFormGroup.controls.instructionsCtrl;
  readonly termsAcceptedCtrl = this.confirmationFormGroup.controls.termsAcceptedCtrl;

  readonly selectedFile = signal<File | null>(null);
  readonly isUploading = signal(false);
  readonly errorMessageFile = signal<string>('');

  readonly editingIngredientSectionIndex = signal<number | null>(null);
  readonly editingSectionTitleIndex = signal<number | null>(null);
  readonly editingIngredientIndex = signal<number | null>(null);
  readonly editingInstructionIndex = signal<number | null>(null);
  readonly editValue = signal('');

  canSubmit(): boolean {
    const submittedBy = this.currentUser()?.username?.trim();

    return (
      this.isStep1Valid() &&
      this.isStep2Valid() &&
      this.isStep3Valid() &&
      this.isStep4Valid() &&
      !this.isUploading() &&
      Boolean(submittedBy)
    );
  }

  isStep1Valid(): boolean {
    return this.recipeDataFormGroup.valid;
  }

  isStep2Valid(): boolean {
    return this.ingredientsFormGroup.valid;
  }

  isStep3Valid(): boolean {
    return (
      this.instructionsArray.length >= MIN_INSTRUCTIONS && this.instructionsFormGroup.valid
    );
  }

  isStep4Valid(): boolean {
    return this.confirmationFormGroup.valid;
  }

  showTitleRequiredError(): boolean {
    const show = this.titleCtrl.touched || this.titleCtrl.dirty;
    return show && this.titleCtrl.hasError('required');
  }

  showTitleMaxLengthError(): boolean {
    const show = this.titleCtrl.touched || this.titleCtrl.dirty;
    return show && this.titleCtrl.hasError('maxlength');
  }

  showTimeRequiredError(): boolean {
    const show = this.timeCtrl.touched || this.timeCtrl.dirty;
    return show && this.timeCtrl.hasError('required');
  }

  showTimeRangeError(): boolean {
    const show = this.timeCtrl.touched || this.timeCtrl.dirty;
    return show && (this.timeCtrl.hasError('min') || this.timeCtrl.hasError('max'));
  }

  showIngredientsCountError(): boolean {
    const interacted =
      this.sectionsArray.touched ||
      this.sectionsArray.dirty ||
      this.sectionsArray.controls.some((sectionCtrl) => {
        const titleCtrl = sectionCtrl.controls.titleCtrl;
        const inputCtrl = sectionCtrl.controls.ingredientInputCtrl;
        const itemsCtrl = sectionCtrl.controls.itemsCtrl;

        return (
          titleCtrl.touched ||
          titleCtrl.dirty ||
          inputCtrl.touched ||
          inputCtrl.dirty ||
          itemsCtrl.touched ||
          itemsCtrl.dirty
        );
      });

    return interacted && this.ingredientsFormGroup.hasError('ingredientCount');
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

  addIngredientSection(): void {
    this.sectionsArray.push(createIngredientSection(this.fb, '', true));
    this.sectionsArray.markAsDirty();
    this.ingredientsFormGroup.updateValueAndValidity();
    this.startEditSectionTitle(this.sectionsArray.length - 1);
  }

  removeIngredientSection(sectionIndex: number): void {
    if (sectionIndex === 0) {
      return;
    }

    this.sectionsArray.removeAt(sectionIndex);
    this.sectionsArray.markAsDirty();
    this.ingredientsFormGroup.updateValueAndValidity();

    const activeIngredientSectionIndex = this.editingIngredientSectionIndex();
    const activeTitleSectionIndex = this.editingSectionTitleIndex();

    if (activeIngredientSectionIndex === sectionIndex || activeTitleSectionIndex === sectionIndex) {
      this.cancelItemEdit();
      return;
    }

    if (activeIngredientSectionIndex !== null && activeIngredientSectionIndex > sectionIndex) {
      this.editingIngredientSectionIndex.set(activeIngredientSectionIndex - 1);
    }

    if (activeTitleSectionIndex !== null && activeTitleSectionIndex > sectionIndex) {
      this.editingSectionTitleIndex.set(activeTitleSectionIndex - 1);
    }
  }

  addIngredient(sectionIndex: number, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const sectionCtrl = this.sectionsArray.at(sectionIndex);

    if (!sectionCtrl) {
      return;
    }

    const inputCtrl = sectionCtrl.controls.ingredientInputCtrl;
    const inputValue = inputCtrl.value.trim();

    if (!inputValue) {
      return;
    }

    sectionCtrl.controls.itemsCtrl.push(this.fb.nonNullable.control(inputValue));
    sectionCtrl.controls.itemsCtrl.markAsDirty();
    inputCtrl.setValue('');
    this.ingredientsFormGroup.updateValueAndValidity();
  }

  removeIngredient(sectionIndex: number, ingredientIndex: number): void {
    const sectionCtrl = this.sectionsArray.at(sectionIndex);

    if (!sectionCtrl) {
      return;
    }

    sectionCtrl.controls.itemsCtrl.removeAt(ingredientIndex);
    sectionCtrl.controls.itemsCtrl.markAsDirty();
    this.ingredientsFormGroup.updateValueAndValidity();

    if (this.isEditingIngredient(sectionIndex, ingredientIndex)) {
      this.cancelItemEdit();
    }
  }

  addInstruction(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const inputValue = this.instructionInputCtrl.value.trim();

    if (!inputValue) {
      return;
    }

    this.instructionsArray.push(this.fb.nonNullable.control(inputValue));
    this.instructionInputCtrl.setValue('');
    this.instructionsArray.markAsDirty();
  }

  removeInstruction(instructionIndex: number): void {
    this.instructionsArray.removeAt(instructionIndex);
    this.instructionsArray.markAsDirty();

    if (this.isEditingInstruction(instructionIndex)) {
      this.cancelItemEdit();
    }
  }

  startEditIngredient(sectionIndex: number, ingredientIndex: number): void {
    const sectionCtrl = this.sectionsArray.at(sectionIndex);
    const currentValue = sectionCtrl?.controls.itemsCtrl.at(ingredientIndex)?.value ?? '';

    this.editingSectionTitleIndex.set(null);
    this.editingIngredientSectionIndex.set(sectionIndex);
    this.editingIngredientIndex.set(ingredientIndex);
    this.editingInstructionIndex.set(null);
    this.editValue.set(currentValue);
  }

  startEditInstruction(instructionIndex: number): void {
    const currentValue = this.instructionsArray.at(instructionIndex)?.value ?? '';

    this.editingSectionTitleIndex.set(null);
    this.editingInstructionIndex.set(instructionIndex);
    this.editingIngredientSectionIndex.set(null);
    this.editingIngredientIndex.set(null);
    this.editValue.set(currentValue);
  }

  startEditSectionTitle(sectionIndex: number): void {
    if (sectionIndex === 0) {
      return;
    }

    const titleCtrl = this.sectionsArray.at(sectionIndex)?.controls.titleCtrl;

    if (!titleCtrl) {
      return;
    }

    this.editingSectionTitleIndex.set(sectionIndex);
    this.editingIngredientSectionIndex.set(null);
    this.editingIngredientIndex.set(null);
    this.editingInstructionIndex.set(null);
    this.editValue.set(titleCtrl.value);
  }

  isEditingIngredient(sectionIndex: number, ingredientIndex: number): boolean {
    return (
      this.editingIngredientSectionIndex() === sectionIndex &&
      this.editingIngredientIndex() === ingredientIndex
    );
  }

  isEditingSectionTitle(sectionIndex: number): boolean {
    return this.editingSectionTitleIndex() === sectionIndex;
  }

  isEditingInstruction(instructionIndex: number): boolean {
    return this.editingInstructionIndex() === instructionIndex;
  }

  onEditValueInput(event: Event): void {
    this.editValue.set((event.target as HTMLInputElement).value);
  }

  saveEditIngredient(): void {
    const sectionIndex = this.editingIngredientSectionIndex();
    const ingredientIndex = this.editingIngredientIndex();

    if (sectionIndex === null || ingredientIndex === null) {
      return;
    }

    const nextValue = this.editValue().trim();

    if (!nextValue) {
      return;
    }

    const control = this.sectionsArray.at(sectionIndex)?.controls.itemsCtrl.at(ingredientIndex);

    if (!control) {
      return;
    }

    control.setValue(nextValue);
    this.cancelItemEdit();
  }

  saveEditSectionTitle(): void {
    const sectionIndex = this.editingSectionTitleIndex();

    if (sectionIndex === null || sectionIndex === 0) {
      return;
    }

    const titleCtrl = this.sectionsArray.at(sectionIndex)?.controls.titleCtrl;

    if (!titleCtrl) {
      return;
    }

    const nextValue = this.editValue().trim();

    titleCtrl.markAsTouched();
    titleCtrl.markAsDirty();

    if (!nextValue) {
      this.ingredientsFormGroup.updateValueAndValidity();
      return;
    }

    titleCtrl.setValue(nextValue);
    this.ingredientsFormGroup.updateValueAndValidity();
    this.cancelItemEdit();
  }

  saveEditInstruction(): void {
    const instructionIndex = this.editingInstructionIndex();

    if (instructionIndex === null) {
      return;
    }

    const nextValue = this.editValue().trim();

    if (!nextValue) {
      return;
    }

    const control = this.instructionsArray.at(instructionIndex);

    if (!control) {
      return;
    }

    control.setValue(nextValue);
    this.cancelItemEdit();
  }

  cancelItemEdit(): void {
    this.editingSectionTitleIndex.set(null);
    this.editingIngredientSectionIndex.set(null);
    this.editingIngredientIndex.set(null);
    this.editingInstructionIndex.set(null);
    this.editValue.set('');
  }

  getSectionTitle(sectionIndex: number): string {
    return this.sectionsArray.at(sectionIndex)?.controls.titleCtrl.value.trim() ?? '';
  }

  isSectionTitleMissing(sectionIndex: number): boolean {
    if (sectionIndex === 0) {
      return false;
    }

    return this.getSectionTitle(sectionIndex).length === 0;
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

  setUploading(value: boolean): void {
    this.isUploading.set(value);
  }

  createSubmission(): RecipeSubmission | null {
    if (!this.canSubmit()) {
      return null;
    }

    const submittedBy = this.currentUser()?.username?.trim() || '';

    if (!submittedBy) {
      return null;
    }

    return mapDraftToRecipeSubmission({
      title: this.titleCtrl.value,
      time: this.timeCtrl.value,
      ingredients: this.sectionsArray.controls.map((sectionCtrl) => ({
        title: sectionCtrl.controls.titleCtrl.value,
        items: sectionCtrl.controls.itemsCtrl.controls.map((itemCtrl) => itemCtrl.value),
      })),
      instructions: this.instructionsArray.controls.map((instructionCtrl) => instructionCtrl.value),
      submittedBy,
      image: this.selectedFile() ?? undefined,
    });
  }

  getIngredientsHint(): string {
    return `Mindestens 1 Abschnitt und insgesamt ${MIN_INGREDIENTS} Zutaten erforderlich`;
  }
}
