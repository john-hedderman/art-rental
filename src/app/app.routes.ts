import { Routes } from '@angular/router';

import { ArtPage } from './page/art-page/art-page';
import { ArtDetailsPage } from './page/art-page/art-details-page/art-details-page';

export const routes: Routes = [
  {
    path: 'art',
    component: ArtPage,
    children: [
      {
        path: ':artworkId',
        component: ArtDetailsPage,
      },
    ],
  },
  {
    path: '',
    redirectTo: '/art',
    pathMatch: 'full',
  },
];
