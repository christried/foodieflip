import { Component, effect, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RecipesService } from '../../recipes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-actions',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './actions.html',
  styleUrl: './actions.scss',
})
export class Actions {
  public recipesService = inject(RecipesService);
  private platformId = inject(PLATFORM_ID);

  public currentRecipe = this.recipesService.currentRecipe;
  public voteStatus = signal<'upvote' | 'downvote' | null>(null);

  constructor() {
    effect(() => {
      const recipe = this.currentRecipe();
      // will break while within SSR so has to check for browser presence
      if (recipe && isPlatformBrowser(this.platformId)) {
        const storedVote = localStorage.getItem(`vote_${recipe.id}`);
        this.voteStatus.set(storedVote as 'upvote' | 'downvote' | null);
      }
    });
  }

  onClickVote(voteType: 'downvote' | 'upvote') {
    const recipe = this.currentRecipe();
    if (!recipe) return;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(`vote_${recipe.id}`, voteType);
    }
    this.voteStatus.set(voteType);

    // count vote in backend, no user affiliation = fire and forget
    this.recipesService.voteForRecipe(voteType);
  }
}
