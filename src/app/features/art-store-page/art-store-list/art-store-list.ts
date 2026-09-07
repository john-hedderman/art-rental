import { Component, inject, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { Card } from '../../../shared/components/card/card';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { selectArt } from '../../../core/+state/core.selectors';
import { IArt } from '../../../model/models';
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
  private router = inject(Router);

  art$: Observable<IArt[]>;

  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.art$ = this.store.select(selectArt);
  }

  ngOnInit(): void {
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
