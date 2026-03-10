import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-privacy',
  imports: [MatCardModule],
  templateUrl: './privacy.html',
  styleUrls: ['./privacy.scss', '../pages.scss'],
})
export class Privacy {}
