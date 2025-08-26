import { Routes } from '@angular/router';

import { ArtPage } from './page/art-page/art-page';

export const routes: Routes = [
  {
    path: 'art',
    component: ArtPage,
  },
  {
    path: '',
    redirectTo: '/art',
    pathMatch: 'full',
  },
];
