import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  takeUntil,
} from 'rxjs';

import { Artist, Tag } from '../../../model/models';
import { Card } from '../../../shared/components/card/card';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';

@Component({
  selector: 'app-artist-list',
  imports: [Card, PageHeader, PageFooter, AsyncPipe],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtistList implements OnInit, OnDestroy {
  goToArtistDetail = (id: number) => this.router.navigate(['/artists', id]);
  goToAddArtist = () => this.router.navigate(['/artists', 'add']);

  headerData = new HeaderActions('artist-list', 'Artists', [], []);
  footerData = new FooterActions([new AddButton('Add Artist', this.goToAddArtist)]);

  artists: Artist[] = [];
  artists$: Observable<Artist[]> | undefined;

  private readonly destroy$ = new Subject<void>();

  init() {
    this.getCombinedData$().subscribe(({ artists, tags }) => {
      if (artists) {
        this.artists = artists.map((artist) => {
          const tagList = artist.tag_ids.map((tag_id) => {
            const tag = tags.find((tag) => tag.tag_id === tag_id);
            return tag?.name;
          });
          artist.tagList = tagList.join(', ');
          return artist;
        });
        this.artists$ = of(this.artists);
      }
    });
  }

  getCombinedData$(): Observable<{
    artists: Artist[];
    tags: Tag[];
  }> {
    return combineLatest({
      artists: this.dataService.artists$,
      tags: this.dataService.tags$,
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(500));
  }

  constructor(
    private dataService: DataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
