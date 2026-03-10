import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RecipesService } from '../recipes.service';
import { Recipe as RecipeModel } from '../recipe.model';
import { Selection } from './selection/selection';
import { Recipe } from './recipe/recipe';

@Component({
  selector: 'app-recipe-view',
  imports: [Selection, Recipe],
  templateUrl: './recipe-view.html',
  styleUrl: './recipe-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeView {
  protected readonly shortTitle = input<string>();
  protected readonly recipe = input<RecipeModel>(); // From route resolver
  public readonly recipesService = inject(RecipesService);

  constructor() {
    effect(() => {
      const resolvedRecipe = this.recipe();
      const shortTitle = this.shortTitle();

      if (resolvedRecipe) {
        // Use the recipe resolved by the route resolver
        this.recipesService['recipe'].set(resolvedRecipe);
        this.recipesService.spinnerStatus.set('off');
      } else if (shortTitle) {
        this.recipesService.loadRecipeByShortTitle(shortTitle);
      }
    });
  }
}
