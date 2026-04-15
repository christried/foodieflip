import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

export interface FavoriteRecipe {
  id: string;
  shortTitle: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  time: number;
  submittedBy: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly authService = inject(AuthService);

  readonly favorites = signal<FavoriteRecipe[]>([]);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly canManageFavorites = computed(() => Boolean(this.authService.user()?.username?.trim()));

  constructor() {
    effect(() => {
      const username = this.authService.user()?.username?.trim();

      if (!username) {
        this.favorites.set([]);
        this.isMutating.set(false);
        return;
      }

      this.refreshFavorites();
    });
  }

  isFavorite(recipeId: string): boolean {
    return this.favorites().some((favorite) => favorite.id === recipeId);
  }

  refreshFavorites(): void {
    this.isLoading.set(true);

    this.fetchFavorites()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (favorites) => {
          this.favorites.set(favorites);
        },
        error: () => {
          this.favorites.set([]);
        },
      });
  }

  toggleFavorite(recipeId: string): Observable<boolean> {
    const normalizedRecipeId = recipeId.trim();

    if (!this.canManageFavorites()) {
      return EMPTY;
    }

    if (this.isMutating()) {
      return EMPTY;
    }

    if (!normalizedRecipeId) {
      return EMPTY;
    }

    const wasFavorite = this.isFavorite(normalizedRecipeId);
    this.isMutating.set(true);

    const request$ = wasFavorite
      ? this.deleteFavorite(normalizedRecipeId)
      : this.addFavorite(normalizedRecipeId);

    return request$.pipe(
      tap({
        next: (favorites) => this.favorites.set(favorites),
      }),
      map(() => !wasFavorite),
      catchError(() => EMPTY),
      finalize(() => this.isMutating.set(false)),
    );
  }

  removeFavorite(recipeId: string): Observable<void> {
    const normalizedRecipeId = recipeId.trim();

    if (!this.canManageFavorites()) {
      return EMPTY;
    }

    if (this.isMutating()) {
      return EMPTY;
    }

    if (!normalizedRecipeId) {
      return EMPTY;
    }

    this.isMutating.set(true);

    return this.deleteFavorite(normalizedRecipeId).pipe(
      tap({
        next: (favorites) => this.favorites.set(favorites),
      }),
      map(() => undefined),
      catchError(() => EMPTY),
      finalize(() => this.isMutating.set(false)),
    );
  }

  private fetchFavorites(): Observable<FavoriteRecipe[]> {
    return this.httpClient.get<FavoriteRecipe[]>(`${this.apiBaseUrl}/api/favorites`);
  }

  private addFavorite(recipeId: string): Observable<FavoriteRecipe[]> {
    return this.httpClient
      .post(`${this.apiBaseUrl}/api/favorites`, {
        recipeId,
      })
      .pipe(
        switchMap(() => this.fetchFavorites()),
        catchError((error) =>
          throwError(() => new Error(`Favorit konnte nicht hinzugefügt werden: ${error}`)),
        ),
      );
  }

  private deleteFavorite(recipeId: string): Observable<FavoriteRecipe[]> {
    return this.httpClient
      .delete(`${this.apiBaseUrl}/api/favorites/${encodeURIComponent(recipeId)}`)
      .pipe(
        switchMap(() => this.fetchFavorites()),
        catchError((error) =>
          throwError(() => new Error(`Favorit konnte nicht gelöscht werden: ${error}`)),
        ),
      );
  }
}
