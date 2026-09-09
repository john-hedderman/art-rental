import { createSelector } from '@ngrx/store';
import { ITag } from '../../../../model/models';
import { selectTags } from '../../../../core/+state/core.selectors';

export const selectTagById = (id: number) =>
  createSelector(selectTags, (tagItems) => tagItems.find((tag: ITag) => tag.tag_id === id)!);
