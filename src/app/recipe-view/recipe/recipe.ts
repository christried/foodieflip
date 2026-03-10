import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { Ingredients } from './ingredients/ingredients';
import { Instructions } from './instructions/instructions';
import { Actions } from './actions/actions';
import { RecipesService } from '../../recipes.service';

import { FullsizeImageDialog } from '../../dialogs/fullsize-image-dialog/fullsize-image-dialog';
import { AiImageDialog } from '../../dialogs/ai-image-dialog/ai-image-dialog';

@Component({
  selector: 'app-recipe',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    Ingredients,
    Instructions,
    Actions,
  ],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.recipe;

  readonly dialog = inject(MatDialog);

  openFullsize() {
    this.dialog.open(FullsizeImageDialog, {
      maxWidth: '75vw',
      maxHeight: '75vh',
    });
  }

  openAiImageDialog() {
    this.dialog.open(AiImageDialog, {
      width: '34.5rem',
      data: { recipeId: this.currentRecipe()!.id },
    });
  }
}
