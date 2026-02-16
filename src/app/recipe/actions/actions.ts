import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RecipesService } from '../../recipes.service';

@Component({
  selector: 'app-actions',
  imports: [MatCardModule],
  templateUrl: './actions.html',
  styleUrl: './actions.scss',
})
export class Actions {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.currentRecipe;

  isAiImage() {
    return this.currentRecipe()?.tags_internal.includes('ai-image');
  }
}
