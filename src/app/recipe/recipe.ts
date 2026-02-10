import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-recipe',
  imports: [MatCardModule, MatChipsModule],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  imagePath = '/data/00000example_recipe/example_recipe.jpg';
}
