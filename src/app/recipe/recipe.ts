import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import { Ingredients } from './ingredients/ingredients';
import { Instructions } from './instructions/instructions';
import { Actions } from './actions/actions';
import { RecipesService } from '../recipes.service';

import { FullsizeImageDialog } from '../dialogs/fullsize-image-dialog/fullsize-image-dialog';

@Component({
  selector: 'app-recipe',
  imports: [MatCardModule, MatChipsModule, Ingredients, Instructions, Actions],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.currentRecipe;

  readonly dialog = inject(MatDialog);

  openFullsize() {
    this.dialog.open(FullsizeImageDialog, {
      panelClass: 'fullsize-image-panel',
      maxWidth: '75vw',
      maxHeight: '75vh',
    });
  }
}
