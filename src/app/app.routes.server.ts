import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  // authenticated route — depends on runtime auth state, so it cannot be prerendered at build time
  { path: 'user', renderMode: RenderMode.Client },

  // dynamic route — recipe shortTitle is unknown at build time, render on each request
  { path: 'recipe/:shortTitle', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
