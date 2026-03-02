import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../recipes.service';

@Component({
  selector: 'fullsize-image.dialog',
  templateUrl: 'fullsize-image-dialog.html',
  styleUrl: 'fullsize-image-dialog.scss',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullsizeImageDialog {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.currentRecipe;
}
