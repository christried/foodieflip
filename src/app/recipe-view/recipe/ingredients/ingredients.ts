import { Component, input } from '@angular/core';
import { ingredientDivision } from '../../../recipe.model';

@Component({
  selector: 'app-ingredients',
  imports: [],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
  public ingredientDivisions = input<ingredientDivision[] | undefined>();

  isOnlyDivision() {
    return this.ingredientDivisions()?.length === 1;
  }
}
