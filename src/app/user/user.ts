import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user',
  imports: [MatCardModule],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  public user = signal({
    userName: 'Hans',
    email: 'hans@franz.de',
    submittedRecipes: [{ title: 'lecker curry' }, { title: 'auch lecker anderer kram' }],
    favouriteRecipes: [{ title: 'favourite curry' }, { title: 'auch favorisierter anderer kram' }],
  });
}
