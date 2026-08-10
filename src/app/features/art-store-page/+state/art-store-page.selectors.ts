import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DataState } from '../../../core/+state/core-state';

export const selectDataState = createFeatureSelector<DataState>('art');

export const selectArt = createSelector(selectDataState, (state: DataState) => state.data.art);
