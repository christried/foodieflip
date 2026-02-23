import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeSubmissionDialog {
  private readonly dialogRef = inject(MatDialogRef<RecipeSubmissionDialog>);
  readonly data: { recipeId: string } = inject(MAT_DIALOG_DATA);

  private readonly recipesService = inject(RecipesService);
  private readonly snackBar = inject(MatSnackBar);

  public ingredients = signal<string[]>([]);
  public instructions = signal<string[]>([]);

  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  errorMessageFile = signal<string>('');

  private _formBuilder = inject(FormBuilder);
  titleIngredientsFormGroup: FormGroup = this._formBuilder.group({
    titleCtrl: ['', Validators.required],
    ingredientsCtrl: ['', Validators.required],
  });
  instructionsTimeFormGroup: FormGroup = this._formBuilder.group({
    instructionsCtrl: ['', Validators.required],
    timeCtrl: ['', Validators.required],
  });
  userNameImageFormGroup: FormGroup = this._formBuilder.group({
    userNameCtrl: [''],
  });

  onClickAddItem(itemType: 'ingredient' | 'instruction') {
    const inputValue =
      itemType === 'ingredient'
        ? this.titleIngredientsFormGroup.get('ingredientsCtrl')?.value
        : this.instructionsTimeFormGroup.get('instructionsCtrl')?.value;

    if (itemType === 'ingredient') {
      this.ingredients.update((i) => [...i, inputValue]);
    } else this.instructions.update((i) => [...i, inputValue]);

    console.log(inputValue);
  }

  // File Stuff
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    this.errorMessageFile.set('');
  }

  onClickSubmit() {
    // all the values
    const title = this.titleIngredientsFormGroup.get('titleCtrl')?.value;
    const ingredients = this.titleIngredientsFormGroup.get('ingredientsCtrl')?.value;
    const instructions = this.instructionsTimeFormGroup.get('instructionsCtrl')?.value;
    const time = this.instructionsTimeFormGroup.get('timeCtrl')?.value;

    const file = this.selectedFile();
    if (!file) {
      this.errorMessageFile.set('Please select an image before submitting.');
      return;
    }

    this.isUploading.set(true);

    this.recipesService.uploadRecipeImage(this.data.recipeId, file).subscribe({
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
