import { RedirectCommand, ResolveFn, Router, Routes } from '@angular/router';
import { RecipeView } from './recipe-view/recipe-view';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { Recipe } from './recipe.model';
import { RecipesService } from './recipes.service';

const recipeResolver: ResolveFn<Recipe> = (route) => {
  const shortTitle = route.paramMap.get('shortTitle')!;
  const router = inject(Router);
  const recipesService = inject(RecipesService);

  return recipesService.getRecipeByShortTitle(shortTitle).pipe(
    catchError(() => {
      const notFoundUrl = router.parseUrl('/404');
      throw new RedirectCommand(notFoundUrl);
    }),
  );
};

export const routes: Routes = [
  // home: only the selection card
  {
    path: '',
    component: RecipeView,
    title: 'Foodie Flip',
  },
  // recipe view: selection + recipe side-by-side
  {
    path: 'recipe/:shortTitle',
    component: RecipeView,
    resolve: {
      recipe: recipeResolver,
    },
  },
  // legal/info pages

  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Contact',
  },

  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not Found',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
