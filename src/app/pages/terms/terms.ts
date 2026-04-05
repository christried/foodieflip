import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  imports: [MatCardModule, RouterLink],
  templateUrl: './terms.html',
  styleUrls: ['./terms.scss', '../pages.scss'],
})
export class Terms {}
