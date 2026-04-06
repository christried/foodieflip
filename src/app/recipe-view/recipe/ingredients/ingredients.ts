import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ingredients',
  imports: [],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
  public ingredients = input<string[] | undefined>(['Zutaten werden geladen...']);
}
