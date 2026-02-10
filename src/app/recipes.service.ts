import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { catchError, throwError } from 'rxjs';
import { TimeType } from './timeType.model';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  private recipe = signal<Recipe | undefined>(undefined);
  public currentRecipe = this.recipe.asReadonly();

  setRandomRecipe(timeType: TimeType) {
    const GETRECIPE = this.httpClient
      .get<Recipe>(`http://localhost:3000/api/recipes/random/${timeType}`)
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
}
