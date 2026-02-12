import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-ingredients',
  imports: [MatCardModule, MatListModule],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
  public ingredients = input<string[] | undefined>(['ingredients loading...']);
}
