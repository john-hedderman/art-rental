import { Routes } from '@angular/router';

import { ArtPage } from './features/art/art-page';
import { ArtList } from './features/art/art-list/art-list';
import { AddArt } from './features/art/add-art/add-art';
import { ArtistsPage } from './features/artists/artists-page';
import { ArtistList } from './features/artists/artist-list/artist-list';
import { AddArtist } from './features/artists/add-artist/add-artist';
import { ArtistDetail } from './features/artists/artist-detail/artist-detail';
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
import { SitesPage } from './features/sites/sites-page';
import { SiteList } from './features/sites/site-list/site-list';
import { AddSite } from './features/sites/add-site/add-site';
import { SiteDetail } from './features/sites/site-detail/site-detail';
import { ContactDetail } from './features/contacts/contact-detail/contact-detail';
import { AddContact } from './features/contacts/add-contact/add-contact';

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
        path: 'add',
        component: AddArt,
      },
      {
        path: ':id',
        component: ArtDetail,
      },
      {
        path: ':id/edit',
        component: AddArt,
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
        path: 'add',
        component: AddArtist,
      },
      {
        path: ':id',
        component: ArtistDetail,
      },
      {
        path: ':id/edit',
        component: AddArtist,
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
        path: ':id/edit',
        component: AddClient,
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
        path: 'add',
        component: AddContact,
      },
      {
        path: ':id',
        component: ContactDetail,
      },
      {
        path: ':id/edit',
        component: AddContact,
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'sites',
    component: SitesPage,
    children: [
      {
        path: 'list',
        component: SiteList,
      },
      {
        path: 'add',
        component: AddSite,
      },
      {
        path: ':id',
        component: SiteDetail,
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
