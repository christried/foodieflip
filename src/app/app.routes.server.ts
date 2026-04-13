import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'user', renderMode: RenderMode.Client },

  // dynamic route — recipe shortTitle is unknown at build time, render on each request
  { path: 'recipe/:shortTitle', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
