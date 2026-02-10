import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-selection',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './selection.html',
  styleUrl: './selection.scss',
})
export class Selection {}
