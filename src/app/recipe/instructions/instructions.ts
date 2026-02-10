import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-instructions',
  imports: [MatCardModule],
  templateUrl: './instructions.html',
  styleUrl: './instructions.scss',
})
export class Instructions {}
