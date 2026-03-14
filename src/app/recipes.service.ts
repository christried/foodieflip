import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Complexity } from './complexity.model';
import { Recipe, RecipeSubmission } from './recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private apiBaseUrl = inject(API_BASE_URL);

  public recipe = signal<Recipe | undefined>(undefined);
  public spinnerStatus = signal<'on' | 'off'>('off');

  setRandomRecipe(complexity: Complexity) {
    const currentId = this.recipe()?.id ?? 'norecipe';

    const GETRECIPE = this.httpClient
      .get<Recipe>(`${this.apiBaseUrl}/api/recipes/random/${complexity}`, {
        params: { id: currentId },
      })
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Could not retreive random recipe'));
        }),
      );

    GETRECIPE.subscribe({
      next: (recipe: Recipe) => {
        this.spinnerStatus.set('on');
        setTimeout(() => {
          this.recipe.set(recipe);
          this.spinnerStatus.set('off');
          this.router.navigate(['/recipe', recipe.shortTitle]);
        }, 750);
      },
    });
    // skipping unsubscribe onDestroy since it's not necessary for http observables
  }

  clearCurrentRecipe() {
    this.recipe.set(undefined);
  }

  // Helper method to fetch recipe by shortTitle - returns Observable without side effects
  // Used by route resolver to avoid duplicate HTTP requests
  getRecipeByShortTitle(shortTitle: string): Observable<Recipe> {
    return this.httpClient.get<Recipe>(`${this.apiBaseUrl}/api/recipes/${shortTitle}`).pipe(
      catchError((error) => {
        console.error(error);
        return throwError(() => new Error('Could not load recipe'));
      }),
    );
  }

  voteForRecipe(voteType: 'downvote' | 'upvote') {
    const PATCHVOTE = this.httpClient
      .patch<string>(`${this.apiBaseUrl}/api/recipes/vote`, {
        id: this.recipe()?.id,
        voteType,
      })
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Could not patch vote'));
        }),
      );

    PATCHVOTE.subscribe({
      next: (statusAnswer) => {
        console.log(statusAnswer);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // loads recipe by ID when accessing a recipe using any way that doesnt involve setRandomRecipe()
  // current use cases: accessing a recipe using the URL
  loadRecipeByShortTitle(shortTitle: string) {
    this.spinnerStatus.set('on');
    this.httpClient
      .get<Recipe>(`${this.apiBaseUrl}/api/recipes/${shortTitle}`)
      .pipe(
        catchError((error) => {
          console.error(error);
          return throwError(() => new Error('Could not load recipe'));
        }),
      )
      .subscribe({
        next: (recipe) => {
          this.recipe.set(recipe);
          this.spinnerStatus.set('off');
        },
      });
  }

  uploadRecipeImage(recipeId: string, image: File) {
    const formData = new FormData();
    formData.append('recipeId', recipeId);
    formData.append('image', image, image.name);

    return this.httpClient
      .put<{ message: string }>(`${this.apiBaseUrl}/api/submit/image`, formData)
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Could not upload image'));
        }),
      );
  }

  submitRecipe(submission: RecipeSubmission) {
    const formData = new FormData();
    formData.append('title', submission.title);
    formData.append('ingredients', JSON.stringify(submission.ingredients));
    formData.append('instructions', JSON.stringify(submission.instructions));
    formData.append('time', String(submission.time));
    formData.append('submittedBy', submission.submittedBy);

    if (submission.image) {
      formData.append('image', submission.image, submission.image.name);
    }

    return this.httpClient
      .post<{ message: string }>(`${this.apiBaseUrl}/api/submit/recipe`, formData)
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Could not submit recipe'));
        }),
      );
  }
}
