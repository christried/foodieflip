import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RecipesService } from '../recipes.service';
import { Selection } from '../selection/selection';
import { Recipe } from '../recipe/recipe';

@Component({
  selector: 'app-recipe-view',
  imports: [Selection, Recipe],
  templateUrl: './recipe-view.html',
  styleUrl: './recipe-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeView {
  protected readonly shortTitle = input<string>();
  public readonly recipesService = inject(RecipesService);
}
