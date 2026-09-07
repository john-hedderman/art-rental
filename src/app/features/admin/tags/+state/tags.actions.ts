import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { IArt, IArtist, ITag } from '../../../../model/models';

export const TagActions = createActionGroup({
  source: 'Tags',
  events: {
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
