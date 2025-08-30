import { Routes } from '@angular/router';

import { ArtPage } from './page/art-page/art-page';
import { ArtDetailsPage } from './page/art-page/art-details-page/art-details-page';
import { Home } from './page/home/home';
import { ArtistsPage } from './page/artists-page/artists-page';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
  },
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
    path: 'artists',
    component: ArtistsPage,
  },
  {
    path: '',
    redirectTo: '/art',
    pathMatch: 'full',
  },
];
