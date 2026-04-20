import { Component, input } from '@angular/core';
import { IngredientDivision } from '../../../recipe.model';

@Component({
  selector: 'app-ingredients',
  imports: [],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
  public ingredientDivisions = input.required<IngredientDivision[]>();

  isOnlyDivision() {
    return this.ingredientDivisions()?.length === 1;
  }
}
