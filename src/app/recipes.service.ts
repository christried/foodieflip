import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { catchError, throwError } from 'rxjs';
import { Complexity } from './complexity.model';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  private recipe = signal<Recipe | undefined>(undefined);
  public currentRecipe = this.recipe.asReadonly();

  setRandomRecipe(complexity: Complexity) {
    // pass only the id string (or 'norecipe') to the backend
    const currentId = this.currentRecipe()?.id ?? 'norecipe';

    const GETRECIPE = this.httpClient
      .get<Recipe>(`http://localhost:3000/api/recipes/random/${complexity}`, {
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
        this.recipe.set(recipe);
        console.log(this.recipe());
      },
    });
    // skipping unsubscribe onDestroy since it's not necessary for http observables
  }

  voteForRecipe(voteType: 'downvote' | 'upvote') {
    const PATCHVOTE = this.httpClient
      .patch<string>(`http://localhost:3000/api/recipes/vote`, {
        id: this.currentRecipe()?.id,
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
}
