import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../../../core/+state/core-state';
import { IArt } from '../../../../model/models';
import { selectArt } from '../../../../core/+state/core.selectors';

export const selectAppState = createFeatureSelector<AppState>('artDetail');

export const selectArtById = (id: number) =>
  createSelector(selectArt, (artItems) => artItems.find((art: IArt) => art.art_id === id)!);
