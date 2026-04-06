import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { Ingredients } from './ingredients/ingredients';
import { Instructions } from './instructions/instructions';
import { Actions } from './actions/actions';
import { RecipesService } from '../../recipes.service';

import { FullsizeImageDialog } from '../../dialogs/fullsize-image-dialog/fullsize-image-dialog';
import { AiImageDialog } from '../../dialogs/ai-image-dialog/ai-image-dialog';

@Component({
  selector: 'app-recipe',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    Ingredients,
    Instructions,
    Actions,
  ],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  public recipesService = inject(RecipesService);
  public currentRecipe = this.recipesService.recipe;
  public isFlipped = signal(false);

  readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly minBackFaceVisibleMs = 1000;
  private backFaceEnteredAt = 0;
  private flipBackTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const isLoading = this.recipesService.spinnerStatus() === 'on';

      if (isLoading) {
        this.backFaceEnteredAt = Date.now();
        this.clearFlipBackTimer();
        this.isFlipped.set(true);
        return;
      }

      if (!this.isFlipped()) {
        return;
      }

      const elapsed = Date.now() - this.backFaceEnteredAt;
      const delay = Math.max(this.minBackFaceVisibleMs - elapsed, 0);

      this.clearFlipBackTimer();
      this.flipBackTimer = setTimeout(() => {
        this.isFlipped.set(false);
        this.flipBackTimer = undefined;
      }, delay);
    });

    this.destroyRef.onDestroy(() => {
      this.clearFlipBackTimer();
    });
  }

  private clearFlipBackTimer() {
    if (!this.flipBackTimer) {
      return;
    }

    clearTimeout(this.flipBackTimer);
    this.flipBackTimer = undefined;
  }

  openFullsize() {
    this.dialog.open(FullsizeImageDialog, {
      maxWidth: '75vw',
      maxHeight: '75vh',
    });
  }

  openAiImageDialog() {
    this.dialog.open(AiImageDialog, {
      width: '34.5rem',
      data: { recipeId: this.currentRecipe()!.id },
    });
  }
}
