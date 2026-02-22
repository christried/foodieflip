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
import { MatIconModule } from '@angular/material/icon';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { RecipesService } from '../../recipes.service';

@Component({
  selector: 'ai-image-dialog',
  templateUrl: 'ai-image-dialog.html',
  styleUrl: 'ai-image-dialog.scss',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiImageDialog {
  private readonly dialogRef = inject(MatDialogRef<AiImageDialog>);
  readonly data: { recipeId: string } = inject(MAT_DIALOG_DATA);

  private readonly recipesService = inject(RecipesService);
  private readonly snackBar = inject(MatSnackBar);

  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  errorMessage = signal<string>('');

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    this.errorMessage.set('');
  }

  openSnackBar() {
    this.snackBar.openFromComponent(AiImageSnackBarComponent, {
      duration: 5000,
      verticalPosition: 'top',
    });
  }

  onClickSubmit() {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Please select an image before submitting.');
      return;
    }

    this.isUploading.set(true);

    this.recipesService.uploadRecipeImage(this.data.recipeId, file).subscribe({
      next: () => {
        this.dialogRef.close();
        this.openSnackBar();
      },
      error: () => {
        this.errorMessage.set('Something went wrong. Please try again.');
        this.isUploading.set(false);
      },
    });
  }
}

@Component({
  selector: 'ai-image-snack-bar',
  templateUrl: 'ai-image-snack-bar.html',
  styles: `
    :host {
      display: flex;
    }
    .remove-icon {
      color: black;
    }
  `,
  imports: [
    MatButtonModule,
    MatSnackBarLabel,
    MatSnackBarActions,
    MatSnackBarAction,
    MatIconModule,
  ],
})
export class AiImageSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
