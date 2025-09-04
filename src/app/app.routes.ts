import { Routes } from '@angular/router';

import { Home } from './page/home/home';
import { ArtPage } from './page/art/art-page';
import { ArtistsPage } from './page/artists/artists-page';
import { ClientsPage } from './page/clients/clients-page';

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
