import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { catchError, throwError } from 'rxjs';
import { Complexity } from './complexity.model';
import { Recipe, RecipeSubmission } from './recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private httpClient = inject(HttpClient);

  private recipe = signal<Recipe | undefined>(undefined);
  public currentRecipe = this.recipe.asReadonly();
  public spinnerStatus = signal<'on' | 'off'>('off');

  setRandomRecipe(complexity: Complexity) {
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
        this.spinnerStatus.set('on');
        setTimeout(() => {
          this.recipe.set(recipe);
          this.spinnerStatus.set('off');
        }, 1000);
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

  uploadRecipeImage(recipeId: string, image: File) {
    const formData = new FormData();
    formData.append('recipeId', recipeId);
    formData.append('image', image, image.name);

    return this.httpClient
      .put<{ message: string }>('http://localhost:3000/api/submit/image', formData)
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
      .post<{ message: string }>('http://localhost:3000/api/submit/recipe', formData)
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Could not submit recipe'));
        }),
      );
  }
}
