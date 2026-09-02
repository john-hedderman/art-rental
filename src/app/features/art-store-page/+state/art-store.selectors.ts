import { createSelector } from '@ngrx/store';
import { IArt } from '../../../model/models';
import { selectArt } from '../../../core/+state/core.selectors';

export const selectArtById = (id: number) =>
  createSelector(selectArt, (artItems) => artItems.find((art: IArt) => art.art_id === id)!);
