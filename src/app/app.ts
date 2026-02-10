import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Selection } from './selection/selection';
import { Recipe } from './recipe/recipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Selection, Recipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('foodieflip');
}
