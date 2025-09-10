import { Routes } from '@angular/router';

import { ArtPage } from './pages/art/art-page';
import { ArtList } from './pages/art/art-list/art-list';
import { ArtistsPage } from './pages/artists/artists-page';
import { ArtistList } from './pages/artists/artist-list/artist-list';
import { ClientsPage } from './pages/clients/clients-page';
import { ClientList } from './pages/clients/client-list/client-list';
import { AddClient } from './pages/clients/add-client/add-client';
import { ClientDetail } from './pages/clients/client-detail/client-detail';

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
