import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Selection } from './selection/selection';
import { Recipe } from './recipe/recipe';
import { Footer } from './footer/footer';
import { RecipesService } from './recipes.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Selection, Recipe, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('foodieflip');
  protected readonly version = signal('0.1');
  public readonly recipesService = inject(RecipesService);
}
