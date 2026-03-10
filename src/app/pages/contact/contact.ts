import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-contact',
  imports: [MatCardModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss', '../pages.scss'],
})
export class Contact {}
