import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  imports: [MatCardModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss', '../pages.scss'],
})
export class NotFound {}
