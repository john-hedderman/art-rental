import { createReducer, on } from '@ngrx/store';
import { DataActions } from './art-store-page.actions';
import { IArt } from '../../../model/models';

export interface DataState {
  items: IArt[];
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  items: [],
  loading: false,
  error: null
};

export const artReducer = createReducer(
  initialState,
  on(DataActions.loadData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(DataActions.loadDataSuccess, (state, { items }) => ({
    ...state,
    items,
    loading: false
  })),
  on(DataActions.loadDataFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    error: errorMessage
  }))
);
