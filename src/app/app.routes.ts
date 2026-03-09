import { ResolveFn, Routes } from '@angular/router';
import { RecipeView } from './recipe-view/recipe-view';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Recipe } from './recipe.model';

const recipeTitleResolver: ResolveFn<string> = (route) => {
  const shortTitle = route.paramMap.get('shortTitle')!;
  return inject(HttpClient)
    .get<Recipe>(`http://localhost:3000/api/recipes/${shortTitle}`)
    .pipe(
      map((recipe) => recipe.title),
      catchError(() => of('Recipe')),
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
    title: recipeTitleResolver,
  },
  // legal/info pages
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'About',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Contact',
  },
  {
    path: 'imprint',
    loadComponent: () => import('./pages/imprint/imprint').then((m) => m.Imprint),
    title: 'Imprint',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
    title: 'Privacy and Terms',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
