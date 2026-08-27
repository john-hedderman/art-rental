import { createActionGroup, props } from '@ngrx/store';

import { IArt } from '../../../../model/models';

export const TagActions = createActionGroup({
  source: 'Tags',
  events: {
    'Assign Tag To Art': props<{ art: IArt; tagId: number }>(),
    'Assign Tag To Art Success': props<{ art: IArt; tagId: number }>(),
    'Assign Tag Update Art Success': props<{ art: IArt; tagId: number; result: string }>()
  }
});
