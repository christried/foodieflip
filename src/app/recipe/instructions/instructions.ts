import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-instructions',
  imports: [MatCardModule, MatListModule],
  templateUrl: './instructions.html',
  styleUrl: './instructions.scss',
})
export class Instructions {
  public instructions = input<string[] | undefined>(['instructions loading...']);
}
