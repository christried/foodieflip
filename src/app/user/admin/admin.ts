import { Component, inject, signal } from '@angular/core';
import { Recipe } from '../../recipe.model';
import { RecipeAdminService } from './recipe-admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private recipeAdminService = inject(RecipeAdminService);

  readonly pendingRecipes = signal<Recipe[]>([]);
  readonly isLoading = signal(false);
  readonly pageError = signal('');
  readonly pageMessage = signal('');
  readonly recipeBusyState = signal<Record<string, boolean>>({});
  readonly rejectNotesById = signal<Record<string, string>>({});
  readonly rejectErrorsById = signal<Record<string, string>>({});

  constructor() {
    this.loadPendingRecipes();
  }

  loadPendingRecipes() {
    this.isLoading.set(true);
    this.pageError.set('');

    this.recipeAdminService.getPendingRecipes().subscribe({
      next: (recipes) => {
        this.pendingRecipes.set(recipes);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.pageError.set(this.toErrorMessage(error, 'Could not load pending recipes.'));
        this.isLoading.set(false);
      },
    });
  }

  approveRecipe(recipeId: string) {
    if (this.isRecipeBusy(recipeId)) {
      return;
    }

    this.pageError.set('');
    this.pageMessage.set('');
    this.setRecipeBusy(recipeId, true);

    this.recipeAdminService.approveRecipe(recipeId).subscribe({
      next: () => {
        this.pageMessage.set('Recipe approved.');
        this.clearRecipeTransientState(recipeId);
        this.loadPendingRecipes();
      },
      error: (error) => {
        this.pageError.set(this.toErrorMessage(error, 'Could not approve recipe.'));
        this.setRecipeBusy(recipeId, false);
      },
    });
  }

  rejectRecipe(recipeId: string) {
    if (this.isRecipeBusy(recipeId)) {
      return;
    }

    const notes = (this.rejectNotesById()[recipeId] ?? '').trim();

    if (!notes) {
      this.setRejectError(recipeId, 'Rejection notes are required.');
      return;
    }

    this.setRejectError(recipeId, '');
    this.pageError.set('');
    this.pageMessage.set('');
    this.setRecipeBusy(recipeId, true);

    this.recipeAdminService.rejectRecipe(recipeId, notes).subscribe({
      next: () => {
        this.pageMessage.set('Recipe rejected.');
        this.clearRecipeTransientState(recipeId);
        this.loadPendingRecipes();
      },
      error: (error) => {
        this.pageError.set(this.toErrorMessage(error, 'Could not reject recipe.'));
        this.setRecipeBusy(recipeId, false);
      },
    });
  }

  onRejectNotesInput(recipeId: string, event: Event) {
    const value = (event.target as HTMLTextAreaElement | null)?.value ?? '';

    const nextNotes = { ...this.rejectNotesById() };
    nextNotes[recipeId] = value;
    this.rejectNotesById.set(nextNotes);

    if (this.rejectErrorsById()[recipeId]) {
      this.setRejectError(recipeId, '');
    }
  }

  rejectNotes(recipeId: string): string {
    return this.rejectNotesById()[recipeId] ?? '';
  }

  rejectError(recipeId: string): string {
    return this.rejectErrorsById()[recipeId] ?? '';
  }

  isRecipeBusy(recipeId: string): boolean {
    return this.recipeBusyState()[recipeId] === true;
  }

  formatSubmittedAt(value?: string): string {
    if (!value) {
      return 'Unknown';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString();
  }

  private setRecipeBusy(recipeId: string, isBusy: boolean) {
    const nextBusyState = { ...this.recipeBusyState() };

    if (isBusy) {
      nextBusyState[recipeId] = true;
    } else {
      delete nextBusyState[recipeId];
    }

    this.recipeBusyState.set(nextBusyState);
  }

  private setRejectError(recipeId: string, message: string) {
    const nextErrors = { ...this.rejectErrorsById() };

    if (message) {
      nextErrors[recipeId] = message;
    } else {
      delete nextErrors[recipeId];
    }

    this.rejectErrorsById.set(nextErrors);
  }

  private clearRecipeTransientState(recipeId: string) {
    const nextNotes = { ...this.rejectNotesById() };
    delete nextNotes[recipeId];
    this.rejectNotesById.set(nextNotes);

    this.setRejectError(recipeId, '');
    this.setRecipeBusy(recipeId, false);
  }

  private toErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallbackMessage;
  }
}
