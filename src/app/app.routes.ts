import { Routes } from '@angular/router';

import { ArtPage } from './page/art/art-page';
import { ArtList } from './page/art/art-list/art-list';
import { ArtistsPage } from './page/artists/artists-page';
import { ArtistList } from './page/artists/artist-list/artist-list';
import { ClientsPage } from './page/clients/clients-page';
import { ClientList } from './page/clients/client-list/client-list';
import { AddClient } from './page/clients/add-client/add-client';
import { ClientDetail } from './page/clients/client-detail/client-detail';

export const routes: Routes = [
  {
    path: 'art',
    component: ArtPage,
    children: [
      {
        path: 'list',
        component: ArtList,
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'artists',
    component: ArtistsPage,
    children: [
      {
        path: 'list',
        component: ArtistList,
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
    ],
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
