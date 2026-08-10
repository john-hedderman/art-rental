import { createReducer, on } from '@ngrx/store';
import { ArtDataActions } from './art-store-page.actions';
import { initialState } from '../../../core/+state/core-state';

export const artReducer = createReducer(
  initialState,
  on(ArtDataActions.loadArtData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArtDataActions.loadArtDataSuccess, (state, { artItems }) => ({
    ...state,
    data: { ...state.data, art: [...state.data.art, ...artItems] },
    loading: false
  })),
  on(ArtDataActions.loadArtDataFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    error: errorMessage
  }))
);
