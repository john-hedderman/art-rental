import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { IArt, IArtist, ITag } from '../../../../model/models';

export const TagsNgrxActions = createActionGroup({
  source: 'TagsNgrx',
  events: {
    'Add Tag': props<{ tag: ITag }>(),
    'Add Tag Success': props<{ tag: ITag }>(),

    'Delete Tag': props<{ tag: ITag }>(),
    'Delete Tag Success': props<{ tag: ITag }>(),
    'Delete Tag Update Art': props<{ tag: ITag; art: IArt[] }>(),
    'Delete Tag Update Art Success': props<{ tag: ITag; art: IArt[] }>(),
    'Delete Tag Update Artists': props<{ tag: ITag; artists: IArtist[] }>(),
    'Delete Tag Update Artists Success': props<{ tag: ITag; artists: IArtist[] }>(),

    'Assign Tag To Art': props<{ art: IArt; tag: ITag }>(),
    'Assign Tag To Art Success': props<{ art: IArt; tag: ITag }>(),
    'Assign Tag To Art Update Tag': props<{ art: IArt; tag: ITag }>(),
    'Assign Tag To Art Update Tag Success': props<{ tag: ITag }>(),
    'Remove Tag From Art': props<{ art: IArt; tag: ITag }>(),
    'Remove Tag From Art Success': props<{ art: IArt; tag: ITag }>(),
    'Remove Tag From Art Update Tag': props<{ art: IArt; tag: ITag }>(),
    'Remove Tag From Art Update Tag Success': props<{ art: IArt; tag: ITag }>(),

    'Assign Tag To Artist': props<{ artist: IArtist; tag: ITag }>(),
    'Assign Tag To Artist Success': props<{ artist: IArtist; tag: ITag }>(),
    'Assign Tag To Artist Update Tag': props<{ artist: IArtist; tag: ITag }>(),
    'Assign Tag To Artist Update Tag Success': props<{ tag: ITag }>(),
    'Remove Tag From Artist': props<{ artist: IArtist; tag: ITag }>(),
    'Remove Tag From Artist Success': props<{ artist: IArtist; tag: ITag }>(),
    'Remove Tag From Artist Update Tag': props<{ artist: IArtist; tag: ITag }>(),
    'Remove Tag From Artist Update Tag Success': props<{ artist: IArtist; tag: ITag }>()
  }
});
