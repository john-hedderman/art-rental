import { Routes } from '@angular/router';

import { ArtPage } from './features/art/art-page';
import { ArtList } from './features/art/art-list/art-list';
import { ArtistsPage } from './features/artists/artists-page';
import { ArtistList } from './features/artists/artist-list/artist-list';
import { ClientsPage } from './features/clients/clients-page';
import { ClientList } from './features/clients/client-list/client-list';
import { AddClient } from './features/clients/add-client/add-client';
import { ClientDetail } from './features/clients/client-detail/client-detail';
import { JobsPage } from './features/jobs/jobs-page';
import { JobList } from './features/jobs/job-list/job-list';
import { AddJob } from './features/jobs/add-job/add-job';
import { JobDetail } from './features/jobs/job-detail/job-detail';
import { ArtDetail } from './features/art/art-detail/art-detail';
import { ContactsPage } from './features/contacts/contacts-page';
import { ContactList } from './features/contacts/contact-list/contact-list';

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
        path: ':id',
        component: ArtDetail,
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
    component: JobsPage,
    children: [
      {
        path: 'list',
        component: JobList,
      },
      {
        path: 'add',
        component: AddJob,
      },
      {
        path: ':id',
        component: JobDetail,
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'contacts',
    component: ContactsPage,
    children: [
      {
        path: 'list',
        component: ContactList,
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
