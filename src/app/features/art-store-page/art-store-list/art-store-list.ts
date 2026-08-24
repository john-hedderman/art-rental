import { Component, inject, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { Card } from '../../../shared/components/card/card';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { selectArt, selectArtists, selectJobs } from '../../../core/+state/core.selectors';
import { IArt, IArtist, IJob } from '../../../model/models';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Component({
  selector: 'app-art-store-list',
  imports: [Card, PageHeader, FormsModule, PageFooter, AsyncPipe],
  templateUrl: './art-store-list.html',
  styleUrl: './art-store-list.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ArtStoreList implements OnInit, OnDestroy {
  goToArtDetail = (id: number) => this.router.navigate(['/art-store', id]);
  goToAddArt = () => this.router.navigate(['/art-store', 'add']);

  headerData = new HeaderActions('art-store-list', 'Art', [], []);
  footerData = new FooterActions([new AddButton('Add Art', this.goToAddArt)]);

  thumbnail_path = 'images/art/';

  private store = inject(Store);

  art$: Observable<IArt[]>;
  artists$: Observable<IArtist[]>;
  jobs$: Observable<IJob[]>;

  private readonly destroy$ = new Subject<void>();

  constructor(private router: Router) {
    this.art$ = this.store.select(selectArt);
    this.artists$ = this.store.select(selectArtists);
    this.jobs$ = this.store.select(selectJobs);
  }

  loadData(dataObservable: Observable<any>, action: any, refresh: boolean = true) {
    dataObservable.pipe(take(1)).subscribe((data) => {
      if (refresh || !data || data.length === 0) {
        this.store.dispatch(() => action());
      }
    });
  }

  ngOnInit(): void {
    this.loadData(this.art$, CoreDataActions.loadAllData, true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
