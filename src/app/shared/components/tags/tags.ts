import { Component, ElementRef, Input, OnDestroy, OnInit, output, ViewChild } from '@angular/core';
import { distinctUntilChanged, Observable, of, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ITag } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { TagPill } from '../tag-pill/tag-pill';

@Component({
  selector: 'app-tags',
  imports: [AsyncPipe, ReactiveFormsModule, TagPill],
  templateUrl: './tags.html',
  styleUrl: './tags.scss',
  standalone: true
})
export class Tags implements OnInit, OnDestroy {
  @Input() assigneeField: string = '';
  @Input() assigneeId: number = 0;

  @ViewChild('tagSearch') tagSearch: ElementRef | undefined;

  private readonly destroy$ = new Subject<void>();

  tags: ITag[] = [];
  tags$: Observable<ITag[]> | undefined;
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

  init() {
    this.dataService.tags$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((tags) => {
        this.tags = tags;
        this.sortByStringField(this.tags, 'name');
        this.tags$ = of(tags);
        const assignedTags = tags.filter((tag: ITag) =>
          (<Array<number>>tag[this.assigneeField]).includes(this.assigneeId)
        );
        this.assignedTags = assignedTags;
        this.assignedTags$ = of(assignedTags);
      });
  }

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
