import { Routes } from '@angular/router';

import { Home } from './page/home/home';
import { ArtPage } from './page/art-page/art-page';
import { ArtistsPage } from './page/artists-page/artists-page';
import { ClientsPage } from './page/clients-page/clients-page';

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
    path: 'clients',
    component: ClientsPage,
  },
  {
    path: '',
    redirectTo: '/art',
    pathMatch: 'full',
  },
];
