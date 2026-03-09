import { Component, effect, inject, signal, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RecipesService } from '../../../recipes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardSnackBar } from './clipboard-snack-bar';

@Component({
  selector: 'app-actions',
  imports: [MatIconModule, MatButtonModule, ClipboardModule, MatTooltipModule],
  templateUrl: './actions.html',
  styleUrl: './actions.scss',
})
export class Actions {
  public recipesService = inject(RecipesService);
  private platformId = inject(PLATFORM_ID);
  protected readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  public currentRecipe = this.recipesService.currentRecipe;
  public voteStatus = signal<'upvote' | 'downvote' | null>(null);

  protected readonly shareUrl = computed<string>(() => `${environment.baseUrl}${this.router.url}`);

  constructor() {
    effect(() => {
      const recipe = this.currentRecipe();
      // would break while within SSR so has to check for browser presence
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

  openSnackBar() {
    this.snackBar.openFromComponent(ClipboardSnackBar, {
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}
