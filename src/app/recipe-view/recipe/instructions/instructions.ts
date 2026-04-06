import { Component, input } from '@angular/core';

@Component({
  selector: 'app-instructions',
  imports: [],
  templateUrl: './instructions.html',
  styleUrl: './instructions.scss',
})
export class Instructions {
  public instructions = input<string[] | undefined>(['Anweisungen werden geladen...']);
}
