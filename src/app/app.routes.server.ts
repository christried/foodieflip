import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'imprint', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  // dynamic route — recipe shortTitle is unknown at build time, render on each request
  { path: 'recipe/:shortTitle', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
