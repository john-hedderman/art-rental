import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { counterReducer } from '../app/features/store-page/+state/store-page.reducer';
import { artReducer } from '../app/features/art-store-page/+state/art-store-page.reducer';
import { routes } from './app.routes';
import { ArtEffects } from './features/art-store-page/+state/art-store-page.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withXhr()),
    provideStore({ art: artReducer, counter: counterReducer }),
    provideEffects([ArtEffects])
  ]
};
