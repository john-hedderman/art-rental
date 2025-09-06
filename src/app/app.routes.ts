import { Routes } from '@angular/router';

import { Home } from './page/home/home';
import { ArtPage } from './page/art/art-page';
import { ArtistsPage } from './page/artists/artists-page';
import { ClientsPage } from './page/clients/clients-page';
import { ClientList } from './page/clients/client-list/client-list';
import { AddClient } from './page/clients/add-client/add-client';
import { ClientDetail } from './page/clients/client-detail/client-detail';

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
    children: [
      {
        path: 'list',
        component: ClientList,
      },
      {
        path: 'add',
        component: AddClient,
      },
      {
        path: ':id',
        component: ClientDetail,
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/art',
    pathMatch: 'full',
  },
];
