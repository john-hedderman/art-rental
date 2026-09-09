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
    'Delete Tag Update Artists Success': props<{ tag: ITag; artists: IArtist[] }>()
  }
});
