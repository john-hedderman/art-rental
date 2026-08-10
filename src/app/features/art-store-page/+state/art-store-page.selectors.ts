import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../../core/+state/core-state';

export const selectAppState = createFeatureSelector<AppState>('art');

export const selectArt = createSelector(selectAppState, (state: AppState) => state.data.art);
