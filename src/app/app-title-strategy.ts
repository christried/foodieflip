import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Recipe } from './recipe.model';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(routerState: RouterStateSnapshot): void {
    // Use static title if the route defines one
    const title = this.buildTitle(routerState);
    if (title) {
      this.title.setTitle(title);
      return;
    }

    // For recipe routes: read title from resolved route data
    let route = routerState.root;
    while (route.firstChild) route = route.firstChild;
    const recipe = route.data['recipe'] as Recipe | undefined;
    if (recipe?.title) {
      this.title.setTitle(recipe.title);
    }
  }
}
