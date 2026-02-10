import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';
import { TimeType } from '../timeType.model';
import { RecipesService } from '../recipes.service';

@Component({
  selector: 'app-selection',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './selection.html',
  styleUrl: './selection.scss',
})
export class Selection {
  public recipeService = inject(RecipesService);

  onClickButton(timeType: TimeType) {
    this.recipeService.setRandomRecipe(timeType);
  }
}
