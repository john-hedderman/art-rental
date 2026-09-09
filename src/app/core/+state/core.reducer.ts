import { createReducer, on } from '@ngrx/store';

import { initialState } from './core-state';
import { CoreDataActions } from './core.actions';
import * as Const from '../../constants';
import { ArtActions } from '../../features/art-store-page/+state/art-store.actions';
import { ArtistActions } from '../../features/artists-ngrx/+state/artists-ngrx.actions';
import { TagActions } from '../../features/admin/tags/+state/tags.actions';
import { TagsNgrxActions } from '../../features/admin/tags-ngrx/+state/tags-ngrx.actions';

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
    (state) => ({
      ...state,
      loading: true,
      error: null
    })
  ),
  on(CoreDataActions.loadAllDataSuccess, (state, { data }) => ({
    ...state,
    data,
    loading: false,
    loaded: true,
    error: null
  })),
  on(CoreDataActions.loadArtistsSuccess, (state, { artistItems }) => ({
    ...state,
    data: { ...state.data, artists: [...artistItems] },
    loading: false,
    loaded: true,
    opStatus: null,
    error: null
  })),
  on(CoreDataActions.loadJobsSuccess, (state, { jobItems }) => ({
    ...state,
    data: { ...state.data, jobs: [...jobItems] },
    loading: false,
    loaded: true,
    opStatus: null,
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
    loaded: true,
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

  on(ArtActions.deleteArt, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(ArtActions.deleteArtSuccess, (state, { job, artId, result }) => ({
    ...state,
    data: {
      ...state.data,
      art: state.data.art.filter((artItem) => artItem.art_id !== artId)
    },
    opStatus: result,
    error: null
  })),
  on(ArtActions.deleteArtUpdateJobSuccess, (state, { job, result }) => ({
    ...state,
    data: {
      ...state.data,
      jobs: [...state.data.jobs.filter((jobItem) => jobItem.job_id !== job.job_id), job]
    },
    opStatus: Const.SUCCESS,
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
    error: null
  })),
  on(ArtActions.addArtSuccess, (state, { artItem, oldJobItem, newJobItem }) => ({
    ...state,
    data: { ...state.data, art: [...state.data.art, artItem] },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtActions.editArtSuccess, (state, { artItem, oldJobItem, newJobItem }) => ({
    ...state,
    data: {
      ...state.data,
      art: [...state.data.art.filter((art) => art.art_id !== artItem.art_id), artItem]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtActions.editArtUpdateOldJobSuccess, (state, { artItem, oldJobItem, newJobItem }) => ({
    ...state,
    data: {
      ...state.data,
      jobs: [...state.data.jobs.filter((job) => job.job_id !== oldJobItem.job_id), oldJobItem]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtActions.addOrEditArtUpdateNewJobSuccess, (state, { oldJobItem, newJobItem }) => ({
    ...state,
    data: {
      ...state.data,
      jobs: [...state.data.jobs.filter((job) => job.job_id !== newJobItem.job_id), newJobItem]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  /*********************/
  /*                   */
  /*  ADD/DELETE TAGS  */
  /*                   */
  /*********************/

  on(TagsNgrxActions.addTag, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(TagsNgrxActions.addTagSuccess, (state, { tag }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [...state.data.tags, tag]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  on(TagsNgrxActions.deleteTag, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(TagsNgrxActions.deleteTagSuccess, (state, { tag }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [...state.data.tags.filter((tagItem) => tagItem.tag_id !== tag.tag_id)]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(TagsNgrxActions.deleteTagUpdateArtSuccess, (state, { tag, art }) => ({
    ...state,
    data: {
      ...state.data,
      art: state.data.art.map((artItem) => {
        const match = art.find((pieceOfArt) => pieceOfArt.art_id === artItem.art_id);
        return match ? match : artItem;
      })
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(TagsNgrxActions.deleteTagUpdateArtistsSuccess, (state, { tag, artists }) => ({
    ...state,
    data: {
      ...state.data,
      artists: state.data.artists.map((artistItem) => {
        const match = artists.find((artist) => artist.artist_id === artistItem.artist_id);
        return match ? match : artistItem;
      })
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  /***************************/
  /*                         */
  /*  UN/ASSIGN TAGS TO ART  */
  /*                         */
  /***************************/

  on(TagActions.assignTagToArt, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(TagActions.assignTagToArtSuccess, (state, { art, tag }) => ({
    ...state,
    data: {
      ...state.data,
      art: [...state.data.art.filter((artItem) => artItem.art_id !== art.art_id), art]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(TagActions.assignTagToArtUpdateTag, (state, { art, tag }) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(TagActions.assignTagToArtUpdateTagSuccess, (state, { tag }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [...state.data.tags.filter((tagItem) => tagItem.tag_id !== tag.tag_id), tag]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  on(TagActions.removeTagFromArt, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TagActions.removeTagFromArtSuccess, (state, { art, tag }) => ({
    ...state,
    data: {
      ...state.data,
      art: [...state.data.art.filter((artItem) => artItem.art_id !== art.art_id), art]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(TagActions.removeTagFromArtUpdateTag, (state, { art, tag }) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TagActions.removeTagFromArtUpdateTagSuccess, (state, { art, tag }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [...state.data.tags.filter((tagItem) => tagItem.tag_id !== tag.tag_id), tag]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  /******************************/
  /*                            */
  /*  UN/ASSIGN TAGS TO ARTIST  */
  /*                            */
  /******************************/

  on(TagActions.assignTagToArtist, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(TagActions.assignTagToArtistSuccess, (state, { artist, tag }) => ({
    ...state,
    data: {
      ...state.data,
      artists: [
        ...state.data.artists.filter((artistItem) => artistItem.artist_id !== artist.artist_id),
        artist
      ]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(TagActions.assignTagToArtistUpdateTag, (state, { artist, tag }) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(TagActions.assignTagToArtistUpdateTagSuccess, (state, { tag }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [...state.data.tags.filter((tagItem) => tagItem.tag_id !== tag.tag_id), tag]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  on(TagActions.removeTagFromArtist, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TagActions.removeTagFromArtistSuccess, (state, { artist, tag }) => ({
    ...state,
    data: {
      ...state.data,
      artists: [
        ...state.data.artists.filter((artistItem) => artistItem.artist_id !== artist.artist_id),
        artist
      ]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(TagActions.removeTagFromArtistUpdateTag, (state, { artist, tag }) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TagActions.removeTagFromArtistUpdateTagSuccess, (state, { artist, tag }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [...state.data.tags.filter((tagItem) => tagItem.tag_id !== tag.tag_id), tag]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  /*********************/
  /*                   */
  /*  ADD/EDIT ARTIST  */
  /*                   */
  /*********************/

  on(ArtistActions.addOrEditArtist, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArtistActions.addArtistSuccess, (state, { artist }) => ({
    ...state,
    data: { ...state.data, artists: [...state.data.artists, artist] },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),
  on(ArtistActions.editArtistSuccess, (state, { artist }) => ({
    ...state,
    data: {
      ...state.data,
      artists: [
        ...state.data.artists.filter((artistItem) => artistItem.artist_id !== artist.artist_id),
        artist
      ]
    },
    loading: false,
    opStatus: Const.SUCCESS,
    error: null
  })),

  /*******************/
  /*                 */
  /*  DELETE ARTIST  */
  /*                 */
  /*******************/

  on(ArtistActions.deleteArtist, (state) => ({
    ...state,
    loading: true,
    opStatus: null,
    error: null
  })),
  on(ArtistActions.deleteArtistSuccess, (state, { artist, tags }) => ({
    ...state,
    data: {
      ...state.data,
      artists: state.data.artists.filter((artistItem) => artistItem.artist_id !== artist.artist_id)
    },
    error: null
  })),
  on(ArtistActions.deleteArtistUpdateTagsSuccess, (state, { artist, tags }) => ({
    ...state,
    data: {
      ...state.data,
      tags: [
        ...state.data.tags.filter((tagItem) => {
          let result = false;
          for (const tag of tags) {
            if (tag.tag_id !== tagItem.tag_id) {
              result = true;
              break;
            }
          }
          return result;
        }),
        ...tags
      ]
    },
    opStatus: Const.SUCCESS,
    error: null
  }))
);
