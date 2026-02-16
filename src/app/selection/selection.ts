import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';
import { Complexity } from '../complexity.model';
import { RecipesService } from '../recipes.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-selection',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './selection.html',
  styleUrl: './selection.scss',
})
export class Selection {
  public recipeService = inject(RecipesService);

  onClickButton(complexity: Complexity) {
    this.recipeService.setRandomRecipe(complexity);
  }
}
