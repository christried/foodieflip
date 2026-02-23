import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Selection } from './selection/selection';
import { Recipe } from './recipe/recipe';
import { Footer } from './footer/footer';
import { RecipesService } from './recipes.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RecipeSubmissionDialog } from './dialogs/recipe-submission-dialog/recipe-submission-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Selection, Recipe, Footer, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('foodieflip');
  protected readonly version = signal('0.1');
  public readonly recipesService = inject(RecipesService);
  readonly dialog = inject(MatDialog);

  onClickSubmitNewRecipe() {
    this.dialog.open(RecipeSubmissionDialog, {
      width: '900px',
      maxWidth: '90vw',
      height: '80vh',
    });
  }
}
