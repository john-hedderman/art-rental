import { createSelector } from '@ngrx/store';
import { IArtist } from '../../../model/models';
import { selectArtists } from '../../../core/+state/core.selectors';

export const selectArtistById = (id: number) =>
  createSelector(
    selectArtists,
    (artists) => artists.find((artist: IArtist) => artist.artist_id === id)!
  );
