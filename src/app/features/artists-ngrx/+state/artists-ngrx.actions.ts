import { createActionGroup, props } from '@ngrx/store';
import { IArtist } from '../../../model/models';

export const ArtistActions = createActionGroup({
  source: 'Artists',
  events: {
    'Add Or Edit Artist': props<{
      isEdit: boolean;
      artist: IArtist;
    }>(),
    'Add Artist Success': props<{ artist: IArtist }>(),
    'Edit Artist Success': props<{ artist: IArtist }>()
  }
});
