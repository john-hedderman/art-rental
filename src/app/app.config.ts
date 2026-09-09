import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { counterReducer } from '../app/features/store-page/+state/store-page.reducer';
import { artRentalReducer } from './core/+state/core.reducer';
import { routes } from './app.routes';
import { AddArtEffects } from './features/art-store-page/add-art-store/+state/add-art-store.effects';
import { ArtDetailEffects } from './features/art-store-page/art-store-detail/+state/art-store-detail.effects';
import { CoreEffects } from './core/+state/core.effects';
import { TagEffects } from './features/admin/tags/+state/tags.effects';
import { AddArtistEffects } from './features/artists-ngrx/add-artist-ngrx/+state/add-artist-ngrx.effects';
import { ArtistDetailEffects } from './features/artists-ngrx/+state/artists-ngrx.effects';
import { TagsNgrxEffects } from './features/admin/tags-ngrx/+state/tags-ngrx.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withXhr()),
    provideStore({
      counter: counterReducer,
      artRental: artRentalReducer
    }),
    provideEffects([
      AddArtEffects,
      ArtDetailEffects,
      AddArtistEffects,
      ArtistDetailEffects,
      TagEffects,
      TagsNgrxEffects,
      CoreEffects
    ]),
    isDevMode()
      ? provideStoreDevtools({
          maxAge: 25, // Retains last 25 states
          logOnly: !isDevMode(), // Restrict extension in production
          trace: true, // Tracks where actions were dispatched
          traceLimit: 75
        })
      : []
  ]
};
