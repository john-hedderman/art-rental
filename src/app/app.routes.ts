import { Routes } from '@angular/router';

import { ArtPage } from './features/art/art-page';
import { ArtList } from './features/art/art-list/art-list';
import { ArtistsPage } from './features/artists/artists-page';
import { ArtistList } from './features/artists/artist-list/artist-list';
import { ClientsPage } from './features/clients/clients-page';
import { ClientList } from './features/clients/client-list/client-list';
import { AddClient } from './features/clients/add-client/add-client';
import { ClientDetail } from './features/clients/client-detail/client-detail';
import { Jobs } from './features/jobs/jobs';
import { TableTest } from './features/table-test/table-test';

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
    path: 'jobs',
    component: Jobs,
  },
  {
    path: 'table',
    component: TableTest,
  },
  {
    path: '',
    redirectTo: '/art',
    pathMatch: 'full',
  },
];
