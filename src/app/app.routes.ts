import { Routes } from '@angular/router';
import { Selection } from './selection/selection';

export const routes: Routes = [
  // home: only the selection card
  {
    path: '',
    component: Selection,
    title: 'Foodie Flip',
  },
  // recipe view: selection + recipe side-by-side
  {
    path: 'recipe/:id',
    loadComponent: () => import('./recipe-view/recipe-view').then((m) => m.RecipeView),
    title: 'Recipe',
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
