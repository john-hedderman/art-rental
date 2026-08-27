import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  output,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { delay, Observable, Subject, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IArt, ITag } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { TagPill } from '../tag-pill/tag-pill';
import { Store } from '@ngrx/store';
import { selectArt, selectTags } from '../../../core/+state/core.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Component({
  selector: 'app-tags',
  imports: [AsyncPipe, ReactiveFormsModule, TagPill],
  templateUrl: './tags.html',
  styleUrl: './tags.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class Tags implements OnInit, OnDestroy {
  @Input() assigneeField: string = '';
  @Input() assigneeId: number = 0;

  @ViewChild('tagSearch') tagSearch: ElementRef | undefined;

  private readonly destroy$ = new Subject<void>();

  tags: ITag[] = [];
  tags$: Observable<ITag[]>;
  assignedTags: ITag[] | undefined;
  assignedTags$: Observable<ITag[]> | undefined;

  addingTag = output<number>();
  removingTag = output<number>();

  onFocusTagSearch() {
    const tagNotInSystemEl = document.getElementById('tag-not-in-system') as HTMLDivElement;
    tagNotInSystemEl.classList.remove('d-block');
    const tagAlreadyAssignedEl = document.getElementById('tag-already-assigned') as HTMLDivElement;
    tagAlreadyAssignedEl.classList.remove('d-block');
  }

  onClickDeleteTag(tagId: number) {
    this.removingTag.emit(tagId);
  }

  onClickAddTag() {
    const tagSearchEl = this.tagSearch?.nativeElement as HTMLInputElement;
    const tagValue = tagSearchEl.value.toLowerCase();

    const tagNotInSystemEl = document.getElementById('tag-not-in-system') as HTMLDivElement;
    const tagAlreadyAssignedEl = document.getElementById('tag-already-assigned') as HTMLDivElement;

    if (tagValue !== '' && !this.tags?.map((tag) => tag.name)?.includes(tagValue)) {
      tagNotInSystemEl.classList.add('d-block');
      return;
    } else {
      tagNotInSystemEl.classList.remove('d-block');
    }

    if (tagValue !== '' && this.assignedTags?.map((tag) => tag.name)?.includes(tagValue)) {
      tagAlreadyAssignedEl.classList.add('d-block');
      return;
    } else {
      tagAlreadyAssignedEl.classList.remove('d-block');
    }

    const tagId = this.tags?.find((tag) => tag.name.toLowerCase() === tagValue)?.tag_id;
    if (tagId) {
      tagSearchEl.value = '';
      this.addingTag.emit(tagId);
    }
  }

  sortByStringField(sortable: any[], field: string) {
    sortable.sort((a: any, b: any) => (a[field] || '').localeCompare(b[field] || ''));
  }

  loadData(dataObservable: Observable<any>, action: any, refresh?: boolean) {
    dataObservable.pipe(take(1)).subscribe((data) => {
      if (refresh || !data || data.length === 0) {
        this.store.dispatch(() => action());
      }
    });
  }

  init() {
    this.loadData(this.tags$, CoreDataActions.loadAllData, true);
    this.tags$.pipe(take(1), delay(1000)).subscribe((tags) => {
      this.tags = tags;
    });
  }

  constructor(
    private dataService: DataService,
    private store: Store
  ) {
    this.tags$ = this.store.select(selectTags);
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
