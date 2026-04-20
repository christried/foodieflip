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
import { AuthService } from '../../../auth.service';
import { FavoritesService } from '../../../favorites.service';

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
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);

  public currentRecipe = this.recipesService.recipe;
  public voteStatus = signal<'upvote' | 'downvote' | null>(null);
  readonly canUseFavorites = this.authService.isAuthenticated;
  readonly isCurrentRecipeFavorite = computed(() => {
    const recipe = this.currentRecipe();

    if (!recipe) {
      return false;
    }

    return this.favoritesService.isFavorite(recipe.id);
  });

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

  onClickToggleFavorite() {
    const recipe = this.currentRecipe();

    if (!recipe || !this.canUseFavorites()) {
      return;
    }

    this.favoritesService.toggleFavorite(recipe.id).subscribe({
      next: (isNowFavorite) => {
        this.snackBar.open(
          isNowFavorite ? 'Zu Favoriten hinzugefügt.' : 'Aus Favoriten entfernt.',
          'OK',
          {
            duration: 3000,
            verticalPosition: 'top',
          },
        );
      },
      error: () => {
        this.snackBar.open('Favorit konnte nicht aktualisiert werden.', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
        });
      },
    });
  }

  openSnackBar() {
    this.snackBar.open('Rezept zur Zwischenablage hinzugefügt.', 'OK', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}
