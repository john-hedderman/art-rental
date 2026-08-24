import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AppState } from '../+state/core-state';

export const selectAppState = createFeatureSelector<AppState>('artRental');

export const selectArt = createSelector(selectAppState, (state: AppState) => state.data.art);
export const selectArtists = createSelector(
  selectAppState,
  (state: AppState) => state.data.artists
);
export const selectClients = createSelector(
  selectAppState,
  (state: AppState) => state.data.clients
);
export const selectContacts = createSelector(
  selectAppState,
  (state: AppState) => state.data.contacts
);
export const selectJobs = createSelector(selectAppState, (state: AppState) => state.data.jobs);
export const selectSites = createSelector(selectAppState, (state: AppState) => state.data.sites);
export const selectTags = createSelector(selectAppState, (state: AppState) => state.data.tags);

export const selectLoading = createSelector(selectAppState, (state: AppState) => state.loading);
export const selectOpStatus = createSelector(selectAppState, (state: AppState) => state.opStatus);
export const selectError = createSelector(selectAppState, (state: AppState) => state.error);
