import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { IArtist } from '../../../model/models';
import { Card } from '../../../shared/components/card/card';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { selectArtists } from '../../../core/+state/core.selectors';

@Component({
  imports: [PageHeader, Card, AsyncPipe, PageFooter],
  selector: 'app-artists-ngrx-list',
  styleUrl: './artists-ngrx-list.scss',
  templateUrl: './artists-ngrx-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ArtistsNgrxList implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  goToArtistDetail = (id: number) => this.router.navigate(['/artists-ngrx', id]);
  goToAddArtist = () => this.router.navigate(['/artists-ngrx', 'add']);

  headerData = new HeaderActions('artist-list', 'Artists', [], []);
  footerData = new FooterActions([new AddButton('Add Artist', this.goToAddArtist)]);

  artists$: Observable<IArtist[]> | undefined;
  artists: IArtist[] = [];

  constructor() {
    this.artists$ = this.store.select(selectArtists);
  }

  ngOnInit(): void {
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));
  }
}
