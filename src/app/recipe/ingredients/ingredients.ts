import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-ingredients',
  imports: [MatCardModule],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
  public ingredients = input<string[] | undefined>(['ingredients loading...']);
}
