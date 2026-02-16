import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../recipes.service';

@Component({
  selector: 'fullsize-image.dialog',
  templateUrl: 'fullsize-image-dialog.html',
  styleUrl: 'fullsize-image-dialog.scss',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullsizeImageDialog {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.currentRecipe;
}
