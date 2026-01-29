import { Component, ElementRef, Input, OnInit, output, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Tag } from '../../../model/models';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-tags',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './tags.html',
  styleUrl: './tags.scss',
  standalone: true,
})
export class Tags implements OnInit {
  @Input() assigneeField: string = '';
  @Input() assigneeId: number = 0;

  @ViewChild('tagSearch') tagSearch: ElementRef | undefined;

  tags: Tag[] = [];
  tags$: Observable<Tag[]> | undefined;
  assignedTags: Tag[] | undefined;
  assignedTags$: Observable<Tag[]> | undefined;

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
    this.dataService.tags$.subscribe((tags) => {
      this.tags = tags;
      this.sortByStringField(this.tags, 'name');
      this.tags$ = of(tags);
      const assignedTags = tags.filter((tag: Tag) =>
        (<Array<number>>tag[this.assigneeField]).includes(this.assigneeId),
      );
      this.assignedTags = assignedTags;
      this.assignedTags$ = of(assignedTags);
    });
  }

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.init();
  }
}
