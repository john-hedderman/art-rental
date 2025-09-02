import { Routes } from '@angular/router';

import { Home } from './page/home/home';
import { ArtPage } from './page/art-page/art-page';
import { ArtistsPage } from './page/artists-page/artists-page';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'art',
    component: ArtPage,
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
