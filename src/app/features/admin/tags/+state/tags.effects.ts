import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, of, switchMap } from 'rxjs';

import { CoreDataActions } from '../../../../core/+state/core.actions';
import { DataService } from '../../../../service/data-service';
import { Collections } from '../../../../shared/enums/collections';
import { TagsNgrxActions } from '../../tags-ngrx/+state/tags-ngrx.actions';

@Injectable()
export class TagEffects {
  private actions$ = inject(Actions);
  private dataService = inject(DataService);

  assignTagToArt$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.assignTagToArt),
        switchMap(({ art, tag }) => {
          const artItem = { ...art };
          delete (artItem as any)._id;
          artItem.tag_ids = [...art.tag_ids.filter((tag_id) => tag_id !== tag.tag_id), tag.tag_id];
          return from(
            this.dataService.saveDocument(artItem, Collections.Art, artItem.art_id, 'art_id')
          ).pipe(
            map((result) => {
              return TagsNgrxActions.assignTagToArtSuccess({ art: artItem, tag });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.assignTagToArtSuccess),
        switchMap(({ art, tag }) => {
          return of(TagsNgrxActions.assignTagToArtUpdateTag({ art, tag }));
        })
      );
    },
    { functional: true }
  );

  assignTagToArtUpdateTag$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.assignTagToArtUpdateTag),
        switchMap(({ art, tag }) => {
          const tagItem = { ...tag };
          delete (tagItem as any)._id;
          tagItem.art_ids = [...tag.art_ids.filter((art_id) => art_id !== art.art_id), art.art_id];
          return from(
            this.dataService.saveDocument(tagItem, Collections.Tags, tagItem.tag_id, 'tag_id')
          ).pipe(
            map((result) => {
              return TagsNgrxActions.assignTagToArtUpdateTagSuccess({ tag: tagItem });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtUpdateTagSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.assignTagToArtUpdateTagSuccess),
      delay(2000),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });

  removeTagFromArt$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.removeTagFromArt),
        switchMap(({ art, tag }) => {
          const artist = art.artist;
          const job = art.job;
          const artItem = { ...art };
          delete (artItem as any)._id;
          delete artItem.artist;
          delete artItem.job;
          artItem.tag_ids = art.tag_ids.filter((tag_id) => tag_id !== tag.tag_id);
          return from(
            this.dataService.saveDocument(artItem, Collections.Art, artItem.art_id, 'art_id')
          ).pipe(
            map(() => {
              // add artist and job info back into art item before passing it along for store insertion
              const art = { ...artItem, artist, job };
              return TagsNgrxActions.removeTagFromArtSuccess({ art, tag });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  removeTagFromArtSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.removeTagFromArtSuccess),
        switchMap(({ art, tag }) => {
          return of(TagsNgrxActions.removeTagFromArtUpdateTag({ art, tag }));
        })
      );
    },
    { functional: true }
  );

  removeTagFromArtUpdateTag$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.removeTagFromArtUpdateTag),
        switchMap(({ art, tag }) => {
          const tagItem = { ...tag };
          delete (tagItem as any)._id;
          tagItem.art_ids = [...tag.art_ids.filter((art_id) => art_id !== art.art_id)];
          return from(
            this.dataService.saveDocument(tagItem, Collections.Tags, tagItem.tag_id, 'tag_id')
          ).pipe(
            map((result) => {
              return TagsNgrxActions.removeTagFromArtUpdateTagSuccess({ art, tag: tagItem });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtist$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.assignTagToArtist),
        switchMap(({ artist, tag }) => {
          const artistItem = { ...artist };
          delete (artistItem as any)._id;
          artistItem.tag_ids = [
            ...artist.tag_ids.filter((tag_id) => tag_id !== tag.tag_id),
            tag.tag_id
          ];
          return from(
            this.dataService.saveDocument(
              artistItem,
              Collections.Artists,
              artistItem.artist_id,
              'artist_id'
            )
          ).pipe(
            map((result) => {
              return TagsNgrxActions.assignTagToArtistSuccess({ artist: artistItem, tag });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtistSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.assignTagToArtistSuccess),
        switchMap(({ artist, tag }) => {
          return of(TagsNgrxActions.assignTagToArtistUpdateTag({ artist, tag }));
        })
      );
    },
    { functional: true }
  );

  assignTagToArtistUpdateTag$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.assignTagToArtistUpdateTag),
        switchMap(({ artist, tag }) => {
          const tagItem = { ...tag };
          delete (tagItem as any)._id;
          tagItem.artist_ids = [
            ...tag.artist_ids.filter((artist_id) => artist_id !== artist.artist_id),
            artist.artist_id
          ];
          return from(
            this.dataService.saveDocument(tagItem, Collections.Tags, tagItem.tag_id, 'tag_id')
          ).pipe(
            map((result) => {
              return TagsNgrxActions.assignTagToArtistUpdateTagSuccess({ tag: tagItem });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtistUpdateTagSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.assignTagToArtistUpdateTagSuccess),
      delay(2000),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });

  removeTagFromArtist$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.removeTagFromArtist),
        switchMap(({ artist, tag }) => {
          const artistItem = { ...artist };
          delete (artistItem as any)._id;
          artistItem.tag_ids = artist.tag_ids.filter((tag_id) => tag_id !== tag.tag_id);
          return from(
            this.dataService.saveDocument(
              artistItem,
              Collections.Artists,
              artistItem.artist_id,
              'artist_id'
            )
          ).pipe(
            map(() => TagsNgrxActions.removeTagFromArtistSuccess({ artist, tag })),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  removeTagFromArtistSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.removeTagFromArtistSuccess),
        switchMap(({ artist, tag }) => {
          return of(TagsNgrxActions.removeTagFromArtistUpdateTag({ artist, tag }));
        })
      );
    },
    { functional: true }
  );

  removeTagFromArtistUpdateTag$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagsNgrxActions.removeTagFromArtistUpdateTag),
        switchMap(({ artist, tag }) => {
          const tagItem = { ...tag };
          delete (tagItem as any)._id;
          tagItem.artist_ids = [
            ...tag.artist_ids.filter((artist_id) => artist_id !== artist.artist_id)
          ];
          return from(
            this.dataService.saveDocument(tagItem, Collections.Tags, tagItem.tag_id, 'tag_id')
          ).pipe(
            map((result) => {
              return TagsNgrxActions.removeTagFromArtistUpdateTagSuccess({ artist, tag: tagItem });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );
}
