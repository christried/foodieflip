import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-terms',
  imports: [MatCardModule],
  templateUrl: './terms.html',
  styleUrls: ['./terms.scss', '../pages.scss'],
})
export class Terms {}