import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MIN_INGREDIENTS = 2;
export const MIN_INSTRUCTIONS = 2;
export const PRIMARY_INGREDIENT_SECTION_TITLE = 'Hauptzutaten';

export const minTotalIngredientsValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const sectionsControl = control.get('sectionsCtrl') as FormArray | null;

  if (!sectionsControl) {
    return { ingredientCount: true };
  }

  const totalIngredients = sectionsControl.controls.reduce((count, sectionControl) => {
    const itemsControl = sectionControl.get('itemsCtrl') as FormArray | null;
    return count + (itemsControl?.length ?? 0);
  }, 0);

  return totalIngredients >= MIN_INGREDIENTS ? null : { ingredientCount: true };
};

export function createIngredientSection(fb: FormBuilder, title = '', requireTitle = false) {
  const titleValidators = requireTitle
    ? [Validators.required, Validators.maxLength(40)]
    : [Validators.maxLength(40)];

  return fb.nonNullable.group({
    titleCtrl: fb.nonNullable.control(title, titleValidators),
    ingredientInputCtrl: fb.nonNullable.control(''),
    itemsCtrl: fb.nonNullable.array<string>([]),
  });
}

export function createRecipeDataForm(fb: FormBuilder) {
  return fb.nonNullable.group({
    titleCtrl: fb.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    timeCtrl: fb.nonNullable.control<number>(0, [
      Validators.required,
      Validators.min(5),
      Validators.max(999),
    ]),
  });
}

export function createIngredientsForm(fb: FormBuilder) {
  return fb.nonNullable.group(
    {
      sectionsCtrl: fb.nonNullable.array(
        [createIngredientSection(fb, PRIMARY_INGREDIENT_SECTION_TITLE)],
        Validators.minLength(1),
      ),
    },
    {
      validators: [minTotalIngredientsValidator],
    },
  );
}

export function createInstructionsForm(fb: FormBuilder) {
  return fb.nonNullable.group({
    instructionInputCtrl: fb.nonNullable.control(''),
    instructionsCtrl: fb.nonNullable.array<string>([], Validators.minLength(MIN_INSTRUCTIONS)),
  });
}

export function createConfirmationForm(fb: FormBuilder) {
  return fb.nonNullable.group({
    termsAcceptedCtrl: fb.nonNullable.control(false, Validators.requiredTrue),
  });
}
