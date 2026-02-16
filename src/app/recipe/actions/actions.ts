import { Component, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RecipesService } from '../../recipes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-actions',
  imports: [MatCardModule, MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './actions.html',
  styleUrl: './actions.scss',
})
export class Actions {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.currentRecipe;

  public voteStatus = signal<'upvote' | 'downvote' | null>(null);

  constructor() {
    effect(() => {
      const recipe = this.currentRecipe();
      if (recipe) {
        const storedVote = localStorage.getItem(`vote_${recipe.id}`);
        this.voteStatus.set(storedVote as 'upvote' | 'downvote' | null);
      }
    });
  }

  isAiImage() {
    return this.currentRecipe()?.tags_internal.includes('ai-image');
  }

  onClickVote(voteType: 'downvote' | 'upvote') {
    const recipe = this.currentRecipe();
    if (!recipe) return;

    localStorage.setItem(`vote_${recipe.id}`, voteType);
    this.voteStatus.set(voteType);

    // count vote in backend, no user affiliation
    this.recipesService.voteForRecipe(voteType);
  }
}
