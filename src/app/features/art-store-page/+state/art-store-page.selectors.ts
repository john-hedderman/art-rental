import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DataState } from './art-store-page.reducer';

export const selectItemsState = createFeatureSelector<DataState>('art');

export const selectItems = createSelector(selectItemsState, (state: DataState) => state.items);
