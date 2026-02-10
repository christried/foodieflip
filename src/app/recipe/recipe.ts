import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Ingredients } from './ingredients/ingredients';
import { Instructions } from './instructions/instructions';
import { Actions } from './actions/actions';
import { RecipesService } from '../recipes.service';

@Component({
  selector: 'app-recipe',
  imports: [MatCardModule, MatChipsModule, Ingredients, Instructions, Actions],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  imagePath = '/data/00000example_recipe/example_recipe.jpg';

  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.currentRecipe;
}
