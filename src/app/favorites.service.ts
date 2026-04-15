import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize, map, Observable, switchMap, tap } from 'rxjs';
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

  constructor() {
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();

      if (!isAuthenticated) {
        this.favorites.set([]);
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
    const wasFavorite = this.isFavorite(recipeId);

    const request$ = wasFavorite
      ? this.httpClient.delete(`${this.apiBaseUrl}/api/favorites/${encodeURIComponent(recipeId)}`)
      : this.httpClient.post(`${this.apiBaseUrl}/api/favorites`, { recipeId });

    return request$.pipe(
      switchMap(() => this.fetchFavorites()),
      tap((favorites) => this.favorites.set(favorites)),
      map(() => !wasFavorite),
      catchError(() => EMPTY),
    );
  }

  removeFavorite(recipeId: string): Observable<void> {
    return this.httpClient
      .delete(`${this.apiBaseUrl}/api/favorites/${encodeURIComponent(recipeId)}`)
      .pipe(
        switchMap(() => this.fetchFavorites()),
        tap((favorites) => this.favorites.set(favorites)),
        map(() => undefined),
        catchError(() => EMPTY),
      );
  }

  private fetchFavorites(): Observable<FavoriteRecipe[]> {
    return this.httpClient.get<FavoriteRecipe[]>(`${this.apiBaseUrl}/api/favorites`);
  }
}
