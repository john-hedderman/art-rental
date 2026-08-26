import { createReducer, on } from '@ngrx/store';

import { initialState } from './core-state';
import { CoreDataActions, ArtActions } from './core.actions';
import * as Const from '../../constants';

export const artRentalReducer = createReducer(
  initialState,

  /***************/
  /*             */
  /*  DATA LOAD  */
  /*             */
  /***************/
  on(
    CoreDataActions.loadAllData,
    CoreDataActions.loadArt,
    CoreDataActions.loadArtists,
    CoreDataActions.loadJobs,
    (state, { refresh }) => ({
      ...state,
      loading: true,
      opStatus: null,
      error: null
    })
  ),
  on(CoreDataActions.loadAllDataSuccess, (state, { data }) => ({
    ...state,
    data,
    loading: false,
    error: null
  })),
  on(CoreDataActions.loadArtistsSuccess, (state, { artistItems }) => ({
    ...state,
    data: { ...state.data, artists: [...artistItems] },
    loading: false,
    error: null
  })),
  on(CoreDataActions.loadJobsSuccess, (state, { jobItems }) => ({
    ...state,
    data: { ...state.data, jobs: [...jobItems] },
    loading: false,
    error: null
  })),

  /*********************/
  /*                   */
  /*  GENERAL ACTIONS  */
  /*                   */
  /*********************/
  on(CoreDataActions.generalFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    opStatus: Const.FAILURE,
    error: errorMessage
  })),
  on(CoreDataActions.clearOpStatus, (state) => ({
    ...state,
    opStatus: null
  })),

  /****************/
  /*              */
  /*  DELETE ART  */
  /*              */
  /****************/
  on(ArtActions.deleteArtItem, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(ArtActions.deleteArtItemSuccess, (state, { job, artId, result }) => ({
    ...state,
    data: {
      ...state.data,
      art: state.data.art.filter((artItem) => artItem.art_id !== artId)
    },
    opStatus: result,
    error: null
  })),
  on(ArtActions.deleteArtItemUpdateJobSuccess, (state, { job, result }) => ({
    ...state,
    data: {
      ...state.data,
      jobs: [...state.data.jobs.filter((jobItem) => jobItem.job_id !== job.job_id), job]
    },
    opStatus: result,
    error: null
  })),

  /******************/
  /*                */
  /*  ADD/EDIT ART  */
  /*                */
  /******************/
  on(ArtActions.addOrEditArt, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(ArtActions.addArtSuccess, (state, { artItem }) => ({
    ...state,
    data: { ...state.data, art: [...state.data.art, artItem] },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtActions.editArtSuccess, (state, { artItem }) => ({
    ...state,
    data: {
      ...state.data,
      art: [...state.data.art.filter((art) => art.art_id !== artItem.art_id), artItem]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtActions.editArtUpdateOldJobSuccess, (state, { oldJobItem, newJobItem }) => ({
    ...state,
    data: {
      ...state.data,
      jobs: [...state.data.jobs.filter((job) => job.job_id !== oldJobItem?.job_id), oldJobItem]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtActions.addOrEditArtUpdateNewJobSuccess, (state, { oldJobItem, newJobItem }) => ({
    ...state,
    data: {
      ...state.data,
      jobs: [...state.data.jobs.filter((job) => job.job_id !== newJobItem?.job_id), newJobItem]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  }))
);
