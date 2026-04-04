import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { API_BASE_URL } from '../../api.config';
import { Recipe } from '../../recipe.model';

interface RecipeReviewActionResponse {
  message: string;
  id: string;
}

interface ApiErrorResponse {
  error: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeAdminService {
  private httpClient = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  getPendingRecipes(): Observable<Recipe[]> {
    return this.httpClient.get<Recipe[]>(`${this.apiBaseUrl}/api/recipes/pending`).pipe(
      catchError((error) => {
        return throwError(() => this.toError(error, 'Konnte ausstehende Rezepte nicht laden'));
      }),
    );
  }

  approveRecipe(recipeId: string): Observable<RecipeReviewActionResponse> {
    return this.httpClient
      .patch<RecipeReviewActionResponse>(`${this.apiBaseUrl}/api/recipes/approve/${recipeId}`, {
        action: 'approve',
      })
      .pipe(
        catchError((error) => {
          return throwError(() => this.toError(error, 'Konnte Rezept nicht genehmigen'));
        }),
      );
  }

  rejectRecipe(recipeId: string, reviewNotes: string): Observable<RecipeReviewActionResponse> {
    return this.httpClient
      .patch<RecipeReviewActionResponse>(`${this.apiBaseUrl}/api/recipes/approve/${recipeId}`, {
        action: 'reject',
        reviewNotes,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => this.toError(error, 'Konnte Rezept nicht ablehnen'));
        }),
      );
  }

  private toError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 429) {
        return new Error('Zu viele Genehmigungen, bitte versuche es später erneut.');
      }

      return new Error(this.getApiErrorMessage(error) ?? fallbackMessage);
    }

    return new Error(fallbackMessage);
  }

  private getApiErrorMessage(error: HttpErrorResponse): string | undefined {
    const payload = error.error;

    if (payload && typeof payload === 'object' && 'error' in payload) {
      const apiError = payload as ApiErrorResponse;

      if (typeof apiError.error === 'string' && apiError.error.trim().length > 0) {
        return apiError.error;
      }
    }

    return undefined;
  }
}
